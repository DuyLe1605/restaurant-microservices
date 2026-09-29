package com.restaurant.table.dto;

import com.restaurant.table.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long tableId;
    private String tableNumber;
    private String customerName;
    private String customerPhone;
    private Integer partySize;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;
    private Long createdBy;
    private String note;
    private LocalDateTime createdAt;
}
