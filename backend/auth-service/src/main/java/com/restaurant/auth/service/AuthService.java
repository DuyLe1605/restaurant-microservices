package com.restaurant.auth.service;

import com.restaurant.auth.dto.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserDto register(RegisterRequest request);
    UserDto verifyToken(String token);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String token);
    void syncUser(AuthSyncDto dto);
    void syncPassword(String username, String newPassword);
    void syncDelete(String username);
}
