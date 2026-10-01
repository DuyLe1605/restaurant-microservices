package com.restaurant.report.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_stock_snapshot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportStockSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(name = "ingredient_name", length = 100)
    private String ingredientName;

    @Column(name = "current_qty", precision = 10, scale = 3)
    private BigDecimal currentQty;

    @Column(name = "min_stock")
    private Integer minStock;

    @Column(length = 20)
    private String unit;

    @Column(name = "snapshot_date")
    private LocalDate snapshotDate;

    @CreationTimestamp
    @Column(name = "synced_at", updatable = false)
    private LocalDateTime syncedAt;
}
