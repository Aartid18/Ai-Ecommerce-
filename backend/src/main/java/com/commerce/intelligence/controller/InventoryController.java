package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.InventoryDTOs.*;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.repository.PurchaseOrderRepository;
import com.commerce.intelligence.repository.SupplierRepository;
import com.commerce.intelligence.service.InventoryService;
import com.commerce.intelligence.service.ProductService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
@Tag(name = "Inventory & Operations", description = "Inventory health scorecard, stockout forecasting, dead stock analysis, and purchase order management")
public class InventoryController {

    private final InventoryService inventoryService;
    private final ProductService productService;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @GetMapping({"/health", "/health-scorecard"})
    @Operation(summary = "Inventory Health Scorecard", description = "Calculates stock health scores (CRITICAL, LOW_STOCK, HEALTHY, OVERSTOCKED), velocity, and stockout estimates")
    public ResponseEntity<List<InventoryHealthDTO>> getInventoryHealth() {
        return ResponseEntity.ok(inventoryService.getInventoryHealthOverview());
    }

    @GetMapping("/dead-stock")
    @Operation(summary = "Dead Stock Analytics", description = "Identifies products with zero sales exceeding threshold days (default 30 days) and calculates tied-up capital")
    public ResponseEntity<List<DeadStockDTO>> getDeadStock(
            @RequestParam(defaultValue = "30") int daysThreshold) {
        return ResponseEntity.ok(inventoryService.getDeadStockAnalytics(daysThreshold));
    }

    @GetMapping({"/reorder-recommendations", "/reorders"})
    @Operation(summary = "Reorder Recommendations", description = "Calculates lead-time aware reorder quantities and supplier suggestions")
    public ResponseEntity<List<ReorderRecommendationDTO>> getReorderRecommendations() {
        return ResponseEntity.ok(inventoryService.getReorderRecommendations());
    }

    @GetMapping("/transactions")
    @Operation(summary = "Inventory Transaction Audit Log", description = "Complete traceable log of all stock increases, deductions, and adjustments")
    public ResponseEntity<Page<InventoryTransactionResponse>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(inventoryService.getTransactions(PageRequest.of(page, size)));
    }

    @PostMapping("/adjust")
    @Operation(summary = "Manual Stock Adjustment", description = "Adjusts stock with an explicit audit reason and notes")
    public ResponseEntity<InventoryTransaction> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        Product product = productService.getProductEntity(request.getProductId());
        ProductVariant variant = request.getVariantId() != null ?
                product.getVariants().stream().filter(v -> v.getId().equals(request.getVariantId())).findFirst().orElse(null) : null;

        return ResponseEntity.ok(inventoryService.recordStockChange(
                product, variant, request.getQuantityChange(), request.getReason(), request.getNotes(), actor));
    }

    @GetMapping("/suppliers")
    @Operation(summary = "List Suppliers", description = "Returns active suppliers and standard lead times")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @GetMapping("/purchase-orders")
    @Operation(summary = "List Purchase Orders", description = "Returns all supplier purchase orders and delivery statuses")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderRepository.findAll());
    }

    @PostMapping("/purchase-orders")
    @Operation(summary = "Create Purchase Order", description = "Generates a new purchase order with lead time calculations")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(inventoryService.createPurchaseOrder(request, actor));
    }

    @PutMapping("/purchase-orders/{id}/receive")
    @Operation(summary = "Receive Purchase Order", description = "Marks PO as received and automatically increments physical stock")
    public ResponseEntity<PurchaseOrder> receivePurchaseOrder(@PathVariable Long id) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(inventoryService.receivePurchaseOrder(id, actor));
    }
}
