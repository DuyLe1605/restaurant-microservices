package com.restaurant.order.entity;

import com.restaurant.order.enums.CustomerTier;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_customer_phone", columnList = "phone", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CustomerTier tier = CustomerTier.BRONZE;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(name = "total_spent", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "current_month_spent", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal currentMonthSpent = BigDecimal.ZERO;

    @Column(name = "last_month_calculated", length = 7)
    private String lastMonthCalculated; // Dạng YYYY-MM để theo dõi chu kỳ tháng

    @Column(length = 255)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
