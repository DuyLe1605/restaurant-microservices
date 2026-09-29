package com.restaurant.order.service;

import com.restaurant.order.dto.ExpenseRequest;
import com.restaurant.order.dto.ExpenseResponse;
import com.restaurant.order.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ExpenseService {
    PageResponse<ExpenseResponse> getExpenses(LocalDate start, LocalDate end, Pageable pageable);
    ExpenseResponse getExpenseById(Long id);
    ExpenseResponse createExpense(ExpenseRequest request);
    ExpenseResponse updateExpense(Long id, ExpenseRequest request);
    void deleteExpense(Long id);
}
