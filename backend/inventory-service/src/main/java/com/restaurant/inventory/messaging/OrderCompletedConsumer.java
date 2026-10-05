package com.restaurant.inventory.messaging;

import com.restaurant.inventory.client.MenuClient;
import com.restaurant.inventory.client.RecipeResponseDto;
import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.ApiResponse;
import com.restaurant.inventory.dto.OrderCompletedEventDto;
import com.restaurant.inventory.dto.OrderItemEventDto;
import com.restaurant.inventory.dto.StockSnapshotEventDto;
import com.restaurant.inventory.entity.Ingredient;
import com.restaurant.inventory.entity.InventoryIssue;
import com.restaurant.inventory.entity.InventoryIssueDetail;
import com.restaurant.inventory.entity.InventoryLog;
import com.restaurant.inventory.enums.InventoryLogType;
import com.restaurant.inventory.enums.IssueStatus;
import com.restaurant.inventory.enums.IssueType;
import com.restaurant.inventory.repository.IngredientRepository;
import com.restaurant.inventory.repository.InventoryIssueDetailRepository;
import com.restaurant.inventory.repository.InventoryIssueRepository;
import com.restaurant.inventory.repository.InventoryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCompletedConsumer {

    private final MenuClient menuClient;
    private final InventoryIssueRepository issueRepository;
    private final InventoryIssueDetailRepository issueDetailRepository;
    private final InventoryLogRepository logRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryEventPublisher eventPublisher;

    @RabbitListener(queues = InventoryConstants.QUEUE_ORDER_COMPLETED)
    @Transactional
    public void handleOrderCompleted(OrderCompletedEventDto event) {
        log.info("Received order.completed event for order id: {}", event.getOrderId());
        if (event.getItems() == null || event.getItems().isEmpty()) {
            return;
        }

        // Idempotency check: prevent duplicate stock deduction if message delivered twice
        String orderTag = "order #" + event.getOrderId();
        if (issueRepository.existsByOrderTag(orderTag)) {
            log.warn("Order completed event for order #{} has already been processed. Deduplication check triggered: skipping to prevent duplicate inventory deduction.", event.getOrderId());
            return;
        }

        // 1. Create completed InventoryIssue
        InventoryIssue issue = InventoryIssue.builder()
                .issueType(IssueType.SALE)
                .issueDate(LocalDate.now())
                .status(IssueStatus.COMPLETED)
                .note("Auto issue from completed " + orderTag)
                .build();
        InventoryIssue savedIssue = issueRepository.save(issue);

        // 2. Fetch recipes from menu-service and issue stock
        for (OrderItemEventDto item : event.getItems()) {
            try {
                ApiResponse<List<RecipeResponseDto>> recipeResp = menuClient.getRecipesByMenuId(item.getMenuId());
                if (recipeResp != null && recipeResp.getData() != null) {
                    for (RecipeResponseDto recipe : recipeResp.getData()) {
                        BigDecimal qtyToDeduct = recipe.getQty().multiply(BigDecimal.valueOf(item.getQty()));

                        // Save issue detail
                        InventoryIssueDetail detail = InventoryIssueDetail.builder()
                                .issueId(savedIssue.getId())
                                .ingredientId(recipe.getIngredientId())
                                .qty(qtyToDeduct)
                                .build();
                        issueDetailRepository.save(detail);

                        // Save negative inventory log
                        InventoryLog invLog = InventoryLog.builder()
                                .ingredientId(recipe.getIngredientId())
                                .qtyChange(qtyToDeduct.negate())
                                .type(InventoryLogType.ISSUE)
                                .relatedId(savedIssue.getId())
                                .note("Auto deduction for order #" + event.getOrderId())
                                .build();
                        logRepository.save(invLog);

                        // Broadcast stock update
                        broadcastStock(recipe.getIngredientId());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to deduct ingredients for menuId {}: {}", item.getMenuId(), e.getMessage());
            }
        }
    }

    private void broadcastStock(Long ingredientId) {
        Ingredient ing = ingredientRepository.findById(ingredientId).orElse(null);
        if (ing != null) {
            BigDecimal currentStock = logRepository.calculateStock(ingredientId);
            eventPublisher.publishStockUpdated(StockSnapshotEventDto.builder()
                    .ingredientId(ing.getId())
                    .ingredientName(ing.getName())
                    .currentQty(currentStock)
                    .minStock(ing.getMinStock())
                    .unit(ing.getUnit())
                    .snapshotDate(LocalDate.now())
                    .build());
        }
    }
}
