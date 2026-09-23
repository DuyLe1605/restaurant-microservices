package com.restaurant.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingredient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String category;

    @Column(length = 20)
    private String unit;

    @Column(name = "purchase_price", precision = 14, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "min_stock")
    @Builder.Default
    private Integer minStock = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "main_supplier", length = 100)
    private String mainSupplier;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
