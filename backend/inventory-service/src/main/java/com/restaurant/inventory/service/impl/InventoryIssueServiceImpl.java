package com.restaurant.inventory.service.impl;

import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.entity.*;
import com.restaurant.inventory.enums.InventoryLogType;
import com.restaurant.inventory.enums.IssueStatus;
import com.restaurant.inventory.exception.BadRequestException;
import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.messaging.InventoryEventPublisher;
import com.restaurant.inventory.repository.*;
import com.restaurant.inventory.service.InventoryIssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryIssueServiceImpl implements InventoryIssueService {

    private final InventoryIssueRepository issueRepository;
    private final InventoryIssueDetailRepository detailRepository;
    private final InventoryLogRepository logRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<IssueResponse> getIssues(Pageable pageable) {
        Page<InventoryIssue> page = issueRepository.findAll(pageable);
        List<IssueResponse> list = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<IssueResponse>builder()
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
    public IssueResponse getIssueById(Long id) {
        InventoryIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_ISSUE_NOT_FOUND + id));
        return mapToResponse(issue);
    }

    @Override
    @Transactional
    public IssueResponse createManualIssue(IssueRequest request) {
        // Check stock availability
        for (IssueDetailDto item : request.getItems()) {
            BigDecimal currentStock = logRepository.calculateStock(item.getIngredientId());
            if (currentStock.compareTo(item.getQty()) < 0) {
                Ingredient ing = ingredientRepository.findById(item.getIngredientId()).orElse(null);
                String name = (ing != null) ? ing.getName() : String.valueOf(item.getIngredientId());
                throw new BadRequestException(InventoryConstants.MSG_INSUFFICIENT_STOCK + name);
            }
        }

        InventoryIssue issue = InventoryIssue.builder()
                .createdBy(request.getCreatedBy())
                .issueType(request.getIssueType())
                .issueDate(request.getIssueDate())
                .status(IssueStatus.COMPLETED)
                .note(request.getNote())
                .build();

        InventoryIssue saved = issueRepository.save(issue);

        List<InventoryIssueDetail> details = request.getItems().stream()
                .map(item -> InventoryIssueDetail.builder()
                        .issueId(saved.getId())
                        .ingredientId(item.getIngredientId())
                        .qty(item.getQty())
                        .build())
                .toList();

        detailRepository.saveAll(details);

        // Deduct from stock
        for (IssueDetailDto item : request.getItems()) {
            InventoryLog invLog = InventoryLog.builder()
                    .ingredientId(item.getIngredientId())
                    .qtyChange(item.getQty().negate())
                    .type(InventoryLogType.ISSUE)
                    .relatedId(saved.getId())
                    .note("Manual issue #" + saved.getId())
                    .createdBy(request.getCreatedBy())
                    .build();
            logRepository.save(invLog);

            ingredientRepository.findById(item.getIngredientId()).ifPresent(ing -> {
                BigDecimal currentStock = logRepository.calculateStock(ing.getId());
                eventPublisher.publishStockUpdated(StockSnapshotEventDto.builder()
                        .ingredientId(ing.getId())
                        .ingredientName(ing.getName())
                        .currentQty(currentStock)
                        .minStock(ing.getMinStock())
                        .unit(ing.getUnit())
                        .snapshotDate(LocalDate.now())
                        .build());
            });
        }

        return mapToResponse(saved);
    }

    private IssueResponse mapToResponse(InventoryIssue issue) {
        List<InventoryIssueDetail> details = detailRepository.findByIssueId(issue.getId());
        List<IssueDetailDto> itemDtos = details.stream().map(d -> {
            Ingredient ing = ingredientRepository.findById(d.getIngredientId()).orElse(null);
            return IssueDetailDto.builder()
                    .id(d.getId())
                    .ingredientId(d.getIngredientId())
                    .ingredientName(ing != null ? ing.getName() : "Unknown")
                    .unit(ing != null ? ing.getUnit() : "")
                    .qty(d.getQty())
                    .build();
        }).toList();

        return IssueResponse.builder()
                .id(issue.getId())
                .createdBy(issue.getCreatedBy())
                .issueType(issue.getIssueType())
                .issueDate(issue.getIssueDate())
                .status(issue.getStatus())
                .note(issue.getNote())
                .items(itemDtos)
                .createdAt(issue.getCreatedAt())
                .build();
    }
}
