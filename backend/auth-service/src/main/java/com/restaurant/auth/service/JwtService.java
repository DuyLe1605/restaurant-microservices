package com.restaurant.auth.service;

import com.restaurant.auth.entity.User;
import io.jsonwebtoken.Claims;

public interface JwtService {
    String generateToken(User user, boolean rememberMe);
    String generateRefreshToken(User user);
    boolean validateToken(String token);
    String extractUsername(String token);
    Claims extractAllClaims(String token);
}
