package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.*;
import org.springframework.data.domain.Pageable;

public interface InventoryIssueService {
    PageResponse<IssueResponse> getIssues(Pageable pageable);
    IssueResponse getIssueById(Long id);
    IssueResponse createManualIssue(IssueRequest request);
}
