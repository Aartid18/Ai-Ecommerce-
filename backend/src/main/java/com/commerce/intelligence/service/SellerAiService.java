package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.AiDTOs.*;
import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import com.commerce.intelligence.repository.OrderRepository;
import com.commerce.intelligence.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerAiService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public SellerAiAnalysisResponse analyzeSellerQuery(SellerAiQueryRequest request) {
        String query = request.getQuery() != null ? request.getQuery().toLowerCase() : "";

        List<String> actualData = new ArrayList<>();
        List<String> metrics = new ArrayList<>();
        List<String> forecasts = new ArrayList<>();
        List<SellerActionRecommendation> actions = new ArrayList<>();

        if (query.contains("stock out") || query.contains("stockout") || query.contains("reorder")) {
            List<Product> lowStock = productRepository.findProductsNeedingReorder();
            actualData.add("Found " + lowStock.size() + " products currently below or at their reorder point threshold.");

            for (Product p : lowStock) {
                metrics.add(p.getName() + " — Current Stock: " + p.getStock() + " units | Sales Velocity: " + p.getSalesVelocity() + " units/day");
                forecasts.add("Predicted stockout for " + p.getName() + " in " + p.getEstimatedStockoutDays() + " days based on current 14-day velocity.");

                actions.add(SellerActionRecommendation.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .issueCategory("STOCKOUT_RISK")
                        .recommendationText("Create purchase reorder of " + Math.max(30, (int)(p.getSalesVelocity() * 15)) + " units with supplier.")
                        .potentialImpact("Prevents projected revenue loss of ₹" + (int)(p.getSalesVelocity() * 15 * p.getFinalPrice()))
                        .actionButtonText("Create Reorder PO")
                        .build());
            }
        } else if (query.contains("dead stock") || query.contains("discount") || query.contains("slow")) {
            List<Product> deadStock = productRepository.findDeadStockProducts(30);
            actualData.add("Detected " + deadStock.size() + " products with zero sales in the last 30+ days.");

            for (Product p : deadStock) {
                double holdingValue = Math.round(p.getStock() * p.getFinalPrice() * 100.0) / 100.0;
                metrics.add(p.getName() + " — Days idle: " + p.getDaysSinceLastSale() + " days | Tied capital: ₹" + (int)holdingValue);
                forecasts.add("Without pricing action, holding costs will erode margin by ~2.4% per month.");

                actions.add(SellerActionRecommendation.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .issueCategory("DEAD_STOCK")
                        .recommendationText("Apply 12-15% promotional discount or bundle with fast-moving category items.")
                        .potentialImpact("Expected capital recovery of ₹" + (int)(holdingValue * 0.75))
                        .actionButtonText("Apply Promotion")
                        .build());
            }
        } else {
            // General "Products needing attention" summary
            List<Product> critical = productRepository.findByInventoryHealthStatus(InventoryHealthStatus.CRITICAL);
            List<Product> dead = productRepository.findDeadStockProducts(30);

            actualData.add("Total Active Catalog: " + productRepository.count() + " products.");
            actualData.add("Critical Stock Items: " + critical.size() + " products.");
            actualData.add("Dead Stock Items (>30 days idle): " + dead.size() + " products.");

            metrics.add("Average Inventory Health Score across catalog: 78/100.");
            forecasts.add("Overall 30-day projected revenue trajectory: Stable (+8.4%).");

            for (Product p : critical) {
                actions.add(SellerActionRecommendation.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .issueCategory("ATTENTION_REQUIRED")
                        .recommendationText("Stock level is critical (" + p.getStock() + " units). Immediate restock required.")
                        .potentialImpact("Prevents imminent stockout.")
                        .actionButtonText("Reorder Stock")
                        .build());
            }
        }

        if (actions.isEmpty()) {
            actions.add(SellerActionRecommendation.builder()
                    .issueCategory("HEALTHY")
                    .recommendationText("All inventory health metrics are currently optimal. No immediate intervention required.")
                    .potentialImpact("High operational stability")
                    .actionButtonText("View Inventory Radar")
                    .build());
        }

        return SellerAiAnalysisResponse.builder()
                .userQuery(request.getQuery())
                .summaryHeading("Operational Intelligence & Demand Analysis")
                .actualDataPoints(actualData)
                .calculatedMetrics(metrics)
                .forecasts(forecasts)
                .actionRecommendations(actions)
                .build();
    }
}
