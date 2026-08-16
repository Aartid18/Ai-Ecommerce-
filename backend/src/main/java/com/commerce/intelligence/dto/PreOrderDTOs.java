package com.commerce.intelligence.dto;

import com.commerce.intelligence.model.enums.PreOrderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class PreOrderDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinPreOrderRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        private Long variantId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity = 1;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PreOrderResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private String mainImageUrl;
        private Long variantId;
        private Integer quantity;
        private Double unitPrice;
        private PreOrderStatus status;
        private String expectedAvailabilityDate;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PreOrderDemandSummaryDTO {
        private Long productId;
        private String productName;
        private String sku;
        private Integer currentStock;
        private Long totalPreOrdersCount;
        private Double expectedRevenue;
        private Integer recommendedStockQuantity; // Calculated based on pre-orders + velocity + lead time
        private Integer recommendedPurchaseQuantity;
        private String expectedAvailabilityDate;
        private String supplierLeadTimeInfo;
    }
}
