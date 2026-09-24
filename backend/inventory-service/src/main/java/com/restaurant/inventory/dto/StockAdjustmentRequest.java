package com.restaurant.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {
    @NotNull
    private Long ingredientId;
    @NotNull
    private BigDecimal newQty;
    @NotNull
    private LocalDate adjustDate;
    private String reason;
    private String note;
    private Long adjustedBy;
}
