package com.restaurant.user.service;

import com.restaurant.user.dto.*;
import com.restaurant.user.enums.Role;
import org.springframework.data.domain.Pageable;

public interface UserService {
    PageResponse<UserResponse> getUsers(String search, Role role, Boolean active, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void changePassword(Long id, ChangePasswordRequest request);
    void deleteUser(Long id, Long currentUserId);
    long countActiveUsers();
}
