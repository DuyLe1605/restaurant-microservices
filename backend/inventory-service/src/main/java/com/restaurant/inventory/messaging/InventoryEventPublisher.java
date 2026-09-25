package com.restaurant.inventory.messaging;

import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.StockSnapshotEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishStockUpdated(StockSnapshotEventDto event) {
        try {
            rabbitTemplate.convertAndSend(InventoryConstants.EXCHANGE_NAME, InventoryConstants.ROUTING_KEY_STOCK_UPDATED, event);
            log.info("Published inventory.stock.updated event for ingredient id: {}", event.getIngredientId());
        } catch (Exception e) {
            log.error("Failed to publish stock updated event: {}", e.getMessage());
        }
    }
}
