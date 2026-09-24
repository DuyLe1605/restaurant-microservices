package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientStockDto {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal stock;
    private String unit;
}
