package com.restaurant.table.entity;

import com.restaurant.table.enums.TableStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_table")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String number;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 4;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TableStatus status = TableStatus.FREE;

    @Column(name = "order_token", unique = true, length = 64)
    private String orderToken;

    @Version
    @Column(name = "version")
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
