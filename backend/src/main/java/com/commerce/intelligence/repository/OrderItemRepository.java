package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT item.product.id, item.productName, SUM(item.quantity), SUM(item.totalPrice) FROM OrderItem item GROUP BY item.product.id, item.productName ORDER BY SUM(item.quantity) DESC")
    List<Object[]> findTopSellingProducts();
}
