package com.restaurant.auth.controller;

import com.restaurant.auth.constant.AuthConstants;
import com.restaurant.auth.dto.*;
import com.restaurant.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, AuthConstants.MSG_LOGIN_SUCCESS));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, AuthConstants.MSG_REGISTRATION_SUCCESS));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<UserDto>> verify(
            @RequestHeader(value = AuthConstants.AUTH_HEADER, required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith(AuthConstants.TOKEN_PREFIX)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserDto>builder()
                            .success(false)
                            .message(AuthConstants.MSG_INVALID_TOKEN)
                            .build());
        }
        String token = authHeader.substring(AuthConstants.TOKEN_PREFIX.length());
        UserDto userDto = authService.verifyToken(token);
        return ResponseEntity.ok(ApiResponse.ok(userDto, AuthConstants.MSG_TOKEN_VALID));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok(response, AuthConstants.MSG_TOKEN_REFRESHED));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = AuthConstants.AUTH_HEADER, required = false) String authHeader) {
        String token = (authHeader != null && authHeader.startsWith(AuthConstants.TOKEN_PREFIX))
                ? authHeader.substring(AuthConstants.TOKEN_PREFIX.length()) : null;
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.ok(AuthConstants.MSG_LOGOUT_SUCCESS));
    }

    @PostMapping("/internal/sync-user")
    public ResponseEntity<ApiResponse<Void>> syncUser(@RequestBody AuthSyncDto dto) {
        authService.syncUser(dto);
        return ResponseEntity.ok(ApiResponse.ok("User synchronized"));
    }

    @PutMapping("/internal/sync-password")
    public ResponseEntity<ApiResponse<Void>> syncPassword(@RequestBody AuthSyncDto dto) {
        authService.syncPassword(dto.getUsername(), dto.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password synchronized"));
    }

    @DeleteMapping("/internal/sync-user/{username}")
    public ResponseEntity<ApiResponse<Void>> syncDelete(@PathVariable String username) {
        authService.syncDelete(username);
        return ResponseEntity.ok(ApiResponse.ok("User deleted"));
    }
}
