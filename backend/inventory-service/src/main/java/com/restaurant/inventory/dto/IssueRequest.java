package com.restaurant.inventory.dto;

import com.restaurant.inventory.enums.IssueType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class IssueRequest {
    private Long createdBy;

    @NotNull(message = "Issue type is required")
    private IssueType issueType;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    private String note;

    @NotEmpty(message = "Issue must contain at least one item")
    @Valid
    private List<IssueDetailDto> items;
}
