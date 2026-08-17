package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.DemandDTOs.*;
import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.service.DemandRadarService;
import com.commerce.intelligence.service.SmartDealEngineService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/demand", "/api/demand-radar"})
@RequiredArgsConstructor
@Tag(name = "Demand Radar & Smart Deals", description = "Signature Feature #1: Anonymized behavioral demand aggregation and explainable smart pricing engine")
public class DemandRadarController {

    private final DemandRadarService demandRadarService;
    private final SmartDealEngineService smartDealEngineService;

    @GetMapping({"/radar", "/signals"})
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Demand Radar Opportunities", description = "Aggregates search growth, wishlist volume, price-watch bands, and cart conversions into actionable demand signals")
    public ResponseEntity<List<DemandSignalDTO>> getDemandRadar() {
        return ResponseEntity.ok(demandRadarService.getDemandRadarOpportunities());
    }

    @GetMapping("/smart-deals")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Smart Deal Recommendations", description = "Generates explainable pricing & promotion recommendations based on demand elasticity and dead-stock risks")
    public ResponseEntity<List<SmartDealRecommendationDTO>> getSmartDeals() {
        return ResponseEntity.ok(smartDealEngineService.getSmartDealRecommendations());
    }

    @PostMapping({"/apply-promotion", "/apply-deal"})
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Apply Smart Deal Promotion", description = "Seller-approved 1-click promotion execution that updates price and broadcasts price-drop alerts to watchers")
    public ResponseEntity<Product> applyPromotion(
            @RequestBody(required = false) ApplyPromotionRequest request,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Double discountPercentage) {
        String actor = SecurityUtils.getCurrentUsername();
        if (request == null) {
            request = new ApplyPromotionRequest(productId, null, discountPercentage, "Smart Deal Promotion");
        } else {
            if (productId != null) request.setProductId(productId);
            if (discountPercentage != null) request.setDiscountPercentage(discountPercentage);
        }
        return ResponseEntity.ok(demandRadarService.applySmartDealPromotion(request, actor));
    }
}
