package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.DemandDTOs.SmartDealRecommendationDTO;
import com.commerce.intelligence.model.DemandSignal;
import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import com.commerce.intelligence.repository.DemandSignalRepository;
import com.commerce.intelligence.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SmartDealEngineService {

    private final DemandSignalRepository demandSignalRepository;
    private final ProductRepository productRepository;
    private final DemandRadarService demandRadarService;

    @Transactional(readOnly = true)
    public List<SmartDealRecommendationDTO> getSmartDealRecommendations() {
        List<SmartDealRecommendationDTO> recommendations = new ArrayList<>();

        List<DemandSignal> signals = demandSignalRepository.findAllTopDemandOpportunities();
        if (signals.isEmpty()) {
            productRepository.findAll().forEach(p -> demandRadarService.updateDemandSignalForProduct(p.getId()));
            signals = demandSignalRepository.findAllTopDemandOpportunities();
        }

        for (DemandSignal signal : signals) {
            Product product = signal.getProduct();
            if (product == null) continue;

            SmartDealRecommendationDTO deal = buildFromDemandSignal(signal, product);
            if (deal != null) recommendations.add(deal);
        }

        productRepository.findAll().stream()
                .filter(p -> p.getInventoryHealthStatus() == InventoryHealthStatus.OVERSTOCKED
                        || (p.getDaysSinceLastSale() != null && p.getDaysSinceLastSale() > 30))
                .forEach(p -> {
                    if (recommendations.stream().noneMatch(r -> r.getProductId().equals(p.getId()))) {
                        recommendations.add(buildDeadStockDeal(p));
                    }
                });

        return recommendations.stream()
                .sorted(Comparator.comparing(SmartDealRecommendationDTO::getRecommendedDiscountPercentage).reversed())
                .limit(20)
                .toList();
    }

    private SmartDealRecommendationDTO buildFromDemandSignal(DemandSignal signal, Product product) {
        if (!"HIGH".equals(signal.getStatus()) && !"MODERATE".equals(signal.getStatus())) {
            return null;
        }

        double discount = signal.getRecommendedPrice() != null && product.getFinalPrice() > 0
                ? Math.round((1 - signal.getRecommendedPrice() / product.getFinalPrice()) * 1000.0) / 10.0
                : 10.0;

        if (discount <= 0) discount = 8.0;

        String reason = String.format(
                "Demand score %d (%s). Wishlists: %d, price watches: %d, cart adds: %d. %s",
                signal.getDemandScore(), signal.getStatus(),
                signal.getWishlistCount(), signal.getPriceWatchCount(), signal.getCartAddCount(),
                signal.getRecommendedAction() != null ? signal.getRecommendedAction() : "");

        return SmartDealRecommendationDTO.builder()
                .productId(product.getId())
                .productName(product.getName())
                .currentPrice(product.getFinalPrice())
                .recommendedPrice(signal.getRecommendedPrice())
                .recommendedDiscountPercentage(discount)
                .dealReason(reason)
                .potentialImpact("Estimated conversion lift based on price-watch target range")
                .build();
    }

    private SmartDealRecommendationDTO buildDeadStockDeal(Product product) {
        double discount = product.getDaysSinceLastSale() != null && product.getDaysSinceLastSale() > 45 ? 15.0 : 10.0;
        double newPrice = Math.round(product.getFinalPrice() * (1 - discount / 100.0) * 100.0) / 100.0;

        return SmartDealRecommendationDTO.builder()
                .productId(product.getId())
                .productName(product.getName())
                .currentPrice(product.getFinalPrice())
                .recommendedPrice(newPrice)
                .recommendedDiscountPercentage(discount)
                .dealReason("Dead-stock risk: last sale " + product.getDaysSinceLastSale()
                        + " days ago, stock " + product.getStock())
                .potentialImpact("Reduce holding cost and recover inventory value")
                .build();
    }
}
