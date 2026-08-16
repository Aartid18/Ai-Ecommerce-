package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.PreOrderDTOs.*;
import com.commerce.intelligence.service.PreOrderService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preorders")
@RequiredArgsConstructor
@Tag(name = "Smart Pre-Orders", description = "Signature Feature #3: Demand-based pre-ordering and stock prediction")
public class PreOrderController {

    private final PreOrderService preOrderService;

    @PostMapping("/join")
    @Operation(summary = "Join Pre-Order", description = "Registers customer pre-order interest for out-of-stock or upcoming items")
    public ResponseEntity<PreOrderResponse> joinPreOrder(@Valid @RequestBody JoinPreOrderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(preOrderService.joinPreOrder(userId, request));
    }

    @GetMapping("/my-preorders")
    @Operation(summary = "Get Customer Pre-Orders", description = "Lists all pre-orders joined by current customer")
    public ResponseEntity<List<PreOrderResponse>> getMyPreOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(preOrderService.getCustomerPreOrders(userId));
    }

    @GetMapping("/demand-summary/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Pre-Order Demand Intelligence", description = "Calculates pre-order demand volume, expected revenue, safety stock, and recommended supplier purchase quantity")
    public ResponseEntity<PreOrderDemandSummaryDTO> getPreOrderDemandSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(preOrderService.getPreOrderDemandSummary(productId));
    }

    @PostMapping("/fulfill/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Fulfill Pre-Orders", description = "Converts pre-orders to orders when incoming inventory arrives")
    public ResponseEntity<Map<String, String>> fulfillPreOrders(@PathVariable Long productId) {
        String actor = SecurityUtils.getCurrentUsername();
        preOrderService.fulfillPreOrdersForProduct(productId, actor);
        return ResponseEntity.ok(Map.of("message", "Pre-orders fulfilled for product ID " + productId));
    }
}
