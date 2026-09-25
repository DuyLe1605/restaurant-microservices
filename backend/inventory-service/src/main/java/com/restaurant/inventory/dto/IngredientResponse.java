package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientResponse {
    private Long id;
    private String code;
    private String name;
    private String category;
    private String unit;
    private BigDecimal purchasePrice;
    private Integer minStock;
    private BigDecimal currentStock;
    private String description;
    private String mainSupplier;
    private LocalDateTime createdAt;
}
