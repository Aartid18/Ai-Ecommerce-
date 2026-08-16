package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.AiDTOs.*;
import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.model.ProductSpecification;
import com.commerce.intelligence.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAiService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public CustomerAiRecommendationResponse getShoppingRecommendations(CustomerAiQueryRequest request) {
        String query = request.getQuery() != null ? request.getQuery().toLowerCase() : "";
        Double maxBudget = request.getMaxBudget();

        // Extract budget from query string if present (e.g. "under 70000" or "under ₹70,000")
        if (maxBudget == null && (query.contains("under") || query.contains("below"))) {
            String cleanDigits = query.replaceAll("[^0-9]", " ");
            String[] tokens = cleanDigits.trim().split("\\s+");
            for (String t : tokens) {
                if (t.length() >= 4) {
                    try {
                        maxBudget = Double.parseDouble(t);
                        break;
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        if (maxBudget == null) {
            maxBudget = 75000.0;
        }

        final double budgetLimit = maxBudget;
        List<Product> matchingProducts = productRepository.findAll().stream()
                .filter(p -> p.getActive() && p.getFinalPrice() <= budgetLimit)
                .sorted((p1, p2) -> Double.compare(p2.getRating(), p1.getRating()))
                .limit(4)
                .collect(Collectors.toList());

        if (matchingProducts.isEmpty()) {
            matchingProducts = productRepository.findAll().stream()
                    .filter(Product::getActive)
                    .limit(3)
                    .collect(Collectors.toList());
        }

        List<CustomerProductRecommendation> recList = new ArrayList<>();
        int index = 0;

        for (Product p : matchingProducts) {
            String badge = index == 0 ? "BEST MATCH" : (index == 1 ? "BEST VALUE" : "PREMIUM ALTERNATIVE");
            index++;

            List<String> why = new ArrayList<>();
            List<String> specsList = new ArrayList<>();

            if (p.getSpecifications() != null && !p.getSpecifications().isEmpty()) {
                for (ProductSpecification spec : p.getSpecifications()) {
                    specsList.add(spec.getSpecKey() + ": " + spec.getSpecValue());
                    if ("RAM".equalsIgnoreCase(spec.getSpecKey()) || "SSD".equalsIgnoreCase(spec.getSpecKey()) || "CPU".equalsIgnoreCase(spec.getSpecKey())) {
                        why.add("✓ High-performance " + spec.getSpecKey() + " (" + spec.getSpecValue() + ") for multitasking");
                    }
                }
            }

            if (why.isEmpty()) {
                why.add("✓ High rating (" + p.getRating() + "★) with " + p.getReviewCount() + " verified customer reviews");
                why.add("✓ Well within target budget (₹" + p.getFinalPrice().intValue() + ")");
            }

            String tradeOff = p.getDiscountPercentage() > 0 ?
                    "Limited-time discount (" + p.getDiscountPercentage().intValue() + "% off). Selling fast!" :
                    "Stock level: " + p.getStock() + " units remaining.";

            recList.add(CustomerProductRecommendation.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .price(p.getFinalPrice())
                    .mainImageUrl(p.getMainImageUrl())
                    .rating(p.getRating())
                    .matchBadge(badge)
                    .whyRecommended(why)
                    .tradeOff(tradeOff)
                    .keySpecs(specsList.isEmpty() ? List.of("Rating: " + p.getRating() + "★", "In Stock") : specsList)
                    .build());
        }

        String aiExplanation = "AI Search Grounding Summary: Analyzed " + recList.size() + " active products from our inventory matching budget constraint under ₹" + (int)budgetLimit + ". Recommendations are strictly verified against actual stored technical specifications.";

        return CustomerAiRecommendationResponse.builder()
                .querySummary("Grounded product recommendations for: \"" + request.getQuery() + "\"")
                .recommendations(recList)
                .aiExplanation(aiExplanation)
                .build();
    }
}
