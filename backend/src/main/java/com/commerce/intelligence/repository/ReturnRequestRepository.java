package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.ReturnRequest;
import com.commerce.intelligence.model.enums.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Optional<ReturnRequest> findByOrderId(Long orderId);
    List<ReturnRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ReturnRequest> findByStatus(ReturnStatus status);
}
