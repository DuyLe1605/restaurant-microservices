package com.restaurant.inventory.dto;

import com.restaurant.inventory.enums.ReceiptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptResponse {
    private Long id;
    private Long createdBy;
    private String supplier;
    private LocalDate receiptDate;
    private ReceiptStatus status;
    private String note;
    private BigDecimal totalAmount;
    private List<ReceiptDetailDto> items;
    private LocalDateTime createdAt;
}
