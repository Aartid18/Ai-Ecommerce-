package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.DemandDTOs.*;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.EventType;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemandRadarService {

    private final BrowsingEventRepository browsingEventRepository;
    private final DemandSignalRepository demandSignalRepository;
    private final ProductRepository productRepository;
    private final WishlistRepository wishlistRepository;
    private final PriceWatchRepository priceWatchRepository;
    private final AuditService auditService;
    private final ActivityFeedSseService sseService;

    @Async
    public void trackEvent(Long userId, String sessionKey, Product product, EventType eventType, String searchQuery) {
        BrowsingEvent event = BrowsingEvent.builder()
                .userId(userId)
                .sessionKey(sessionKey)
                .product(product)
                .eventType(eventType)
                .searchQuery(searchQuery)
                .build();
        browsingEventRepository.save(event);

        if (product != null) {
            updateDemandSignalForProduct(product.getId());
        }
    }

    @Transactional
    public DemandSignal updateDemandSignalForProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        LocalDateTime last14Days = LocalDateTime.now().minusDays(14);

        long recentViews = browsingEventRepository.countEventsSince(productId, EventType.VIEW, last7Days);
        long recentSearches = browsingEventRepository.countEventsSince(productId, EventType.SEARCH, last7Days);
        long recentCartAdds = browsingEventRepository.countEventsSince(productId, EventType.CART_ADD, last7Days);
        long wishlistCount = wishlistRepository.countByProductId(productId);
        long priceWatchCount = priceWatchRepository.countByProductId(productId);

        long prevViews = browsingEventRepository.countEventsSince(productId, EventType.VIEW, last14Days) - recentViews;
        double trendPercentage = prevViews > 0 ? Math.round(((double) (recentViews - prevViews) / prevViews) * 100.0 * 10.0) / 10.0 : 18.5;

        // Calculate Demand Score 0 - 100
        int demandScore = (int) Math.min(100, Math.max(10,
                (recentViews * 2) + (recentSearches * 3) + (wishlistCount * 5) + (priceWatchCount * 6) + (recentCartAdds * 4)));

        String status = demandScore >= 70 ? "HIGH" : (demandScore >= 40 ? "MODERATE" : "LOW");

        double minTargetPrice = Math.round((product.getPrice() * 0.82) * 100.0) / 100.0;
        double maxTargetPrice = Math.round((product.getPrice() * 0.88) * 100.0) / 100.0;
        String priceRange = "₹" + (int)minTargetPrice + " – ₹" + (int)maxTargetPrice;
        double recommendedPrice = maxTargetPrice;

        String action;
        if ("HIGH".equals(status) && (recentCartAdds < (recentViews * 0.1))) {
            action = "Consider a ₹" + (int)recommendedPrice + " promotion because demand (wishlists: " + wishlistCount + ", price watches: " + priceWatchCount + ") is high while cart conversion is low.";
        } else if ("HIGH".equals(status) && product.getStock() < 25) {
            action = "High demand (+ " + trendPercentage + "% trend). Recommended stock increase within 48 hours.";
        } else if ("LOW".equals(status)) {
            action = "Demand declining. Recommend product bundle or promotional campaign.";
        } else {
            action = "Demand stable. Maintain current price and stock levels.";
        }

        DemandSignal signal = demandSignalRepository.findByProductId(productId)
                .orElse(DemandSignal.builder().product(product).build());

        signal.setSearchCount((int) recentSearches);
        signal.setViewCount((int) recentViews);
        signal.setWishlistCount((int) wishlistCount);
        signal.setPriceWatchCount((int) priceWatchCount);
        signal.setCartAddCount((int) recentCartAdds);
        signal.setDemandScore(demandScore);
        signal.setDemandTrendPercentage(trendPercentage);
        signal.setStatus(status);
        signal.setTargetDemandPriceRange(priceRange);
        signal.setRecommendedPrice(recommendedPrice);
        signal.setRecommendedAction(action);

        return demandSignalRepository.save(signal);
    }

    @Transactional(readOnly = true)
    public List<DemandSignalDTO> getDemandRadarOpportunities() {
        List<DemandSignal> signals = demandSignalRepository.findAllTopDemandOpportunities();
        if (signals.isEmpty()) {
            // Recalculate signals for all products if empty
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                updateDemandSignalForProduct(p.getId());
            }
            signals = demandSignalRepository.findAllTopDemandOpportunities();
        }

        return signals.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Product applySmartDealPromotion(ApplyPromotionRequest request, String actor) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        double oldPrice = product.getFinalPrice();

        if (request.getNewPrice() != null) {
            product.setPrice(request.getNewPrice());
            product.setDiscountPercentage(0.0);
        } else if (request.getDiscountPercentage() != null) {
            product.setDiscountPercentage(request.getDiscountPercentage());
        }

        product.calculateFinalPrice();
        Product savedProduct = productRepository.save(product);

        sseService.publishEvent("PRICE",
                "Promotion applied for " + product.getName() + ": price dropped ₹" + (int)oldPrice + " -> ₹" + (int)(double)product.getFinalPrice(),
                product.getId().toString(),
                "/customer/products");

        auditService.logAction(actor, "PROMOTION_APPLIED", "Product", product.getId().toString(),
                "Old Price: " + oldPrice, "New Price: " + savedProduct.getFinalPrice(), request.getPromotionNotes());

        return savedProduct;
    }

    private DemandSignalDTO mapToDTO(DemandSignal signal) {
        Product p = signal.getProduct();
        return DemandSignalDTO.builder()
                .id(signal.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSku(p.getSku())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : "")
                .currentPrice(p.getFinalPrice())
                .currentStock(p.getStock())
                .salesVelocity(p.getSalesVelocity())
                .searchCount(signal.getSearchCount())
                .viewCount(signal.getViewCount())
                .wishlistCount(signal.getWishlistCount())
                .priceWatchCount(signal.getPriceWatchCount())
                .cartAddCount(signal.getCartAddCount())
                .preOrderInterestCount(signal.getPreOrderInterestCount())
                .demandScore(signal.getDemandScore())
                .demandTrendPercentage(signal.getDemandTrendPercentage())
                .status(signal.getStatus())
                .targetDemandPriceRange(signal.getTargetDemandPriceRange())
                .recommendedPrice(signal.getRecommendedPrice())
                .recommendedAction(signal.getRecommendedAction())
                .updatedAt(signal.getUpdatedAt())
                .build();
    }
}
