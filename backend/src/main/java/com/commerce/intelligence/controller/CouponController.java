package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.CouponDTOs.*;
import com.commerce.intelligence.model.Coupon;
import com.commerce.intelligence.service.CouponService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Server-side validated promotional coupons")
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "List All Coupons", description = "Retrieves all coupon codes and usage statistics")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Coupon", description = "Creates a new coupon with usage limits, expiration, and threshold rules")
    public ResponseEntity<Coupon> createCoupon(@Valid @RequestBody CouponRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(couponService.createCoupon(request, actor));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate Coupon", description = "Server-side validation checking expiry, per-user limits, and minimum order values")
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam Double amount) {
        Long userId = null;
        try { userId = SecurityUtils.getCurrentUserId(); } catch (Exception ignored) {}
        return ResponseEntity.ok(couponService.validateCoupon(code, userId, amount));
    }
}
