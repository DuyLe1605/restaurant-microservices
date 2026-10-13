package com.restaurant.table.dto;

import com.restaurant.table.enums.ServiceRequestStatus;
import com.restaurant.table.enums.ServiceRequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestDto {
    private Long id;
    private String tableNumber;
    private ServiceRequestType type;
    private String typeLabel;
    private String note;
    private ServiceRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
