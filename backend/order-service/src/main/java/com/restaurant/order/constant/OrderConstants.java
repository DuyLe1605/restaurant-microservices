package com.restaurant.order.constant;

public final class OrderConstants {
    private OrderConstants() {}

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "orderTime";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String EXCHANGE_NAME = "restaurant.exchange";
    public static final String ROUTING_KEY_ORDER_CREATED = "order.created";
    public static final String ROUTING_KEY_ORDER_COMPLETED = "order.completed";
    public static final String ROUTING_KEY_ORDER_PAID = "order.paid";
    public static final String ROUTING_KEY_ORDER_CANCELLED = "order.cancelled";
    public static final String ROUTING_KEY_EXPENSE_CREATED = "expense.created";

    public static final String MSG_ORDER_NOT_FOUND = "Order not found with id: ";
    public static final String MSG_ORDER_NOT_OPEN = "Order cannot be modified because it is not in OPEN status";
    public static final String MSG_ORDER_CANNOT_PAY = "Order can only be paid if status is OPEN or SERVED";
    public static final String MSG_ORDER_CANNOT_COMPLETE = "Order can only be completed if status is OPEN";
    public static final String MSG_ORDER_CANNOT_CANCEL = "Order can only be cancelled if status is OPEN";
    public static final String MSG_EXPENSE_NOT_FOUND = "Expense not found with id: ";
    public static final String MSG_TABLE_NOT_FREE = "Table is not available (status is not FREE)";
    public static final String MSG_INSUFFICIENT_INVENTORY = "Cannot place order due to insufficient inventory: ";
}
