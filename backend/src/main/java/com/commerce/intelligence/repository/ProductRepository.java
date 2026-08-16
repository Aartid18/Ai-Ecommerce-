package com.commerce.intelligence.repository;

import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    Page<Product> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
           "(:minPrice IS NULL OR p.finalPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.finalPrice <= :maxPrice) AND " +
           "(:minRating IS NULL OR p.rating >= :minRating)")
    Page<Product> filterProducts(
            @Param("query") String query,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    List<Product> findByInventoryHealthStatus(InventoryHealthStatus status);

    @Query("SELECT p FROM Product p WHERE p.daysSinceLastSale >= :days AND p.stock > 0 AND p.active = true")
    List<Product> findDeadStockProducts(@Param("days") Integer days);

    @Query("SELECT p FROM Product p WHERE p.stock <= p.reorderPoint AND p.active = true")
    List<Product> findProductsNeedingReorder();

    List<Product> findTop8ByActiveTrueOrderBySalesVelocityDesc();

    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
}
