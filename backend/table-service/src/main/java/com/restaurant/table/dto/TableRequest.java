package com.restaurant.table.dto;

import com.restaurant.table.constant.TableConstants;
import com.restaurant.table.enums.TableStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableRequest {

    @NotBlank(message = "Table number is required")
    @Size(max = TableConstants.MAX_TABLE_NUMBER_LENGTH, message = "Table number cannot exceed {max} characters")
    private String number;

    @Min(value = TableConstants.MIN_CAPACITY, message = "Capacity must be at least {value}")
    @Max(value = TableConstants.MAX_CAPACITY, message = "Capacity cannot exceed {value}")
    @Builder.Default
    private Integer capacity = TableConstants.DEFAULT_CAPACITY;

    @Builder.Default
    private TableStatus status = TableStatus.FREE;
}
