package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockSnapshotEventDto implements Serializable {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal currentQty;
    private Integer minStock;
    private String unit;
    private LocalDate snapshotDate;
}
