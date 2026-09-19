package com.restaurant.auth.dto;

import com.restaurant.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String fullname;
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;
}
