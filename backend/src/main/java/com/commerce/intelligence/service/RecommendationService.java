package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.ProductDTOs.ProductResponse;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final BrowsingEventRepository browsingEventRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<RecommendedProduct> getRecommendationsForUser(Long userId) {
        Set<Long> seen = new HashSet<>();
        List<RecommendedProduct> results = new ArrayList<>();

        addFromPurchaseHistory(userId, seen, results);
        addFromWishlist(userId, seen, results);
        addFromCart(userId, seen, results);
        addPopularProducts(seen, results);

        return results.stream().limit(12).toList();
    }

    @Transactional(readOnly = true)
    public List<RecommendedProduct> getFrequentlyBoughtTogether(Long productId) {
        Product product = productService.getProductEntity(productId);
        String category = product.getCategory() != null ? product.getCategory().getName() : null;

        return productRepository.findAll().stream()
                .filter(p -> p.getActive() && !p.getId().equals(productId))
                .filter(p -> category == null || (p.getCategory() != null && category.equals(p.getCategory().getName())))
                .sorted(Comparator.comparing(Product::getSalesVelocity, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(4)
                .map(p -> RecommendedProduct.builder()
                        .product(productService.mapToProductResponse(p))
                        .reason("Frequently purchased together")
                        .build())
                .toList();
    }

    private void addFromPurchaseHistory(Long userId, Set<Long> seen, List<RecommendedProduct> results) {
        orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .flatMap(o -> o.getItems().stream())
                .map(OrderItem::getProduct)
                .filter(Objects::nonNull)
                .map(Product::getCategory)
                .filter(Objects::nonNull)
                .map(Category::getId)
                .distinct()
                .forEach(categoryId -> productRepository.findByCategoryIdAndActiveTrue(categoryId).stream()
                        .filter(p -> seen.add(p.getId()))
                        .limit(2)
                        .forEach(p -> results.add(RecommendedProduct.builder()
                                .product(productService.mapToProductResponse(p))
                                .reason("Because you bought from this category")
                                .build())));
    }

    private void addFromWishlist(Long userId, Set<Long> seen, List<RecommendedProduct> results) {
        wishlistRepository.findByUserId(userId).stream()
                .map(Wishlist::getProduct)
                .filter(Objects::nonNull)
                .forEach(wp -> productRepository.findByCategoryIdAndActiveTrue(wp.getCategory().getId()).stream()
                        .filter(p -> !p.getId().equals(wp.getId()) && seen.add(p.getId()))
                        .limit(1)
                        .forEach(p -> results.add(RecommendedProduct.builder()
                                .product(productService.mapToProductResponse(p))
                                .reason("Similar to your wishlist items")
                                .build())));
    }

    private void addFromCart(Long userId, Set<Long> seen, List<RecommendedProduct> results) {
        cartRepository.findByUserId(userId).ifPresent(cart -> cart.getItems().forEach(item -> {
            if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                productRepository.findByCategoryIdAndActiveTrue(item.getProduct().getCategory().getId()).stream()
                        .filter(p -> seen.add(p.getId()))
                        .limit(1)
                        .forEach(p -> results.add(RecommendedProduct.builder()
                                .product(productService.mapToProductResponse(p))
                                .reason("Complements items in your cart")
                                .build()));
            }
        }));
    }

    private void addPopularProducts(Set<Long> seen, List<RecommendedProduct> results) {
        productRepository.findAll().stream()
                .filter(Product::getActive)
                .sorted(Comparator.comparing(Product::getSalesVelocity, Comparator.nullsLast(Comparator.reverseOrder())))
                .filter(p -> seen.add(p.getId()))
                .limit(4)
                .forEach(p -> results.add(RecommendedProduct.builder()
                        .product(productService.mapToProductResponse(p))
                        .reason("Popular with customers")
                        .build()));
    }

    @Data
    @Builder
    public static class RecommendedProduct {
        private ProductResponse product;
        private String reason;
    }
}
