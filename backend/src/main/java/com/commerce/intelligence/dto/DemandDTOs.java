package com.commerce.intelligence.dto;

import lombok.*;

import java.time.LocalDateTime;

public class DemandDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DemandSignalDTO {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private String categoryName;
        private Double currentPrice;
        private Integer currentStock;
        private Double salesVelocity;
        private Integer searchCount;
        private Integer viewCount;
        private Integer wishlistCount;
        private Integer priceWatchCount;
        private Integer cartAddCount;
        private Integer preOrderInterestCount;
        private Integer demandScore; // 0 - 100
        private Double demandTrendPercentage; // e.g. +24%
        private String status; // HIGH, MODERATE, LOW
        private String targetDemandPriceRange; // e.g. "₹2,500 - ₹2,700"
        private Double recommendedPrice;
        private String recommendedAction;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SmartDealRecommendationDTO {
        private Long productId;
        private String productName;
        private Double currentPrice;
        private Double recommendedPrice;
        private Double recommendedDiscountPercentage;
        private String dealReason; // Explainable reason WHY (e.g. "High wishlist count (312) and low cart conversion")
        private String potentialImpact; // Expected sales velocity boost
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyPromotionRequest {
        private Long productId;
        private Double newPrice;
        private Double discountPercentage;
        private String promotionNotes;
    }
}
