package com.commerce.intelligence.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

public class CartDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddToCartRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        private Long variantId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCartItemRequest {
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartResponse {
        private Long id;
        private List<CartItemResponse> items;
        private Double totalAmount;
        private Double discountAmount;
        private Double finalAmount;
        private String appliedCouponCode;
        private List<String> cartInsights; // Non-manipulative cart intelligence messages
        private Double amountForFreeDelivery; // e.g. "You are ₹250 away from free delivery"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private String mainImageUrl;
        private Long variantId;
        private String variantAttributes;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
        private Integer availableStock;
    }
}
