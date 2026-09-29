package com.restaurant.order.messaging;

import com.restaurant.order.constant.OrderConstants;
import com.restaurant.order.dto.ExpenseCreatedEventDto;
import com.restaurant.order.dto.OrderCompletedEventDto;
import com.restaurant.order.dto.OrderPaidEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(Long orderId) {
        try {
            rabbitTemplate.convertAndSend(OrderConstants.EXCHANGE_NAME, OrderConstants.ROUTING_KEY_ORDER_CREATED, orderId);
            log.info("Published order.created event for id: {}", orderId);
        } catch (Exception e) {
            log.error("Failed to publish order.created event: {}", e.getMessage());
        }
    }

    public void publishOrderCompleted(OrderCompletedEventDto event) {
        try {
            rabbitTemplate.convertAndSend(OrderConstants.EXCHANGE_NAME, OrderConstants.ROUTING_KEY_ORDER_COMPLETED, event);
            log.info("Published order.completed event for id: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish order.completed event: {}", e.getMessage());
        }
    }

    public void publishOrderPaid(OrderPaidEventDto event) {
        try {
            rabbitTemplate.convertAndSend(OrderConstants.EXCHANGE_NAME, OrderConstants.ROUTING_KEY_ORDER_PAID, event);
            log.info("Published order.paid event for id: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish order.paid event: {}", e.getMessage());
        }
    }

    public void publishOrderCancelled(Long orderId) {
        try {
            rabbitTemplate.convertAndSend(OrderConstants.EXCHANGE_NAME, OrderConstants.ROUTING_KEY_ORDER_CANCELLED, orderId);
            log.info("Published order.cancelled event for id: {}", orderId);
        } catch (Exception e) {
            log.error("Failed to publish order.cancelled event: {}", e.getMessage());
        }
    }

    public void publishExpenseCreated(ExpenseCreatedEventDto event) {
        try {
            rabbitTemplate.convertAndSend(OrderConstants.EXCHANGE_NAME, OrderConstants.ROUTING_KEY_EXPENSE_CREATED, event);
            log.info("Published expense.created event for id: {}", event.getId());
        } catch (Exception e) {
            log.error("Failed to publish expense.created event: {}", e.getMessage());
        }
    }
}
