package com.restaurant.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(name = "old_qty", precision = 10, scale = 3)
    private BigDecimal oldQty;

    @Column(name = "new_qty", precision = 10, scale = 3)
    private BigDecimal newQty;

    @Column(name = "adjust_date")
    private LocalDate adjustDate;

    @Column(length = 100)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "adjusted_by")
    private Long adjustedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
