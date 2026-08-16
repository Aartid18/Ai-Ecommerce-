package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.ProductDTOs.*;
import com.commerce.intelligence.model.Brand;
import com.commerce.intelligence.model.Category;
import com.commerce.intelligence.repository.BrandRepository;
import com.commerce.intelligence.repository.CategoryRepository;
import com.commerce.intelligence.service.DemandRadarService;
import com.commerce.intelligence.service.ProductService;
import com.commerce.intelligence.model.enums.EventType;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog, filtering, search, and inventory management")
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final DemandRadarService demandRadarService;

    @GetMapping
    @Operation(summary = "Search & Filter Products", description = "Paginated product catalog with category, brand, price, rating, and keyword filters")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<ProductResponse> products = productService.filterProducts(
                search, categoryId, brandId, minPrice, maxPrice, minRating, pageRequest);

        // Track browsing search event asynchronously
        if (search != null && !search.isBlank()) {
            Long userId = null;
            try { userId = SecurityUtils.getCurrentUserId(); } catch (Exception ignored) {}
            demandRadarService.trackEvent(userId, null, null, EventType.SEARCH, search);
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Product By ID", description = "Retrieves complete product details including specifications and variants")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);

        // Track browsing view event asynchronously
        Long userId = null;
        try { userId = SecurityUtils.getCurrentUserId(); } catch (Exception ignored) {}
        demandRadarService.trackEvent(userId, null, productService.getProductEntity(id), EventType.VIEW, null);

        return ResponseEntity.ok(product);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Create Product", description = "Adds a new product to the catalog (Admin / Inventory Manager only)")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(productService.createProduct(request, actor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update Product", description = "Updates product fields, pricing, and variants")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(productService.updateProduct(id, request, actor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate Product", description = "Soft-deletes/deactivates a product from the catalog")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        String actor = SecurityUtils.getCurrentUsername();
        productService.deleteProduct(id, actor);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    @Operation(summary = "List Categories", description = "Returns all available product categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/brands")
    @Operation(summary = "List Brands", description = "Returns all available product brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(brandRepository.findAll());
    }
}
