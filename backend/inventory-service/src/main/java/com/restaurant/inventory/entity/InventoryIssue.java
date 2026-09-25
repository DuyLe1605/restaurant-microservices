package com.restaurant.inventory.entity;

import com.restaurant.inventory.enums.IssueStatus;
import com.restaurant.inventory.enums.IssueType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_issue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_by")
    private Long createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", nullable = false, length = 20)
    @Builder.Default
    private IssueType issueType = IssueType.SALE;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private IssueStatus status = IssueStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
