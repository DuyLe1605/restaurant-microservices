package com.restaurant.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_issue_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryIssueDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "issue_id", nullable = false)
    private Long issueId;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(precision = 10, scale = 3)
    private BigDecimal qty;
}
