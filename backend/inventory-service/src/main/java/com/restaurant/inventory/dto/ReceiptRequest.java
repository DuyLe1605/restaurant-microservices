package com.restaurant.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptRequest {
    private Long createdBy;

    @Size(max = 100, message = "Supplier cannot exceed 100 characters")
    private String supplier;

    @NotNull(message = "Receipt date is required")
    private LocalDate receiptDate;

    private String note;

    @NotEmpty(message = "Receipt must contain at least one item")
    @Valid
    private List<ReceiptDetailDto> items;
}
