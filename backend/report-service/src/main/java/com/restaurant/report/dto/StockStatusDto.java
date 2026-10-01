package com.restaurant.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockStatusDto {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal currentQty;
    private Integer minStock;
    private String unit;
    private String statusLevel; // CRITICAL, WARNING, NORMAL
}
