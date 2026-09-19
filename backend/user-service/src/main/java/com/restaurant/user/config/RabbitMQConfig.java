package com.restaurant.user.config;

import com.restaurant.user.constant.UserConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange restaurantExchange() {
        return new TopicExchange(UserConstants.EXCHANGE_NAME);
    }

    @Bean
    public Queue userSyncQueue() {
        return new Queue(UserConstants.QUEUE_USER_SYNC, true);
    }

    @Bean
    public Binding userSyncBinding(Queue userSyncQueue, TopicExchange restaurantExchange) {
        return BindingBuilder.bind(userSyncQueue).to(restaurantExchange).with(UserConstants.ROUTING_KEY_USER_CREATED);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
