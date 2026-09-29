package com.restaurant.table.dto;

import com.restaurant.table.enums.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private String number;
    private Integer capacity;
    private TableStatus status;
    private String orderToken;
    private LocalDateTime createdAt;
}
