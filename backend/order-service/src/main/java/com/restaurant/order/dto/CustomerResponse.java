package com.restaurant.order.dto;

import com.restaurant.order.enums.CustomerTier;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private CustomerTier tier;
    private String tierLabel;
    private Integer discountPercent;
    private BigDecimal pointMultiplier;
    private Integer points;
    private BigDecimal pointsValue; // Quy đổi điểm ra tiền mặt (1 điểm = 100 VNĐ)
    private BigDecimal totalSpent;
    private BigDecimal currentMonthSpent;
    private BigDecimal nextTierTarget; // Mức chi tiêu tháng cần để đạt/duy trì hạng tiếp theo
    private String nextTierLabel;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
