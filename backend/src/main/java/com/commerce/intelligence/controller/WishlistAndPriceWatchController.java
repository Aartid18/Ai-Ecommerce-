package com.commerce.intelligence.controller;

import com.commerce.intelligence.model.PriceWatch;
import com.commerce.intelligence.model.Wishlist;
import com.commerce.intelligence.service.WishlistAndPriceWatchService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Wishlist & Price Watch", description = "Customer wishlist and price alert tracking")
public class WishlistAndPriceWatchController {

    private final WishlistAndPriceWatchService wishlistService;

    @GetMapping("/wishlist")
    @Operation(summary = "Get Customer Wishlist", description = "Retrieves all products in the current user's wishlist")
    public ResponseEntity<List<Wishlist>> getWishlist() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @PostMapping("/wishlist/toggle/{productId}")
    @Operation(summary = "Toggle Wishlist", description = "Adds or removes a product from the user's wishlist")
    public ResponseEntity<Map<String, Object>> toggleWishlist(@PathVariable Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isAdded = wishlistService.toggleWishlist(userId, productId);
        return ResponseEntity.ok(Map.of("productId", productId, "inWishlist", isAdded));
    }

    @GetMapping("/price-watches")
    @Operation(summary = "Get User Price Watches", description = "Lists active price alerts configured by the customer")
    public ResponseEntity<List<PriceWatch>> getPriceWatches() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(wishlistService.getUserPriceWatches(userId));
    }

    @PostMapping("/price-watches/set")
    @Operation(summary = "Set Price Watch Alert", description = "Configures a target price alert for automated customer notification")
    public ResponseEntity<PriceWatch> setPriceWatch(@RequestBody SetPriceWatchRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        PriceWatch watch = wishlistService.setPriceWatch(userId, request.getProductId(), request.getTargetPrice());
        return ResponseEntity.ok(watch);
    }

    @Data
    public static class SetPriceWatchRequest {
        private Long productId;
        private Double targetPrice;
    }
}
