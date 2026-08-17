package com.commerce.intelligence.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;

import java.util.List;

public class AiDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerAiQueryRequest {
        @JsonAlias({"userQuery", "prompt"})
        private String query; // e.g. "I need a laptop for coding under ₹70,000"
        private Double maxBudget;
        private Long categoryId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerAiRecommendationResponse {
        private String querySummary;
        private List<CustomerProductRecommendation> recommendations;
        private String aiExplanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerProductRecommendation {
        private Long productId;
        private String productName;
        private Double price;
        private String mainImageUrl;
        private Double rating;
        private String matchBadge; // e.g. "BEST MATCH", "BEST VALUE", "PREMIUM CHOICE"
        private List<String> whyRecommended;
        private String tradeOff;
        private List<String> keySpecs;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerAiQueryRequest {
        @JsonAlias({"userQuery", "prompt"})
        private String query; // e.g. "Which products will stock out next week?"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellerAiAnalysisResponse {
        private String userQuery;
        private String summaryHeading;
        private List<String> actualDataPoints;
        private List<String> calculatedMetrics;
        private List<String> forecasts;
        private List<SellerActionRecommendation> actionRecommendations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellerActionRecommendation {
        private Long productId;
        private String productName;
        private String issueCategory; // e.g. "STOCKOUT_RISK", "DEAD_STOCK", "PRICING_OPPORTUNITY"
        private String recommendationText;
        private String potentialImpact;
        private String actionButtonText; // e.g. "Create Reorder", "Apply 10% Discount"
    }
}
