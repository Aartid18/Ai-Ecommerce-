package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.BrowsingEvent;
import com.commerce.intelligence.model.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BrowsingEventRepository extends JpaRepository<BrowsingEvent, Long> {
    List<BrowsingEvent> findByUserIdOrderByTimestampDesc(Long userId);

    @Query("SELECT COUNT(e) FROM BrowsingEvent e WHERE e.product.id = :productId AND e.eventType = :eventType AND e.timestamp >= :since")
    Long countEventsSince(@Param("productId") Long productId, @Param("eventType") EventType eventType, @Param("since") LocalDateTime since);

    @Query("SELECT e.searchQuery, COUNT(e) FROM BrowsingEvent e WHERE e.eventType = 'SEARCH' AND e.timestamp >= :since GROUP BY e.searchQuery ORDER BY COUNT(e) DESC")
    List<Object[]> findTopSearchesSince(@Param("since") LocalDateTime since);
}
