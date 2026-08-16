package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.DemandSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandSignalRepository extends JpaRepository<DemandSignal, Long> {
    Optional<DemandSignal> findByProductId(Long productId);

    @Query("SELECT d FROM DemandSignal d ORDER BY d.demandScore DESC")
    List<DemandSignal> findAllTopDemandOpportunities();
}
