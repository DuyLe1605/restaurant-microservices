package com.restaurant.order.service.impl;

import com.restaurant.order.constant.OrderConstants;
import com.restaurant.order.dto.ExpenseCreatedEventDto;
import com.restaurant.order.dto.ExpenseRequest;
import com.restaurant.order.dto.ExpenseResponse;
import com.restaurant.order.dto.PageResponse;
import com.restaurant.order.entity.Expense;
import com.restaurant.order.exception.ResourceNotFoundException;
import com.restaurant.order.messaging.OrderEventPublisher;
import com.restaurant.order.repository.ExpenseRepository;
import com.restaurant.order.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final OrderEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> getExpenses(LocalDate start, LocalDate end, Pageable pageable) {
        Page<Expense> page = (start != null && end != null) ?
                expenseRepository.findByExpenseDateBetween(start, end, pageable) :
                expenseRepository.findAll(pageable);

        List<ExpenseResponse> list = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<ExpenseResponse>builder()
                .content(list)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Expense e = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_EXPENSE_NOT_FOUND + id));
        return mapToResponse(e);
    }

    @Override
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense e = Expense.builder()
                .expenseType(request.getExpenseType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .createdBy(request.getCreatedBy())
                .expenseDate(request.getExpenseDate())
                .build();

        Expense saved = expenseRepository.save(e);

        // Publish event for report-service
        eventPublisher.publishExpenseCreated(ExpenseCreatedEventDto.builder()
                .id(saved.getId())
                .expenseType(saved.getExpenseType())
                .amount(saved.getAmount())
                .expenseDate(saved.getExpenseDate())
                .build());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense e = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_EXPENSE_NOT_FOUND + id));

        e.setExpenseType(request.getExpenseType());
        e.setAmount(request.getAmount());
        e.setDescription(request.getDescription());
        e.setExpenseDate(request.getExpenseDate());

        Expense updated = expenseRepository.save(e);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException(OrderConstants.MSG_EXPENSE_NOT_FOUND + id);
        }
        expenseRepository.deleteById(id);
    }

    private ExpenseResponse mapToResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .expenseType(e.getExpenseType())
                .amount(e.getAmount())
                .description(e.getDescription())
                .createdBy(e.getCreatedBy())
                .expenseDate(e.getExpenseDate())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
