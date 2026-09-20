package com.restaurant.user.messaging;

import com.restaurant.user.constant.UserConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserUpdated(UserEventDto event) {
        try {
            rabbitTemplate.convertAndSend(UserConstants.EXCHANGE_NAME, UserConstants.ROUTING_KEY_USER_UPDATED, event);
            log.info("Published user.updated event for user id: {}", event.getId());
        } catch (Exception e) {
            log.error("Failed to publish user.updated event: {}", e.getMessage());
        }
    }

    public void publishUserDeleted(Long userId) {
        try {
            rabbitTemplate.convertAndSend(UserConstants.EXCHANGE_NAME, UserConstants.ROUTING_KEY_USER_DELETED, userId);
            log.info("Published user.deleted event for user id: {}", userId);
        } catch (Exception e) {
            log.error("Failed to publish user.deleted event: {}", e.getMessage());
        }
    }
}
