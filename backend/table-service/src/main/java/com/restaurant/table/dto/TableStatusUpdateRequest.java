package com.restaurant.table.dto;

import com.restaurant.table.enums.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableStatusUpdateRequest {
    @NotNull(message = "Table status is required")
    private TableStatus status;
}
