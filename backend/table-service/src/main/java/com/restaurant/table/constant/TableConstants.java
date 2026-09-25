package com.restaurant.table.constant;

public final class TableConstants {
    private TableConstants() {}

    public static final int DEFAULT_CAPACITY = 4;
    public static final int MIN_CAPACITY = 1;
    public static final int MAX_CAPACITY = 50;
    public static final int MAX_TABLE_NUMBER_LENGTH = 10;
    public static final int MAX_CUSTOMER_NAME_LENGTH = 100;
    public static final int MAX_PHONE_LENGTH = 30;

    public static final String MSG_TABLE_NOT_FOUND = "Table not found with id: ";
    public static final String MSG_TABLE_NUMBER_EXISTS = "Table number already exists: ";
    public static final String MSG_TABLE_TOKEN_NOT_FOUND = "Table not found with order token: ";
    public static final String MSG_RESERVATION_NOT_FOUND = "Reservation not found with id: ";
    public static final String MSG_RESERVATION_OVERLAP = "The selected table is already reserved during this time slot";
    public static final String MSG_INVALID_TIME_RANGE = "Start time must be before end time";
    public static final String MSG_START_TIME_PAST = "Reservation start time cannot be in the past";
    public static final String MSG_TOKEN_GENERATED = "QR token generated successfully";
    public static final String MSG_TOKEN_CLEARED = "QR token cleared successfully";
}
