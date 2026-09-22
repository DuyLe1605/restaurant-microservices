package com.restaurant.menu.dto;

import com.restaurant.menu.constant.MenuConstants;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequest {

    @NotBlank(message = "Code is required")
    @Size(min = MenuConstants.MIN_CODE_LENGTH, max = MenuConstants.MAX_CODE_LENGTH,
            message = "Code must be between {min} and {max} characters")
    private String code;

    @NotBlank(message = "Name is required")
    @Size(min = MenuConstants.MIN_NAME_LENGTH, max = MenuConstants.MAX_NAME_LENGTH,
            message = "Name must be between {min} and {max} characters")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = MenuConstants.MIN_PRICE_STR, message = "Price must be non-negative")
    @DecimalMax(value = MenuConstants.MAX_PRICE_STR, message = "Price exceeds maximum allowable value")
    private BigDecimal price;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    private String description;

    private String imageUrl;

    @Builder.Default
    private Boolean active = true;
}
