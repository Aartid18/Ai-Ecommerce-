package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    Long countByCouponIdAndUserId(Long couponId, Long userId);
    List<CouponUsage> findByUserId(Long userId);
}
