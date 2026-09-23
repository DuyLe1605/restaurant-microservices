package com.restaurant.inventory.entity;

import com.restaurant.inventory.enums.InventoryLogType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(name = "qty_change", precision = 10, scale = 3, nullable = false)
    private BigDecimal qtyChange;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryLogType type;

    @Column(name = "related_id")
    private Long relatedId;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
