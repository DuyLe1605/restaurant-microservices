package com.restaurant.order.controller;

import com.restaurant.order.dto.ApiResponse;
import com.restaurant.order.dto.CustomerRequest;
import com.restaurant.order.dto.CustomerResponse;
import com.restaurant.order.dto.PageResponse;
import com.restaurant.order.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<CustomerResponse> response = customerService.getAll(
                keyword,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "currentMonthSpent"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response, "Customers fetched"));
    }

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<CustomerResponse>> lookupByPhone(@RequestParam String phone) {
        CustomerResponse response = customerService.lookupByPhone(phone);
        return ResponseEntity.ok(ApiResponse.ok(response, "Customer found"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getById(@PathVariable Long id) {
        CustomerResponse response = customerService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Customer found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> registerOrGet(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.registerOrGet(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Customer processed"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request
    ) {
        CustomerResponse response = customerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Customer updated"));
    }
}
