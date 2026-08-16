package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.CouponDTOs.*;
import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.Coupon;
import com.commerce.intelligence.model.enums.DiscountType;
import com.commerce.intelligence.repository.CouponRepository;
import com.commerce.intelligence.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final AuditService auditService;

    @Transactional
    public Coupon createCoupon(CouponRequest request, String actor) {
        if (couponRepository.findByCode(request.getCode().toUpperCase()).isPresent()) {
            throw new BadRequestException("Coupon code " + request.getCode() + " already exists!");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : 0.0)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .expiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : LocalDate.now().plusMonths(3))
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 500)
                .perUserLimit(request.getPerUserLimit() != null ? request.getPerUserLimit() : 1)
                .timesUsed(0)
                .active(true)
                .build();

        Coupon saved = couponRepository.save(coupon);

        auditService.logAction(actor, "COUPON_CREATE", "Coupon", saved.getId().toString(), null, saved.getCode(), "Created new coupon");

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, Long userId, Double orderSubtotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElse(null);

        if (coupon == null) {
            return CouponValidationResponse.builder().valid(false).message("Invalid coupon code.").build();
        }

        if (!coupon.getActive()) {
            return CouponValidationResponse.builder().valid(false).message("Coupon is inactive.").build();
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            return CouponValidationResponse.builder().valid(false).message("Coupon has expired.").build();
        }

        if (coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            return CouponValidationResponse.builder().valid(false).message("Coupon overall usage limit reached.").build();
        }

        if (userId != null) {
            Long userUsages = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (userUsages >= coupon.getPerUserLimit()) {
                return CouponValidationResponse.builder().valid(false).message("You have reached your maximum usage limit for this coupon.").build();
            }
        }

        if (orderSubtotal < coupon.getMinOrderAmount()) {
            return CouponValidationResponse.builder().valid(false).message("Minimum order amount of ₹" + (int)coupon.getMinOrderAmount().doubleValue() + " required.").build();
        }

        double calculatedDiscount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            calculatedDiscount = orderSubtotal * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null && calculatedDiscount > coupon.getMaxDiscountAmount()) {
                calculatedDiscount = coupon.getMaxDiscountAmount();
            }
        } else {
            calculatedDiscount = coupon.getDiscountValue();
        }

        return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .calculatedDiscountAmount(Math.round(calculatedDiscount * 100.0) / 100.0)
                .message("Coupon applied successfully!")
                .build();
    }
}
