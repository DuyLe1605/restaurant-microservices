package com.restaurant.inventory.entity;

import com.restaurant.inventory.enums.ReceiptStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_receipt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(length = 100)
    private String supplier;

    @Column(name = "receipt_date")
    private LocalDate receiptDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReceiptStatus status = ReceiptStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
