package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.Order;
import com.commerce.intelligence.model.enums.OrderStatus;
import com.commerce.intelligence.model.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByOrderStatus(OrderStatus orderStatus);
    List<Order> findByRiskLevel(RiskLevel riskLevel);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.orderStatus <> 'CANCELLED'")
    Double calculateTotalRevenue();

    @Query("SELECT SUM(o.estimatedProfit) FROM Order o WHERE o.orderStatus <> 'CANCELLED'")
    Double calculateTotalProfit();

    @Query("SELECT SUM(o.cogs) FROM Order o WHERE o.orderStatus <> 'CANCELLED'")
    Double calculateTotalCOGS();

    @Query("SELECT SUM(o.discountAmount) FROM Order o WHERE o.orderStatus <> 'CANCELLED'")
    Double calculateTotalDiscounts();

    @Query("SELECT SUM(o.shippingCost) FROM Order o WHERE o.orderStatus <> 'CANCELLED'")
    Double calculateTotalShippingCosts();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = 'CANCELLED'")
    Long countCancelledOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = 'RETURNED' OR o.orderStatus = 'RETURN_REQUESTED'")
    Long countReturnedOrders();

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :since ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersSince(@Param("since") LocalDateTime since);
}
