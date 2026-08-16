package com.commerce.intelligence.dto;

import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import com.commerce.intelligence.model.enums.InventoryTransactionReason;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InventoryDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockAdjustmentRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        private Long variantId;

        @NotNull(message = "Quantity change is required (+/-)")
        private Integer quantityChange;

        @NotNull(message = "Reason is required")
        private InventoryTransactionReason reason;

        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryTransactionResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private Long variantId;
        private String variantSku;
        private Integer quantityBefore;
        private Integer quantityChange;
        private Integer quantityAfter;
        private InventoryTransactionReason reason;
        private String notes;
        private String changedBy;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryHealthDTO {
        private Long productId;
        private String productName;
        private String sku;
        private Integer currentStock;
        private Double salesVelocity; // avg daily sales
        private Integer estimatedStockoutDays;
        private Integer reorderPoint;
        private InventoryHealthStatus status;
        private Integer healthScore;
        private String recommendation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeadStockDTO {
        private Long productId;
        private String productName;
        private String sku;
        private Integer stockQuantity;
        private Double unitPrice;
        private Double deadStockValue; // stock * unitPrice
        private Integer daysSinceLastSale;
        private String recommendedAction; // e.g. "Create 15% promotion or bundle"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReorderRecommendationDTO {
        private Long productId;
        private String productName;
        private String sku;
        private Integer currentStock;
        private Double salesVelocity;
        private Integer predictedStockoutDays;
        private Integer recommendedReorderQuantity;
        private Long suggestedSupplierId;
        private String suggestedSupplierName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseOrderRequest {
        @NotNull(message = "Supplier ID is required")
        private Long supplierId;

        @NotNull(message = "Product ID is required")
        private Long productId;

        private Long variantId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private Double unitCost;
        private LocalDate expectedDeliveryDate;
    }
}
