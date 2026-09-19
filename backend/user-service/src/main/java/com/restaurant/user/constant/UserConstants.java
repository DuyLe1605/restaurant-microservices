package com.restaurant.user.constant;

public final class UserConstants {
    private UserConstants() {}

    public static final int MIN_USERNAME_LENGTH = 3;
    public static final int MAX_USERNAME_LENGTH = 60;
    public static final String USERNAME_REGEX = "^[a-zA-Z0-9._-]+$";
    public static final String USERNAME_REGEX_MSG = "Username may only contain letters, numbers, dots, underscores, and hyphens";

    public static final int MIN_PASSWORD_LENGTH = 6;
    public static final int MAX_PASSWORD_LENGTH = 100;
    public static final int MAX_FULLNAME_LENGTH = 100;

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_NAME = "X-User-Username";
    public static final String HEADER_USER_ROLE = "X-User-Role";
    public static final String HEADER_USER_FULLNAME = "X-User-Fullname";

    public static final String EXCHANGE_NAME = "restaurant.exchange";
    public static final String QUEUE_USER_SYNC = "user.sync.queue";
    public static final String ROUTING_KEY_USER_CREATED = "user.created";
    public static final String ROUTING_KEY_USER_UPDATED = "user.updated";
    public static final String ROUTING_KEY_USER_DELETED = "user.deleted";

    public static final String MSG_USER_CREATED = "User created successfully";
    public static final String MSG_USER_UPDATED = "User updated successfully";
    public static final String MSG_USER_DELETED = "User deleted successfully";
    public static final String MSG_PASSWORD_CHANGED = "Password changed successfully";
    public static final String MSG_USER_NOT_FOUND = "User not found with id: ";
    public static final String MSG_CANNOT_DELETE_SELF = "You cannot delete your own account";
    public static final String MSG_USERNAME_TAKEN = "Username is already in use: ";
    public static final String MSG_OLD_PASSWORD_INCORRECT = "Current password is not correct";
}
