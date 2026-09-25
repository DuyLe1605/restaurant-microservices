package com.restaurant.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_receipt_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReceiptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_id", nullable = false)
    private Long receiptId;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(precision = 10, scale = 3)
    private BigDecimal qty;

    @Column(name = "unit_price", precision = 14, scale = 2)
    private BigDecimal unitPrice;
}
