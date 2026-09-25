package com.restaurant.inventory.constant;

public final class InventoryConstants {
    private InventoryConstants() {}

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String EXCHANGE_NAME = "restaurant.exchange";
    public static final String QUEUE_ORDER_COMPLETED = "inventory.order.completed.queue";
    public static final String ROUTING_KEY_ORDER_COMPLETED = "order.completed";
    public static final String ROUTING_KEY_STOCK_UPDATED = "inventory.stock.updated";
    public static final String ROUTING_KEY_RECEIPT_CREATED = "inventory.receipt.created";

    public static final String MSG_CATEGORY_NOT_FOUND = "Ingredient category not found with id: ";
    public static final String MSG_INGREDIENT_NOT_FOUND = "Ingredient not found with id: ";
    public static final String MSG_RECEIPT_NOT_FOUND = "Inventory receipt not found with id: ";
    public static final String MSG_ISSUE_NOT_FOUND = "Inventory issue not found with id: ";
    public static final String MSG_RECEIPT_ALREADY_COMPLETED = "Cannot modify or re-complete a receipt that is already COMPLETED";
    public static final String MSG_INSUFFICIENT_STOCK = "Insufficient stock for ingredient: ";
    public static final String MSG_DUPLICATE_CODE = "Ingredient code already exists: ";
}
