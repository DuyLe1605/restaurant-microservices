package com.restaurant.inventory.client;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseCreateDto {
    private String expenseType;
    private BigDecimal amount;
    private String description;
    private Long createdBy;
    private LocalDate expenseDate;
}
