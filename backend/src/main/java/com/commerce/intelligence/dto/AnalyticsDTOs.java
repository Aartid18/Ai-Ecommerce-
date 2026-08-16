package com.commerce.intelligence.dto;

import lombok.*;

import java.util.List;

public class AnalyticsDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutiveBriefingDTO {
        private String greeting;
        private List<BriefingItem> criticalIssues;
        private List<BriefingItem> opportunities;
        private FinancialSnapshotDTO financialSnapshot;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BriefingItem {
        private String title;
        private String description;
        private String severity; // HIGH, MEDIUM, LOW
        private String actionText;
        private String actionPath;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FinancialSnapshotDTO {
        private Double totalRevenue;
        private Double totalCOGS;
        private Double totalDiscounts;
        private Double totalShippingCosts;
        private Double totalReturnsRefunded;
        private Double estimatedProfit;
        private Double profitMarginPercentage;
        private Long totalOrders;
        private Double averageOrderValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WhyRevenueChangedDTO {
        private String periodComparison; // e.g. "Revenue decreased 12% compared to last week"
        private Double overallChangePercentage;
        private List<ContributorFactor> topContributors;
        private String primaryRootCause;
        private String aiInsightSummary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContributorFactor {
        private String factorName; // e.g. "Electronics Category Sales", "Average Order Value"
        private Double changePercentage;
        private String impactType; // NEGATIVE, POSITIVE, NEUTRAL
        private String explanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartDataPoint {
        private String label;
        private Double revenue;
        private Double profit;
        private Integer orders;
    }
}
