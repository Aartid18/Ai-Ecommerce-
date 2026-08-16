package com.commerce.intelligence.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demand_signals", indexes = {
    @Index(name = "idx_demand_product", columnList = "product_id"),
    @Index(name = "idx_demand_score", columnList = "demandScore")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Builder.Default
    private Integer searchCount = 0;

    @Builder.Default
    private Integer viewCount = 0;

    @Builder.Default
    private Integer wishlistCount = 0;

    @Builder.Default
    private Integer priceWatchCount = 0;

    @Builder.Default
    private Integer cartAddCount = 0;

    @Builder.Default
    private Integer preOrderInterestCount = 0;

    @Builder.Default
    private Integer demandScore = 50;

    @Builder.Default
    private Double demandTrendPercentage = 0.0; // e.g. +24.0

    @Builder.Default
    private String status = "HIGH"; // HIGH, MODERATE, LOW

    private String targetDemandPriceRange; // e.g. "₹2,500 - ₹2,700"
    private Double recommendedPrice;

    @Column(columnDefinition = "TEXT")
    private String recommendedAction;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
