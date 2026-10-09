package com.restaurant.user.service.impl;

import com.restaurant.user.constant.UserConstants;
import com.restaurant.user.dto.*;
import com.restaurant.user.entity.User;
import com.restaurant.user.enums.Role;
import com.restaurant.user.exception.BadRequestException;
import com.restaurant.user.exception.ConflictException;
import com.restaurant.user.exception.ResourceNotFoundException;
import com.restaurant.user.messaging.UserEventDto;
import com.restaurant.user.messaging.UserEventPublisher;
import com.restaurant.user.repository.UserRepository;
import com.restaurant.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventPublisher eventPublisher;
    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(String search, Role role, Boolean active, Pageable pageable) {
        Page<User> page = userRepository.searchUsers(search, role, active, pageable);
        List<UserResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<UserResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MSG_USER_NOT_FOUND + id));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException(UserConstants.MSG_USERNAME_TAKEN + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullname(request.getFullname())
                .role(request.getRole())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        User savedUser = userRepository.save(user);

        // Sync new user to auth_db immediately
        syncToAuthService(savedUser.getUsername(), savedUser.getPassword(), savedUser.getFullname(), savedUser.getRole().name(), savedUser.getActive());

        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MSG_USER_NOT_FOUND + id));

        user.setFullname(request.getFullname());
        user.setRole(request.getRole());
        user.setActive(request.getActive());

        User updatedUser = userRepository.save(user);

        // Sync updated profile to auth_db
        syncToAuthService(updatedUser.getUsername(), null, updatedUser.getFullname(), updatedUser.getRole().name(), updatedUser.getActive());

        // Publish user.updated event
        eventPublisher.publishUserUpdated(UserEventDto.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .fullname(updatedUser.getFullname())
                .role(updatedUser.getRole())
                .active(updatedUser.getActive())
                .eventType("UPDATED")
                .build());

        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request, String currentUserRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MSG_USER_NOT_FOUND + id));

        // If not ADMIN, require valid currentPassword
        if (!"ADMIN".equalsIgnoreCase(currentUserRole)) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new BadRequestException("Vui lòng cung cấp mật khẩu hiện tại");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException(UserConstants.MSG_OLD_PASSWORD_INCORRECT);
            }
        }

        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);

        // Sync new password to auth_db immediately
        syncPasswordToAuthService(user.getUsername(), encodedNewPassword);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw new BadRequestException(UserConstants.MSG_CANNOT_DELETE_SELF);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MSG_USER_NOT_FOUND + id));

        String username = user.getUsername();
        userRepository.deleteById(id);
        eventPublisher.publishUserDeleted(id);

        // Sync deletion to auth_db
        syncDeleteToAuthService(username);
    }

    private void syncToAuthService(String username, String encodedPassword, String fullname, String role, Boolean active) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("username", username);
            payload.put("password", encodedPassword);
            payload.put("fullname", fullname);
            payload.put("role", role);
            payload.put("active", active);
            restTemplate.postForObject(authServiceUrl + "/api/auth/internal/sync-user", payload, Object.class);
            log.info("Successfully synced user '{}' to auth-service", username);
        } catch (Exception e) {
            log.warn("Failed to sync user '{}' to auth-service: {}", username, e.getMessage());
        }
    }

    private void syncPasswordToAuthService(String username, String encodedPassword) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("username", username);
            payload.put("password", encodedPassword);
            restTemplate.put(authServiceUrl + "/api/auth/internal/sync-password", payload);
            log.info("Successfully synced new password for user '{}' to auth-service", username);
        } catch (Exception e) {
            log.warn("Failed to sync password for user '{}' to auth-service: {}", username, e.getMessage());
        }
    }

    private void syncDeleteToAuthService(String username) {
        try {
            restTemplate.delete(authServiceUrl + "/api/auth/internal/sync-user/" + username);
            log.info("Successfully synced deletion of user '{}' to auth-service", username);
        } catch (Exception e) {
            log.warn("Failed to sync deletion of user '{}' to auth-service: {}", username, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long countActiveUsers() {
        return userRepository.countByActiveTrue();
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
