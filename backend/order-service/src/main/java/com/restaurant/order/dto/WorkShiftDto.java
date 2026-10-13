package com.restaurant.order.dto;

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
public class WorkShiftDto {
    private Long id;
    private String shiftCode;
    private String cashierName;
    private Long cashierId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private BigDecimal openingCash;
    private BigDecimal cashSales;
    private BigDecimal cardSales;
    private BigDecimal totalSales;
    private Integer orderCount;
    private BigDecimal expectedCash;
    private BigDecimal actualCash;
    private BigDecimal difference;
    private String handoverNote;
    private LocalDateTime createdAt;
}

