package com.sportshop.entity;

import com.sportshop.enums.InventoryChangeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "inventory_logs")
public class InventoryLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InventoryChangeType changeType;

    @Column(nullable = false)
    private Integer quantityBefore;

    @Column(nullable = false)
    private Integer quantityChange;

    @Column(nullable = false)
    private Integer quantityAfter;

    @Column(length = 255)
    private String reason;

    @Column(length = 100)
    private String referenceType;

    @Column(length = 80)
    private String referenceId;
}
