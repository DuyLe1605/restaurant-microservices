package com.restaurant.order.enums;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public enum CustomerTier {
    BRONZE("Đồng", BigDecimal.ZERO, BigDecimal.valueOf(1.0), 0),
    SILVER("Bạc", BigDecimal.valueOf(2_000_000), BigDecimal.valueOf(1.2), 5),
    GOLD("Vàng", BigDecimal.valueOf(5_000_000), BigDecimal.valueOf(1.5), 10),
    DIAMOND("Kim Cương", BigDecimal.valueOf(10_000_000), BigDecimal.valueOf(2.0), 15);

    private final String label;
    private final BigDecimal monthlyTarget; // Ngưỡng chi tiêu trong tháng để đạt/duy trì hạng
    private final BigDecimal pointMultiplier; // Hệ số tích điểm (1.0 = 10k = 1đ, 1.2 = 10k = 1.2đ, v.v.)
    private final int discountPercent; // % giảm giá hóa đơn mặc định cho hạng thẻ

    CustomerTier(String label, BigDecimal monthlyTarget, BigDecimal pointMultiplier, int discountPercent) {
        this.label = label;
        this.monthlyTarget = monthlyTarget;
        this.pointMultiplier = pointMultiplier;
        this.discountPercent = discountPercent;
    }

    /**
     * Xác định hạng thành viên tương ứng với mức chi tiêu trong tháng
     */
    public static CustomerTier evaluateTier(BigDecimal monthlySpent) {
        if (monthlySpent == null || monthlySpent.compareTo(BigDecimal.ZERO) <= 0) {
            return BRONZE;
        }
        if (monthlySpent.compareTo(DIAMOND.monthlyTarget) >= 0) {
            return DIAMOND;
        }
        if (monthlySpent.compareTo(GOLD.monthlyTarget) >= 0) {
            return GOLD;
        }
        if (monthlySpent.compareTo(SILVER.monthlyTarget) >= 0) {
            return SILVER;
        }
        return BRONZE;
    }
}
