package com.restaurant.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientCategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name cannot exceed 100 characters")
    private String name;

    private String description;
}
