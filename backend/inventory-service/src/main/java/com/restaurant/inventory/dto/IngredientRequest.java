package com.restaurant.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientRequest {

    @NotBlank(message = "Code is required")
    @Size(max = 50, message = "Code cannot exceed 50 characters")
    private String code;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit cannot exceed 20 characters")
    private String unit;

    @DecimalMin(value = "0.0", message = "Purchase price must be positive")
    private BigDecimal purchasePrice;

    @Min(value = 0, message = "Min stock must be non-negative")
    @Builder.Default
    private Integer minStock = 0;

    private String description;

    @Size(max = 100, message = "Main supplier cannot exceed 100 characters")
    private String mainSupplier;
}
