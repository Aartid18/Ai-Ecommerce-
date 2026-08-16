package com.commerce.intelligence.dto;

import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

public class ProductDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRequest {
        @NotBlank(message = "Product name is required")
        private String name;

        @NotBlank(message = "SKU is required")
        private String sku;

        private String description;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        private Long brandId;

        @NotNull(message = "Price is required")
        @Min(value = 0, message = "Price must be positive")
        private Double price;

        private Double costPrice;
        private Double discountPercentage;
        private Integer stock;
        private Double weight;
        private String dimensions;
        private String mainImageUrl;
        private List<String> additionalImages;

        private Integer reorderPoint;
        private Integer safetyStock;
        private Boolean preOrderEnabled;
        private String preOrderExpectedAvailability;

        private List<ProductVariantRequest> variants;
        private List<ProductSpecificationRequest> specifications;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariantRequest {
        private String sku;
        private String attributesJson;
        private Double priceOverride;
        private Integer stock;
        private Double weight;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSpecificationRequest {
        private String specKey;
        private String specValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductResponse {
        private Long id;
        private String name;
        private String sku;
        private String description;
        private Long categoryId;
        private String categoryName;
        private String categorySlug;
        private Long brandId;
        private String brandName;
        private Double price;
        private Double costPrice;
        private Double discountPercentage;
        private Double finalPrice;
        private Integer stock;
        private Double weight;
        private String dimensions;
        private String mainImageUrl;
        private List<String> additionalImages;
        private Double rating;
        private Integer reviewCount;
        private Boolean active;

        // Inventory Health & Analytics
        private InventoryHealthStatus inventoryHealthStatus;
        private Integer inventoryHealthScore;
        private Double salesVelocity;
        private Integer estimatedStockoutDays;
        private Integer daysSinceLastSale;
        private Integer reorderPoint;

        // Pre-order
        private Boolean preOrderEnabled;
        private String preOrderExpectedAvailability;
        private Integer preOrderCount;

        private List<ProductVariantResponse> variants;
        private List<ProductSpecificationResponse> specifications;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProductVariantResponse {
        private Long id;
        private String sku;
        private String attributesJson;
        private Double priceOverride;
        private Integer stock;
        private Double weight;
        private Boolean active;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProductSpecificationResponse {
        private Long id;
        private String specKey;
        private String specValue;
    }
}
