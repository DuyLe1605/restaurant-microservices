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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventPublisher eventPublisher;

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
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(UserConstants.MSG_USER_NOT_FOUND + id));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException(UserConstants.MSG_OLD_PASSWORD_INCORRECT);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw new BadRequestException(UserConstants.MSG_CANNOT_DELETE_SELF);
        }

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException(UserConstants.MSG_USER_NOT_FOUND + id);
        }

        userRepository.deleteById(id);
        eventPublisher.publishUserDeleted(id);
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
