package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.AiDTOs.*;
import com.commerce.intelligence.service.CustomerAiService;
import com.commerce.intelligence.service.SellerAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "Dual AI Copilots", description = "Signature Feature #2: Customer AI Shopping Copilot and Seller Operational AI Copilot")
public class AiController {

    private final CustomerAiService customerAiService;
    private final SellerAiService sellerAiService;

    @PostMapping("/customer/recommend")
    @Operation(summary = "Customer AI Shopping Copilot", description = "Grounded shopping assistant evaluating budget, real specs (RAM, CPU, SSD), ratings, and trade-offs")
    public ResponseEntity<CustomerAiRecommendationResponse> getCustomerRecommendations(
            @RequestBody CustomerAiQueryRequest request) {
        return ResponseEntity.ok(customerAiService.getShoppingRecommendations(request));
    }

    @PostMapping("/seller/analyze")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'ORDER_MANAGER')")
    @Operation(summary = "Seller AI Copilot", description = "Answers operational questions (e.g. stockouts, dead stock, discounting) using actual platform metrics, forecasts, and executable actions")
    public ResponseEntity<SellerAiAnalysisResponse> analyzeSellerQuery(
            @RequestBody SellerAiQueryRequest request) {
        return ResponseEntity.ok(sellerAiService.analyzeSellerQuery(request));
    }
}
