package com.restaurant.inventory.controller;

import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.service.InventoryIssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/issues")
@RequiredArgsConstructor
public class InventoryIssueController {

    private final InventoryIssueService issueService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<IssueResponse>>> getIssues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "issueDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<IssueResponse> response = issueService.getIssues(pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched issues"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> getIssueById(@PathVariable Long id) {
        IssueResponse response = issueService.getIssueById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Issue found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IssueResponse>> createManualIssue(@Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.createManualIssue(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Inventory issue created and deducted"));
    }
}
