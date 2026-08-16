package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.OrderDTOs.CheckoutRequest;
import com.commerce.intelligence.model.CustomerProfile;
import com.commerce.intelligence.model.User;
import com.commerce.intelligence.model.enums.RiskLevel;
import com.commerce.intelligence.repository.CustomerProfileRepository;
import com.commerce.intelligence.repository.OrderRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskEngineService {

    private final CustomerProfileRepository profileRepository;
    private final OrderRepository orderRepository;

    public RiskEvaluationResult evaluateOrderRisk(User user, CheckoutRequest checkoutRequest, double finalOrderAmount) {
        int score = 10; // baseline
        List<String> reasons = new ArrayList<>();

        // Factor 1: Failed payment attempts
        if (checkoutRequest.getFailedPaymentAttempts() != null && checkoutRequest.getFailedPaymentAttempts() >= 3) {
            score += 35;
            reasons.add(checkoutRequest.getFailedPaymentAttempts() + " failed payment attempts before order placement");
        } else if (checkoutRequest.getFailedPaymentAttempts() != null && checkoutRequest.getFailedPaymentAttempts() > 0) {
            score += 15;
            reasons.add(checkoutRequest.getFailedPaymentAttempts() + " prior failed payment attempt");
        }

        // Factor 2: Unusually high order value
        if (finalOrderAmount > 50000.0) {
            score += 30;
            reasons.add("Unusually high order value (₹" + (int)finalOrderAmount + " exceeds ₹50,000 threshold)");
        } else if (finalOrderAmount > 25000.0) {
            score += 15;
            reasons.add("High order value (₹" + (int)finalOrderAmount + ")");
        }

        // Factor 3: Customer History & Order frequency
        CustomerProfile profile = profileRepository.findByUser(user).orElse(null);
        if (profile == null || profile.getTotalOrdersPlaced() == 0) {
            score += 15;
            reasons.add("New customer account with no prior successful order history");
        }

        if (profile != null && profile.getTotalReturns() > 3) {
            score += 20;
            reasons.add("Customer has a high return history (" + profile.getTotalReturns() + " returns)");
        }

        if (reasons.isEmpty()) {
            reasons.add("Normal order profile within historical parameters");
        }

        RiskLevel level;
        if (score >= 75) {
            level = RiskLevel.CRITICAL;
        } else if (score >= 50) {
            level = RiskLevel.HIGH;
        } else if (score >= 30) {
            level = RiskLevel.MEDIUM;
        } else {
            level = RiskLevel.LOW;
        }

        return RiskEvaluationResult.builder()
                .score(score)
                .level(level)
                .reasons(reasons)
                .build();
    }

    @Data
    @Builder
    public static class RiskEvaluationResult {
        private int score;
        private RiskLevel level;
        private List<String> reasons;
    }
}
