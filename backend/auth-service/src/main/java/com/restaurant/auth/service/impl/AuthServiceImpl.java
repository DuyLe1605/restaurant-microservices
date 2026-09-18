package com.restaurant.auth.service.impl;

import com.restaurant.auth.constant.AuthConstants;
import com.restaurant.auth.dto.*;
import com.restaurant.auth.entity.AuditLog;
import com.restaurant.auth.entity.User;
import com.restaurant.auth.exception.BadRequestException;
import com.restaurant.auth.exception.ConflictException;
import com.restaurant.auth.exception.ResourceNotFoundException;
import com.restaurant.auth.exception.UnauthorizedException;
import com.restaurant.auth.messaging.AuthEventPublisher;
import com.restaurant.auth.messaging.UserEventDto;
import com.restaurant.auth.repository.AuditLogRepository;
import com.restaurant.auth.repository.UserRepository;
import com.restaurant.auth.service.AuthService;
import com.restaurant.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthEventPublisher eventPublisher;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException(AuthConstants.MSG_INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException(AuthConstants.MSG_INVALID_CREDENTIALS);
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new UnauthorizedException(AuthConstants.MSG_ACCOUNT_DISABLED);
        }

        String accessToken = jwtService.generateToken(user, request.isRememberMe());
        String refreshToken = jwtService.generateRefreshToken(user);

        // Audit Log
        AuditLog auditLog = AuditLog.builder()
                .userId(user.getId())
                .action(AuthConstants.ACTION_LOGIN_SUCCESS)
                .target(AuthConstants.TARGET_AUTH)
                .detail("User logged in: " + user.getUsername())
                .build();
        auditLogRepository.save(auditLog);

        // RabbitMQ event
        eventPublisher.publishUserLogin(mapToEvent(user, "LOGIN"));

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(mapToDto(user))
                .build();
    }

    @Override
    @Transactional
    public UserDto register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException(AuthConstants.MSG_PASSWORDS_DO_NOT_MATCH);
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException(AuthConstants.MSG_USER_ALREADY_EXISTS + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullname(request.getFullname())
                .role(request.getRole())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Audit Log
        AuditLog auditLog = AuditLog.builder()
                .userId(savedUser.getId())
                .action(AuthConstants.ACTION_REGISTER)
                .target(AuthConstants.TARGET_AUTH)
                .detail("Registered new user: " + savedUser.getUsername() + " with role: " + savedUser.getRole())
                .build();
        auditLogRepository.save(auditLog);

        // RabbitMQ event to sync with user-service
        eventPublisher.publishUserCreated(mapToEvent(savedUser, "CREATED"));

        return mapToDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto verifyToken(String token) {
        if (!jwtService.validateToken(token)) {
            throw new UnauthorizedException(AuthConstants.MSG_INVALID_TOKEN);
        }

        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(AuthConstants.MSG_USER_NOT_FOUND + username));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new UnauthorizedException(AuthConstants.MSG_ACCOUNT_DISABLED);
        }

        return mapToDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.validateToken(refreshToken)) {
            throw new UnauthorizedException(AuthConstants.MSG_INVALID_TOKEN);
        }

        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(AuthConstants.MSG_USER_NOT_FOUND + username));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new UnauthorizedException(AuthConstants.MSG_ACCOUNT_DISABLED);
        }

        String newAccessToken = jwtService.generateToken(user, false);

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken)
                .user(mapToDto(user))
                .build();
    }

    @Override
    public void logout(String token) {
        log.info("User logged out successfully");
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserEventDto mapToEvent(User user, String eventType) {
        return UserEventDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .role(user.getRole())
                .active(user.getActive())
                .eventType(eventType)
                .build();
    }
}
