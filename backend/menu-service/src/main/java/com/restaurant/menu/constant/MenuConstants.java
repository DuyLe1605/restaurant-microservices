package com.restaurant.menu.constant;

import java.math.BigDecimal;

public final class MenuConstants {
    private MenuConstants() {}

    public static final int MIN_CODE_LENGTH = 2;
    public static final int MAX_CODE_LENGTH = 50;
    public static final int MIN_NAME_LENGTH = 2;
    public static final int MAX_NAME_LENGTH = 100;
    public static final String MIN_PRICE_STR = "0.0";
    public static final String MAX_PRICE_STR = "999999999.99";

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String MSG_ITEM_CREATED = "Menu item created successfully";
    public static final String MSG_ITEM_UPDATED = "Menu item updated successfully";
    public static final String MSG_ITEM_DELETED = "Menu item deleted successfully";
    public static final String MSG_ITEM_NOT_FOUND = "Menu item not found with id: ";
    public static final String MSG_CODE_EXISTS = "Menu item code already exists: ";
    public static final String MSG_RECIPE_SAVED = "Recipe saved successfully";
    public static final String MSG_RECIPE_DELETED = "Recipe deleted successfully";
    public static final String MSG_RECIPE_NOT_FOUND = "Recipe not found with id: ";
    public static final String MSG_INGREDIENT_NOT_FOUND = "Ingredient not found with id: ";
}
