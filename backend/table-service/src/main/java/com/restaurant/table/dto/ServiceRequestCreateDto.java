package com.restaurant.table.dto;

import com.restaurant.table.enums.ServiceRequestType;
import lombok.Data;

@Data
public class ServiceRequestCreateDto {
    private String tableNumber;
    private ServiceRequestType type;
    private String note;
}
