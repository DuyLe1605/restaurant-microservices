package com.restaurant.report.messaging;

import com.restaurant.report.constant.ReportConstants;
import com.restaurant.report.dto.ExpenseCreatedEventDto;
import com.restaurant.report.dto.OrderPaidEventDto;
import com.restaurant.report.dto.StockSnapshotEventDto;
import com.restaurant.report.entity.ReportExpenseSummary;
import com.restaurant.report.entity.ReportOrderSummary;
import com.restaurant.report.entity.ReportStockSnapshot;
import com.restaurant.report.repository.ReportExpenseSummaryRepository;
import com.restaurant.report.repository.ReportOrderSummaryRepository;
import com.restaurant.report.repository.ReportStockSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReportEventConsumer {

    private final ReportOrderSummaryRepository orderSummaryRepository;
    private final ReportExpenseSummaryRepository expenseSummaryRepository;
    private final ReportStockSnapshotRepository stockSnapshotRepository;

    @RabbitListener(queues = ReportConstants.QUEUE_REPORT_ORDER_PAID)
    @Transactional
    public void handleOrderPaid(OrderPaidEventDto event) {
        log.info("Received order.paid event in report-service for order id: {}", event.getOrderId());
        ReportOrderSummary summary = ReportOrderSummary.builder()
                .id(event.getOrderId())
                .orderDate(event.getOrderDate())
                .totalAmount(event.getTotalAmount())
                .status(event.getStatus())
                .tableNumber(event.getTableNumber())
                .cashierName(event.getCashierName())
                .source(event.getSource())
                .build();
        orderSummaryRepository.save(summary);
    }

    @RabbitListener(queues = ReportConstants.QUEUE_REPORT_EXPENSE_CREATED)
    @Transactional
    public void handleExpenseCreated(ExpenseCreatedEventDto event) {
        log.info("Received expense.created event in report-service for expense id: {}", event.getId());
        ReportExpenseSummary summary = ReportExpenseSummary.builder()
                .id(event.getId())
                .expenseType(event.getExpenseType())
                .amount(event.getAmount())
                .expenseDate(event.getExpenseDate())
                .build();
        expenseSummaryRepository.save(summary);
    }

    @RabbitListener(queues = ReportConstants.QUEUE_REPORT_STOCK_UPDATED)
    @Transactional
    public void handleStockUpdated(StockSnapshotEventDto event) {
        log.info("Received inventory.stock.updated event in report-service for ingredient id: {}", event.getIngredientId());
        ReportStockSnapshot snapshot = stockSnapshotRepository
                .findByIngredientIdAndSnapshotDate(event.getIngredientId(), event.getSnapshotDate())
                .orElse(ReportStockSnapshot.builder()
                        .ingredientId(event.getIngredientId())
                        .snapshotDate(event.getSnapshotDate())
                        .build());

        snapshot.setIngredientName(event.getIngredientName());
        snapshot.setCurrentQty(event.getCurrentQty());
        snapshot.setMinStock(event.getMinStock());
        snapshot.setUnit(event.getUnit());

        stockSnapshotRepository.save(snapshot);
    }
}
