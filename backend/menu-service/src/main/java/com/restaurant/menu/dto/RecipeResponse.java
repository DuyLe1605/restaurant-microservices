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
public class RecipeResponse {
    private Long id;
    private Long menuId;
    private Long ingredientId;
    private BigDecimal qty;
    private String ingredientName;
    private String unit;
}
