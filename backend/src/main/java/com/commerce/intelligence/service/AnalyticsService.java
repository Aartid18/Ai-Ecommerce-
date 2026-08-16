package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.AnalyticsDTOs.*;
import com.commerce.intelligence.model.Order;
import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import com.commerce.intelligence.model.enums.OrderStatus;
import com.commerce.intelligence.model.enums.RiskLevel;
import com.commerce.intelligence.repository.OrderRepository;
import com.commerce.intelligence.repository.ProductRepository;
import com.commerce.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public ExecutiveBriefingDTO getExecutiveBriefing() {
        List<BriefingItem> critical = new ArrayList<>();
        List<BriefingItem> opportunities = new ArrayList<>();

        inventoryService.getInventoryHealthOverview().stream()
                .filter(h -> h.getStatus() == InventoryHealthStatus.CRITICAL || h.getStatus() == InventoryHealthStatus.LOW_STOCK)
                .limit(3)
                .forEach(h -> critical.add(BriefingItem.builder()
                        .title(h.getProductName() + " may stock out in " + h.getEstimatedStockoutDays() + " days")
                        .description("Stock: " + h.getCurrentStock() + ", velocity: " + h.getSalesVelocity() + "/day")
                        .severity("HIGH")
                        .actionText("View Inventory")
                        .actionPath("/admin/inventory")
                        .build()));

        inventoryService.getDeadStockAnalytics(30).stream().limit(1).forEach(d -> critical.add(BriefingItem.builder()
                .title("₹" + String.format("%,.0f", d.getDeadStockValue()) + " dead stock detected")
                .description(d.getProductName() + " — last sale " + d.getDaysSinceLastSale() + " days ago")
                .severity("HIGH")
                .actionText("View Dead Stock")
                .actionPath("/admin/inventory")
                .build()));

        long highRisk = orderRepository.findByRiskLevel(RiskLevel.HIGH).size();
        if (highRisk > 0) {
            critical.add(BriefingItem.builder()
                    .title(highRisk + " high-risk orders require review")
                    .description("Orders flagged by risk engine awaiting manual decision")
                    .severity("HIGH")
                    .actionText("Review Orders")
                    .actionPath("/admin/risk")
                    .build());
        }

        productRepository.findAll().stream()
                .filter(p -> p.getSalesVelocity() != null && p.getSalesVelocity() > 3)
                .limit(3)
                .forEach(p -> opportunities.add(BriefingItem.builder()
                        .title(p.getName() + " sales trending up")
                        .description("Velocity: " + p.getSalesVelocity() + "/day")
                        .severity("LOW")
                        .actionText("View Product")
                        .actionPath("/admin/products")
                        .build()));

        long promoCandidates = productRepository.findAll().stream()
                .filter(p -> p.getInventoryHealthStatus() == InventoryHealthStatus.OVERSTOCKED
                        || p.getDaysSinceLastSale() > 30)
                .count();
        if (promoCandidates > 0) {
            opportunities.add(BriefingItem.builder()
                    .title(promoCandidates + " products suitable for promotion")
                    .description("Overstocked or slow-moving inventory detected")
                    .severity("MEDIUM")
                    .actionText("Demand Radar")
                    .actionPath("/admin/demand-radar")
                    .build());
        }

        return ExecutiveBriefingDTO.builder()
                .greeting("Good morning. Here's what needs attention.")
                .criticalIssues(critical)
                .opportunities(opportunities)
                .financialSnapshot(getFinancialSnapshot())
                .build();
    }

    @Transactional(readOnly = true)
    public FinancialSnapshotDTO getFinancialSnapshot() {
        Double revenue = safe(orderRepository.calculateTotalRevenue());
        Double cogs = safe(orderRepository.calculateTotalCOGS());
        Double discounts = safe(orderRepository.calculateTotalDiscounts());
        Double shipping = safe(orderRepository.calculateTotalShippingCosts());
        Double profit = safe(orderRepository.calculateTotalProfit());
        long orders = orderRepository.count();
        double aov = orders > 0 ? revenue / orders : 0;

        return FinancialSnapshotDTO.builder()
                .totalRevenue(revenue)
                .totalCOGS(cogs)
                .totalDiscounts(discounts)
                .totalShippingCosts(shipping)
                .totalReturnsRefunded(0.0)
                .estimatedProfit(profit)
                .profitMarginPercentage(revenue > 0 ? Math.round((profit / revenue) * 1000.0) / 10.0 : 0)
                .totalOrders(orders)
                .averageOrderValue(Math.round(aov * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public WhyRevenueChangedDTO getWhyRevenueChanged() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime prevWeekStart = now.minusDays(14);

        double currentWeek = sumRevenue(orderRepository.findRecentOrdersSince(weekStart));
        double prevWeek = sumRevenue(orderRepository.findRecentOrdersSince(prevWeekStart).stream()
                .filter(o -> o.getCreatedAt().isBefore(weekStart))
                .toList());

        double changePct = prevWeek > 0 ? Math.round(((currentWeek - prevWeek) / prevWeek) * 1000.0) / 10.0 : 0;

        List<ContributorFactor> factors = new ArrayList<>();
        factors.add(buildOrderCountFactor(weekStart, prevWeekStart));
        factors.add(buildCategoryFactor(weekStart, prevWeekStart, "Electronics"));
        factors.add(buildAovFactor(weekStart, prevWeekStart));

        String primary = factors.stream()
                .min(Comparator.comparingDouble(f -> f.getChangePercentage() != null ? f.getChangePercentage() : 0))
                .map(ContributorFactor::getExplanation)
                .orElse("Insufficient historical data for detailed analysis.");

        return WhyRevenueChangedDTO.builder()
                .periodComparison(String.format("Revenue %s %.1f%% compared to previous week",
                        changePct >= 0 ? "increased" : "decreased", Math.abs(changePct)))
                .overallChangePercentage(changePct)
                .topContributors(factors)
                .primaryRootCause(primary)
                .aiInsightSummary("Analysis based on actual order data from the last 14 days.")
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChartDataPoint> getDailySalesChart(int days) {
        LocalDate today = LocalDate.now();
        List<ChartDataPoint> points = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            List<Order> dayOrders = orderRepository.findRecentOrdersSince(start).stream()
                    .filter(o -> !o.getCreatedAt().isAfter(end))
                    .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                    .toList();
            double revenue = dayOrders.stream().mapToDouble(Order::getFinalAmount).sum();
            double profit = dayOrders.stream().mapToDouble(o -> o.getEstimatedProfit() != null ? o.getEstimatedProfit() : 0).sum();
            points.add(ChartDataPoint.builder()
                    .label(date.toString())
                    .revenue(Math.round(revenue * 100.0) / 100.0)
                    .profit(Math.round(profit * 100.0) / 100.0)
                    .orders(dayOrders.size())
                    .build());
        }
        return points;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary() {
        return Map.of(
                "totalCustomers", userRepository.count(),
                "totalProducts", productRepository.count(),
                "cancelledOrders", orderRepository.countCancelledOrders(),
                "returnedOrders", orderRepository.countReturnedOrders(),
                "financialSnapshot", getFinancialSnapshot()
        );
    }

    private double sumRevenue(List<Order> orders) {
        return orders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getFinalAmount)
                .sum();
    }

    private ContributorFactor buildOrderCountFactor(LocalDateTime weekStart, LocalDateTime prevStart) {
        long current = orderRepository.findRecentOrdersSince(weekStart).stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED).count();
        long prev = orderRepository.findRecentOrdersSince(prevStart).stream()
                .filter(o -> o.getCreatedAt().isBefore(weekStart))
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED).count();
        double pct = prev > 0 ? Math.round(((double)(current - prev) / prev) * 1000.0) / 10.0 : 0;
        return ContributorFactor.builder()
                .factorName("Orders")
                .changePercentage(pct)
                .impactType(pct >= 0 ? "POSITIVE" : "NEGATIVE")
                .explanation("Order volume changed " + pct + "% week-over-week")
                .build();
    }

    private ContributorFactor buildCategoryFactor(LocalDateTime weekStart, LocalDateTime prevStart, String category) {
        double current = revenueForCategory(orderRepository.findRecentOrdersSince(weekStart), category);
        double prev = revenueForCategory(
                orderRepository.findRecentOrdersSince(prevStart).stream()
                        .filter(o -> o.getCreatedAt().isBefore(weekStart)).toList(), category);
        double pct = prev > 0 ? Math.round(((current - prev) / prev) * 1000.0) / 10.0 : 0;
        return ContributorFactor.builder()
                .factorName(category + " sales")
                .changePercentage(pct)
                .impactType(pct >= 0 ? "POSITIVE" : "NEGATIVE")
                .explanation(category + " category revenue changed " + pct + "%")
                .build();
    }

    private ContributorFactor buildAovFactor(LocalDateTime weekStart, LocalDateTime prevStart) {
        List<Order> current = orderRepository.findRecentOrdersSince(weekStart).stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED).toList();
        List<Order> prev = orderRepository.findRecentOrdersSince(prevStart).stream()
                .filter(o -> o.getCreatedAt().isBefore(weekStart))
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED).toList();
        double currentAov = current.isEmpty() ? 0 : current.stream().mapToDouble(Order::getFinalAmount).average().orElse(0);
        double prevAov = prev.isEmpty() ? 0 : prev.stream().mapToDouble(Order::getFinalAmount).average().orElse(0);
        double pct = prevAov > 0 ? Math.round(((currentAov - prevAov) / prevAov) * 1000.0) / 10.0 : 0;
        return ContributorFactor.builder()
                .factorName("Average order value")
                .changePercentage(pct)
                .impactType(pct >= 0 ? "POSITIVE" : "NEGATIVE")
                .explanation("AOV changed " + pct + "% week-over-week")
                .build();
    }

    private double revenueForCategory(List<Order> orders, String categoryName) {
        return orders.stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .flatMap(o -> o.getItems().stream())
                .filter(item -> item.getProduct() != null
                        && item.getProduct().getCategory() != null
                        && categoryName.equalsIgnoreCase(item.getProduct().getCategory().getName()))
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();
    }

    private double safe(Double value) {
        return value != null ? value : 0.0;
    }
}
