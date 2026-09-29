package com.restaurant.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private String expenseType;
    private BigDecimal amount;
    private String description;
    private Long createdBy;
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
}
