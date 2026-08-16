package com.commerce.intelligence.dto;

import com.commerce.intelligence.model.enums.ReturnStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class ReturnDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReturnRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotBlank(message = "Reason is required")
        private String reason;

        private String customNotes;
        private String evidenceUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReturnResponse {
        private Long id;
        private Long orderId;
        private String orderNumber;
        private String customerName;
        private String reason;
        private String customNotes;
        private String evidenceUrl;
        private ReturnStatus status;
        private String adminDecisionNotes;
        private String decidedBy;
        private Double refundAmount;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnDecisionRequest {
        @NotNull(message = "New return status is required")
        private ReturnStatus status;

        private String adminDecisionNotes;
        private Double refundAmount;
    }
}
