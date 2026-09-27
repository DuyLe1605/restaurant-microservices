package com.restaurant.order.entity;

import com.restaurant.order.enums.OrderDetailStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "sale_order_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleOrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sale_order_id", nullable = false)
    private Long saleOrderId;

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Column(name = "menu_name", length = 100)
    private String menuName;

    @Column(nullable = false)
    private Integer qty;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderDetailStatus status = OrderDetailStatus.ORDERED;

    @Column(columnDefinition = "TEXT")
    private String note;
}
