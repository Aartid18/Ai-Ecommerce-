package com.commerce.intelligence.model;

import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_sku", columnList = "sku"),
    @Index(name = "idx_product_name", columnList = "name"),
    @Index(name = "idx_product_category", columnList = "category_id"),
    @Index(name = "idx_product_brand", columnList = "brand_id"),
    @Index(name = "idx_product_active", columnList = "active"),
    @Index(name = "idx_product_health", columnList = "inventoryHealthStatus")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false)
    private Double price;

    @Builder.Default
    private Double costPrice = 0.0;

    @Builder.Default
    private Double discountPercentage = 0.0;

    @Column(nullable = false)
    private Double finalPrice;

    @Builder.Default
    private Integer stock = 0;

    private Double weight;
    private String dimensions;

    private String mainImageUrl;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> additionalImages = new ArrayList<>();

    @Builder.Default
    private Double rating = 4.5;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Boolean active = true;

    // Inventory & Intelligence Metrics
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InventoryHealthStatus inventoryHealthStatus = InventoryHealthStatus.HEALTHY;

    @Builder.Default
    private Integer inventoryHealthScore = 85;

    @Builder.Default
    private Double salesVelocity = 0.0; // daily sales

    @Builder.Default
    private Integer estimatedStockoutDays = 30;

    @Builder.Default
    private Integer daysSinceLastSale = 0;

    @Builder.Default
    private Integer reorderPoint = 15;

    @Builder.Default
    private Integer safetyStock = 10;

    // Pre-order fields
    @Builder.Default
    private Boolean preOrderEnabled = false;

    private String preOrderExpectedAvailability;

    @Builder.Default
    private Integer preOrderCount = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductSpecification> specifications = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        calculateFinalPrice();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateFinalPrice();
    }

    public void calculateFinalPrice() {
        if (this.price != null) {
            if (this.discountPercentage != null && this.discountPercentage > 0) {
                this.finalPrice = Math.round((this.price * (1 - this.discountPercentage / 100.0)) * 100.0) / 100.0;
            } else {
                this.finalPrice = this.price;
            }
        }
    }
}
