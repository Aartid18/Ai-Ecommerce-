package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.AnalyticsDTOs.*;
import com.commerce.intelligence.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'ORDER_MANAGER')")
@Tag(name = "Analytics & Intelligence", description = "Executive briefing, financial snapshots (Revenue, COGS, Profit), 'Why Revenue Changed' root cause analysis, and sales charts")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping({"/briefing", "/executive-briefing"})
    @Operation(summary = "Morning Executive Briefing", description = "Morning overview of critical issues (stockouts, dead stock, risk review), opportunities, and financials")
    public ResponseEntity<ExecutiveBriefingDTO> getExecutiveBriefing() {
        return ResponseEntity.ok(analyticsService.getExecutiveBriefing());
    }

    @GetMapping("/financial-snapshot")
    @Operation(summary = "Financial Snapshot", description = "Calculates Revenue, COGS, Discounts, Shipping, Estimated Profit, and Profit Margin")
    public ResponseEntity<FinancialSnapshotDTO> getFinancialSnapshot() {
        return ResponseEntity.ok(analyticsService.getFinancialSnapshot());
    }

    @GetMapping("/why-revenue-changed")
    @Operation(summary = "'Why Did Revenue Change?' Analytics", description = "Explainable root-cause breakdown of revenue variance (Orders, category performance, AOV, returns)")
    public ResponseEntity<WhyRevenueChangedDTO> getWhyRevenueChanged() {
        return ResponseEntity.ok(analyticsService.getWhyRevenueChanged());
    }

    @GetMapping({"/sales-chart", "/sales-trend"})
    @Operation(summary = "Sales & Profit Trend Chart", description = "Historical daily sales, revenue, profit, and order volume data for Recharts")
    public ResponseEntity<List<ChartDataPoint>> getSalesChart(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(analyticsService.getDailySalesChart(days));
    }

    @GetMapping("/summary")
    @Operation(summary = "Platform Summary Metrics", description = "High-level aggregate customer, product, and order counters")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }
}
