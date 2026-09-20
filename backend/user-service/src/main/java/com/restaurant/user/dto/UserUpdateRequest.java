package com.restaurant.user.dto;

import com.restaurant.user.constant.UserConstants;
import com.restaurant.user.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "Fullname is required")
    @Size(max = UserConstants.MAX_FULLNAME_LENGTH, message = "Fullname cannot exceed {max} characters")
    private String fullname;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Active status is required")
    private Boolean active;
}
