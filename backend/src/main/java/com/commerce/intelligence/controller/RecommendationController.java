package com.commerce.intelligence.controller;

import com.commerce.intelligence.service.RecommendationService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendation Engine", description = "Explainable personalized product suggestions and frequently-bought-together bundles")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/personalized")
    @Operation(summary = "Personalized Recommendations", description = "Returns products based on purchase history, wishlist, cart, and category affinity")
    public ResponseEntity<List<RecommendationService.RecommendedProduct>> getPersonalizedRecommendations() {
        Long userId = null;
        try { userId = SecurityUtils.getCurrentUserId(); } catch (Exception ignored) {}

        if (userId == null) {
            userId = 1L; // fallback guest user recommendation
        }

        return ResponseEntity.ok(recommendationService.getRecommendationsForUser(userId));
    }

    @GetMapping("/frequently-bought-together/{productId}")
    @Operation(summary = "Frequently Bought Together", description = "Returns correlated accessories and category complements")
    public ResponseEntity<List<RecommendationService.RecommendedProduct>> getFrequentlyBoughtTogether(
            @PathVariable Long productId) {
        return ResponseEntity.ok(recommendationService.getFrequentlyBoughtTogether(productId));
    }
}
