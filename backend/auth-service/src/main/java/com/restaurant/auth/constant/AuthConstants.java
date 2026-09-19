package com.restaurant.auth.constant;

public final class AuthConstants {
    private AuthConstants() {}

    public static final int MIN_USERNAME_LENGTH = 3;
    public static final int MAX_USERNAME_LENGTH = 60;
    public static final String USERNAME_REGEX = "^[a-zA-Z0-9._-]+$";
    public static final String USERNAME_REGEX_MSG = "Username may only contain letters, numbers, dots, underscores, and hyphens";

    public static final int MIN_PASSWORD_LENGTH = 6;
    public static final int MAX_PASSWORD_LENGTH = 100;
    public static final int MAX_FULLNAME_LENGTH = 100;

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String AUTH_HEADER = "Authorization";

    public static final String EXCHANGE_NAME = "restaurant.exchange";
    public static final String ROUTING_KEY_USER_CREATED = "user.created";
    public static final String ROUTING_KEY_USER_LOGIN = "user.login";

    public static final String MSG_REGISTRATION_SUCCESS = "User registered successfully";
    public static final String MSG_LOGIN_SUCCESS = "Login successful";
    public static final String MSG_LOGOUT_SUCCESS = "Logout successful";
    public static final String MSG_TOKEN_VALID = "Token is valid";
    public static final String MSG_TOKEN_REFRESHED = "Token refreshed successfully";
    public static final String MSG_USER_NOT_FOUND = "User not found with username: ";
    public static final String MSG_USER_ALREADY_EXISTS = "Username already taken: ";
    public static final String MSG_ACCOUNT_DISABLED = "Account has been deactivated. Please contact administrator.";
    public static final String MSG_INVALID_CREDENTIALS = "Invalid username or password";
    public static final String MSG_INVALID_TOKEN = "Invalid or expired token";
    public static final String MSG_PASSWORDS_DO_NOT_MATCH = "Password and confirmation password do not match";
    public static final String ACTION_LOGIN_SUCCESS = "LOGIN_SUCCESS";
    public static final String ACTION_REGISTER = "REGISTER";
    public static final String TARGET_AUTH = "AUTH";
}
