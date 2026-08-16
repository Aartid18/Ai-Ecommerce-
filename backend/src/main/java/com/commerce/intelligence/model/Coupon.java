package com.commerce.intelligence.model;

import com.commerce.intelligence.model.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupon_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private Double discountValue;

    @Builder.Default
    private Double minOrderAmount = 0.0;

    private Double maxDiscountAmount;

    private LocalDate startDate;
    private LocalDate expiryDate;

    @Builder.Default
    private Integer usageLimit = 1000;

    @Builder.Default
    private Integer perUserLimit = 1;

    @Builder.Default
    private Integer timesUsed = 0;

    @Builder.Default
    private Boolean active = true;
}
