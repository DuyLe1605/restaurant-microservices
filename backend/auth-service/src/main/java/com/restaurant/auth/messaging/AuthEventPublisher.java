package com.restaurant.auth.messaging;

import com.restaurant.auth.constant.AuthConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserCreated(UserEventDto event) {
        try {
            rabbitTemplate.convertAndSend(AuthConstants.EXCHANGE_NAME, AuthConstants.ROUTING_KEY_USER_CREATED, event);
            log.info("Published user.created event for username: {}", event.getUsername());
        } catch (Exception e) {
            log.error("Failed to publish user.created event: {}", e.getMessage());
        }
    }

    public void publishUserLogin(UserEventDto event) {
        try {
            rabbitTemplate.convertAndSend(AuthConstants.EXCHANGE_NAME, AuthConstants.ROUTING_KEY_USER_LOGIN, event);
            log.info("Published user.login event for username: {}", event.getUsername());
        } catch (Exception e) {
            log.error("Failed to publish user.login event: {}", e.getMessage());
        }
    }
}
