package com.restaurant.auth.dto;

import com.restaurant.auth.constant.AuthConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Size(min = AuthConstants.MIN_USERNAME_LENGTH, max = AuthConstants.MAX_USERNAME_LENGTH,
            message = "Username must be between {min} and {max} characters")
    @Pattern(regexp = AuthConstants.USERNAME_REGEX, message = AuthConstants.USERNAME_REGEX_MSG)
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe;
}
