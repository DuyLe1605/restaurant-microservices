package com.restaurant.report.dto;

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
public class DailyRevenueDto {
    private LocalDate date;
    private BigDecimal revenue;
    private BigDecimal expense;
    private BigDecimal profit;
    private long orderCount;
}
