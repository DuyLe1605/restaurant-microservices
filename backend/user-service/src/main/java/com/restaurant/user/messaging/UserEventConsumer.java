package com.restaurant.user.messaging;

import com.restaurant.user.constant.UserConstants;
import com.restaurant.user.entity.User;
import com.restaurant.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final UserRepository userRepository;

    @RabbitListener(queues = UserConstants.QUEUE_USER_SYNC)
    @Transactional
    public void handleUserCreated(UserEventDto event) {
        log.info("Received user.created event for username: {}", event.getUsername());
        if (event.getUsername() == null) return;

        if (!userRepository.existsByUsername(event.getUsername())) {
            User user = User.builder()
                    .id(event.getId())
                    .username(event.getUsername())
                    .password("{noop}") // Password managed in auth_db
                    .fullname(event.getFullname())
                    .role(event.getRole())
                    .active(event.getActive() != null ? event.getActive() : true)
                    .build();
            userRepository.save(user);
            log.info("Synchronized new user in user-service: {}", event.getUsername());
        }
    }
}
