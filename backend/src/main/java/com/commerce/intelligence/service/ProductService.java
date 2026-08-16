package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.ProductDTOs.*;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductSpecificationRepository specificationRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> filterProducts(
            String query, Long categoryId, Long brandId, Double minPrice, Double maxPrice, Double minRating, Pageable pageable) {

        return productRepository.filterProducts(query, categoryId, brandId, minPrice, maxPrice, minRating, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToProductResponse(product);
    }

    @Transactional(readOnly = true)
    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, String actor) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId()).orElse(null);
        }

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .description(request.getDescription())
                .category(category)
                .brand(brand)
                .price(request.getPrice())
                .costPrice(request.getCostPrice() != null ? request.getCostPrice() : request.getPrice() * 0.6)
                .discountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : 0.0)
                .stock(request.getStock() != null ? request.getStock() : 0)
                .weight(request.getWeight())
                .dimensions(request.getDimensions())
                .mainImageUrl(request.getMainImageUrl())
                .additionalImages(request.getAdditionalImages() != null ? request.getAdditionalImages() : new ArrayList<>())
                .reorderPoint(request.getReorderPoint() != null ? request.getReorderPoint() : 15)
                .safetyStock(request.getSafetyStock() != null ? request.getSafetyStock() : 10)
                .preOrderEnabled(request.getPreOrderEnabled() != null ? request.getPreOrderEnabled() : false)
                .preOrderExpectedAvailability(request.getPreOrderExpectedAvailability())
                .active(true)
                .build();

        product.calculateFinalPrice();
        Product savedProduct = productRepository.save(product);

        // Add variants if provided
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (ProductVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(savedProduct)
                        .sku(vr.getSku())
                        .attributesJson(vr.getAttributesJson())
                        .priceOverride(vr.getPriceOverride())
                        .stock(vr.getStock() != null ? vr.getStock() : 0)
                        .weight(vr.getWeight())
                        .active(true)
                        .build();
                variantRepository.save(variant);
            }
        }

        // Add specifications if provided
        if (request.getSpecifications() != null && !request.getSpecifications().isEmpty()) {
            for (ProductSpecificationRequest sr : request.getSpecifications()) {
                ProductSpecification spec = ProductSpecification.builder()
                        .product(savedProduct)
                        .specKey(sr.getSpecKey())
                        .specValue(sr.getSpecValue())
                        .build();
                specificationRepository.save(spec);
            }
        }

        auditService.logAction(actor, "PRODUCT_CREATE", "Product", savedProduct.getId().toString(), null, savedProduct.getName(), "Created new product");

        return mapToProductResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, String actor) {
        Product product = getProductEntity(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId()).orElse(null);
        }

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setPrice(request.getPrice());
        if (request.getCostPrice() != null) product.setCostPrice(request.getCostPrice());
        if (request.getDiscountPercentage() != null) product.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getWeight() != null) product.setWeight(request.getWeight());
        if (request.getDimensions() != null) product.setDimensions(request.getDimensions());
        if (request.getMainImageUrl() != null) product.setMainImageUrl(request.getMainImageUrl());
        if (request.getPreOrderEnabled() != null) product.setPreOrderEnabled(request.getPreOrderEnabled());
        if (request.getPreOrderExpectedAvailability() != null) product.setPreOrderExpectedAvailability(request.getPreOrderExpectedAvailability());

        product.calculateFinalPrice();
        Product updatedProduct = productRepository.save(product);

        auditService.logAction(actor, "PRODUCT_UPDATE", "Product", updatedProduct.getId().toString(), null, updatedProduct.getName(), "Updated product details");

        return mapToProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id, String actor) {
        Product product = getProductEntity(id);
        product.setActive(false); // soft delete
        productRepository.save(product);
        auditService.logAction(actor, "PRODUCT_DELETE", "Product", id.toString(), product.getName(), null, "Deactivated product");
    }

    public ProductResponse mapToProductResponse(Product product) {
        List<ProductVariantResponse> variantResponses = product.getVariants() != null ?
                product.getVariants().stream()
                        .map(v -> ProductVariantResponse.builder()
                                .id(v.getId())
                                .sku(v.getSku())
                                .attributesJson(v.getAttributesJson())
                                .priceOverride(v.getPriceOverride())
                                .stock(v.getStock())
                                .weight(v.getWeight())
                                .active(v.getActive())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        List<ProductSpecificationResponse> specResponses = product.getSpecifications() != null ?
                product.getSpecifications().stream()
                        .map(s -> ProductSpecificationResponse.builder()
                                .id(s.getId())
                                .specKey(s.getSpecKey())
                                .specValue(s.getSpecValue())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .discountPercentage(product.getDiscountPercentage())
                .finalPrice(product.getFinalPrice())
                .stock(product.getStock())
                .weight(product.getWeight())
                .dimensions(product.getDimensions())
                .mainImageUrl(product.getMainImageUrl())
                .additionalImages(product.getAdditionalImages())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .active(product.getActive())
                .inventoryHealthStatus(product.getInventoryHealthStatus())
                .inventoryHealthScore(product.getInventoryHealthScore())
                .salesVelocity(product.getSalesVelocity())
                .estimatedStockoutDays(product.getEstimatedStockoutDays())
                .daysSinceLastSale(product.getDaysSinceLastSale())
                .reorderPoint(product.getReorderPoint())
                .preOrderEnabled(product.getPreOrderEnabled())
                .preOrderExpectedAvailability(product.getPreOrderExpectedAvailability())
                .preOrderCount(product.getPreOrderCount())
                .variants(variantResponses)
                .specifications(specResponses)
                .build();
    }
}
