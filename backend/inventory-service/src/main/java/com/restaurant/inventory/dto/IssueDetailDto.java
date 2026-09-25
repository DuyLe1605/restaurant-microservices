package com.restaurant.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueDetailDto {
    private Long id;

    @NotNull(message = "Ingredient ID is required")
    private Long ingredientId;

    private String ingredientName;
    private String unit;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal qty;
}
