package com.restaurant.table.dto;

import com.restaurant.table.constant.TableConstants;
import com.restaurant.table.enums.ReservationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {

    @NotNull(message = "Table ID is required")
    private Long tableId;

    @NotBlank(message = "Customer name is required")
    @Size(max = TableConstants.MAX_CUSTOMER_NAME_LENGTH, message = "Customer name cannot exceed {max} characters")
    private String customerName;

    @Size(max = TableConstants.MAX_PHONE_LENGTH, message = "Customer phone cannot exceed {max} characters")
    private String customerPhone;

    @Min(value = 1, message = "Party size must be at least 1")
    @Builder.Default
    private Integer partySize = 1;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    private Long createdBy;
    private String note;
}
