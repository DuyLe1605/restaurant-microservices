package com.restaurant.inventory.client;

import com.restaurant.inventory.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service")
public interface OrderExpenseClient {

    @PostMapping("/api/expenses")
    ApiResponse<Object> createExpense(@RequestBody ExpenseCreateDto request);
}
