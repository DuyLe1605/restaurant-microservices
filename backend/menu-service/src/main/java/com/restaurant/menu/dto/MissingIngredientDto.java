package com.restaurant.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissingIngredientDto {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal needed;
    private BigDecimal available;
    private String unit;
}
