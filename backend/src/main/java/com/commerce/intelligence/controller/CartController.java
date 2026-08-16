package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.CartDTOs.*;
import com.commerce.intelligence.model.enums.EventType;
import com.commerce.intelligence.service.CartService;
import com.commerce.intelligence.service.DemandRadarService;
import com.commerce.intelligence.service.ProductService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart & Cart Intelligence", description = "Shopping cart operations with non-manipulative demand insights")
public class CartController {

    private final CartService cartService;
    private final DemandRadarService demandRadarService;
    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get User Cart", description = "Fetches the current user's active shopping cart with calculated totals and intelligence insights")
    public ResponseEntity<CartResponse> getCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(cartService.getCartForUser(userId));
    }

    @PostMapping("/items")
    @Operation(summary = "Add Item to Cart", description = "Adds a product or specific variant to the customer cart")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartResponse response = cartService.addToCart(userId, request);

        // Track CART_ADD demand signal
        try {
            demandRadarService.trackEvent(userId, null, productService.getProductEntity(request.getProductId()), EventType.CART_ADD, null);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update Cart Item Quantity", description = "Updates the quantity of an existing cart item")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(cartService.updateCartItem(userId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove Cart Item", description = "Removes a specific item from the customer cart")
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable Long itemId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(cartService.removeCartItem(userId, itemId));
    }

    @PostMapping("/apply-coupon")
    @Operation(summary = "Apply Coupon Code", description = "Validates and applies a coupon code to the shopping cart")
    public ResponseEntity<CartResponse> applyCoupon(@RequestParam String code) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(cartService.applyCoupon(userId, code));
    }
}
