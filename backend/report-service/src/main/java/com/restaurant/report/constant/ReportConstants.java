package com.restaurant.report.constant;

public final class ReportConstants {
    private ReportConstants() {}

    public static final String EXCHANGE_NAME = "restaurant.exchange";
    public static final String QUEUE_REPORT_ORDER_PAID = "report.order.paid.queue";
    public static final String QUEUE_REPORT_EXPENSE_CREATED = "report.expense.created.queue";
    public static final String QUEUE_REPORT_STOCK_UPDATED = "report.stock.updated.queue";

    public static final String ROUTING_KEY_ORDER_PAID = "order.paid";
    public static final String ROUTING_KEY_EXPENSE_CREATED = "expense.created";
    public static final String ROUTING_KEY_STOCK_UPDATED = "inventory.stock.updated";

    public static final String STOCK_STATUS_CRITICAL = "CRITICAL";
    public static final String STOCK_STATUS_WARNING = "WARNING";
    public static final String STOCK_STATUS_NORMAL = "NORMAL";
}
