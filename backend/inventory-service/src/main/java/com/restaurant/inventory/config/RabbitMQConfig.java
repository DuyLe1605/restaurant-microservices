package com.restaurant.inventory.config;

import com.restaurant.inventory.constant.InventoryConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange restaurantExchange() {
        return new TopicExchange(InventoryConstants.EXCHANGE_NAME);
    }

    @Bean
    public Queue orderCompletedQueue() {
        return new Queue(InventoryConstants.QUEUE_ORDER_COMPLETED, true);
    }

    @Bean
    public Binding orderCompletedBinding(Queue orderCompletedQueue, TopicExchange restaurantExchange) {
        return BindingBuilder.bind(orderCompletedQueue).to(restaurantExchange).with(InventoryConstants.ROUTING_KEY_ORDER_COMPLETED);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
