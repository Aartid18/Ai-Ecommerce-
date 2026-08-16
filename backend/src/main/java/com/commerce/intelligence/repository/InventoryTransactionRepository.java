package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByProductIdOrderByTimestampDesc(Long productId);
    Page<InventoryTransaction> findAllByOrderByTimestampDesc(Pageable pageable);
}
