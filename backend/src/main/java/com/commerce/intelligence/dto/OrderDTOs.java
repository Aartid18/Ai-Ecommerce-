package com.commerce.intelligence.dto;

import com.commerce.intelligence.model.enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class OrderDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckoutRequest {
        @NotBlank(message = "Customer name is required")
        private String customerName;

        @NotBlank(message = "Email is required")
        private String customerEmail;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Shipping address is required")
        private String shippingAddress;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        private String couponCode;

        // Payment Simulation/Reference
        private String mockCardNumber; // optional test field, never stored
        private Integer failedPaymentAttempts; // for Risk Engine calculation test scenario
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long id;
        private String orderNumber;
        private Long userId;
        private String customerName;
        private String customerEmail;
        private String phone;
        private String shippingAddress;
        private List<OrderItemResponse> items;
        private Double totalAmount;
        private Double discountAmount;
        private String couponCode;
        private Double shippingFee;
        private Double taxAmount;
        private Double finalAmount;
        private PaymentStatus paymentStatus;
        private PaymentMethod paymentMethod;
        private OrderStatus orderStatus;

        // Risk Engine fields
        private Integer riskScore;
        private RiskLevel riskLevel;
        private List<String> riskReasons;
        private Boolean isRiskReviewed;
        private String reviewedBy;
        private LocalDateTime reviewedAt;
        private String riskActionNotes;

        // Profitability fields
        private Double estimatedProfit;
        private Double profitMarginPercentage;

        private LocalDateTime createdAt;
        private List<OrderStatusHistoryResponse> statusHistory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private Long variantId;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatusHistoryResponse {
        private OrderStatus previousStatus;
        private OrderStatus newStatus;
        private String changedBy;
        private String reason;
        private String notes;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusUpdateRequest {
        @NotNull(message = "New order status is required")
        private OrderStatus newStatus;
        private String reason;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskReviewRequest {
        @NotBlank(message = "Decision action is required: APPROVE, FLAG_FOR_REVIEW, REJECT")
        private String action;
        private String notes;
    }
}
