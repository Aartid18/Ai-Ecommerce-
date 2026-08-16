package com.commerce.intelligence.dto;

import com.commerce.intelligence.model.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

public class CouponDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CouponRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        @NotNull(message = "Discount type is required")
        private DiscountType discountType;

        @NotNull(message = "Discount value is required")
        private Double discountValue;

        private Double minOrderAmount;
        private Double maxDiscountAmount;
        private LocalDate startDate;
        private LocalDate expiryDate;
        private Integer usageLimit;
        private Integer perUserLimit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CouponValidationResponse {
        private Boolean valid;
        private String code;
        private DiscountType discountType;
        private Double discountValue;
        private Double calculatedDiscountAmount;
        private String message;
    }
}
