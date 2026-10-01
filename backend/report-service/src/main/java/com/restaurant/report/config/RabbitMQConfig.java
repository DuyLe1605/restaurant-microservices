package com.restaurant.report.config;

import com.restaurant.report.constant.ReportConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange restaurantExchange() {
        return new TopicExchange(ReportConstants.EXCHANGE_NAME);
    }

    @Bean
    public Queue reportOrderPaidQueue() {
        return new Queue(ReportConstants.QUEUE_REPORT_ORDER_PAID, true);
    }

    @Bean
    public Binding reportOrderPaidBinding(Queue reportOrderPaidQueue, TopicExchange restaurantExchange) {
        return BindingBuilder.bind(reportOrderPaidQueue).to(restaurantExchange).with(ReportConstants.ROUTING_KEY_ORDER_PAID);
    }

    @Bean
    public Queue reportExpenseCreatedQueue() {
        return new Queue(ReportConstants.QUEUE_REPORT_EXPENSE_CREATED, true);
    }

    @Bean
    public Binding reportExpenseCreatedBinding(Queue reportExpenseCreatedQueue, TopicExchange restaurantExchange) {
        return BindingBuilder.bind(reportExpenseCreatedQueue).to(restaurantExchange).with(ReportConstants.ROUTING_KEY_EXPENSE_CREATED);
    }

    @Bean
    public Queue reportStockUpdatedQueue() {
        return new Queue(ReportConstants.QUEUE_REPORT_STOCK_UPDATED, true);
    }

    @Bean
    public Binding reportStockUpdatedBinding(Queue reportStockUpdatedQueue, TopicExchange restaurantExchange) {
        return BindingBuilder.bind(reportStockUpdatedQueue).to(restaurantExchange).with(ReportConstants.ROUTING_KEY_STOCK_UPDATED);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
