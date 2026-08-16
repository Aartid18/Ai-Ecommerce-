package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.PreOrder;
import com.commerce.intelligence.model.enums.PreOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreOrderRepository extends JpaRepository<PreOrder, Long> {
    List<PreOrder> findByUserId(Long userId);
    List<PreOrder> findByProductId(Long productId);
    List<PreOrder> findByProductIdAndStatus(Long productId, PreOrderStatus status);
    Long countByProductIdAndStatus(Long productId, PreOrderStatus status);
}
