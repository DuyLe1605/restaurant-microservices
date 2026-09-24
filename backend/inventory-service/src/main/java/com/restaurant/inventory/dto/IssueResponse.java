package com.restaurant.inventory.dto;

import com.restaurant.inventory.enums.IssueStatus;
import com.restaurant.inventory.enums.IssueType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueResponse {
    private Long id;
    private Long createdBy;
    private IssueType issueType;
    private LocalDate issueDate;
    private IssueStatus status;
    private String note;
    private List<IssueDetailDto> items;
    private LocalDateTime createdAt;
}
