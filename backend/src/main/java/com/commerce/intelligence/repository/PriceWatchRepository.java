package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.PriceWatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceWatchRepository extends JpaRepository<PriceWatch, Long> {
    List<PriceWatch> findByUserId(Long userId);
    Optional<PriceWatch> findByUserIdAndProductId(Long userId, Long productId);
    Long countByProductId(Long productId);

    @Query("SELECT pw FROM PriceWatch pw WHERE pw.product.id = :productId AND pw.targetPrice >= :currentPrice AND pw.isNotified = false")
    List<PriceWatch> findTriggeredWatches(@Param("productId") Long productId, @Param("currentPrice") Double currentPrice);
}
