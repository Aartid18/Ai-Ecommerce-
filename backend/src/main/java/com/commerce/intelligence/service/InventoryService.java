package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.InventoryDTOs.*;
import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.InventoryHealthStatus;
import com.commerce.intelligence.model.enums.InventoryTransactionReason;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AuditService auditService;
    private final ActivityFeedSseService sseService;

    @Transactional
    public InventoryTransaction recordStockChange(
            Product product, ProductVariant variant, int quantityChange, InventoryTransactionReason reason, String notes, String actor) {

        int before = variant != null ? variant.getStock() : product.getStock();
        int after = before + quantityChange;

        if (after < 0) {
            throw new BadRequestException("Insufficient stock for product " + product.getName() + ". Available: " + before + ", Requested reduction: " + Math.abs(quantityChange));
        }

        if (variant != null) {
            variant.setStock(after);
            variantRepository.save(variant);
        } else {
            product.setStock(after);
        }

        // Recalculate Inventory Health Score and Status
        updateInventoryHealthMetrics(product);
        productRepository.save(product);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .variant(variant)
                .quantityBefore(before)
                .quantityChange(quantityChange)
                .quantityAfter(after)
                .reason(reason)
                .notes(notes)
                .changedBy(actor != null ? actor : "SYSTEM")
                .build();

        InventoryTransaction savedTx = transactionRepository.save(transaction);

        // SSE notification if critical or low stock
        if (product.getInventoryHealthStatus() == InventoryHealthStatus.CRITICAL || product.getInventoryHealthStatus() == InventoryHealthStatus.LOW_STOCK) {
            sseService.publishEvent("STOCK",
                    "Stock alert for " + product.getName() + ": level changed " + before + " -> " + after + " (" + product.getInventoryHealthStatus() + ")",
                    product.getId().toString(),
                    "/admin/inventory");
        }

        auditService.logAction(actor, "STOCK_ADJUSTMENT", "Product", product.getId().toString(),
                "Stock: " + before, "Stock: " + after, "Reason: " + reason + " - " + notes);

        return savedTx;
    }

    public void updateInventoryHealthMetrics(Product product) {
        int currentStock = product.getStock();
        double salesVelocity = product.getSalesVelocity() > 0 ? product.getSalesVelocity() : 1.5; // fallback default
        int estimatedStockoutDays = (int) Math.ceil(currentStock / salesVelocity);

        product.setEstimatedStockoutDays(estimatedStockoutDays);

        int reorderPoint = product.getReorderPoint() != null ? product.getReorderPoint() : 15;
        int safetyStock = product.getSafetyStock() != null ? product.getSafetyStock() : 10;

        InventoryHealthStatus status;
        int healthScore;

        if (currentStock <= safetyStock) {
            status = InventoryHealthStatus.CRITICAL;
            healthScore = Math.max(10, currentStock * 3);
        } else if (currentStock <= reorderPoint) {
            status = InventoryHealthStatus.LOW_STOCK;
            healthScore = 40 + (currentStock - safetyStock) * 2;
        } else if (currentStock > reorderPoint * 4) {
            status = InventoryHealthStatus.OVERSTOCKED;
            healthScore = 65;
        } else {
            status = InventoryHealthStatus.HEALTHY;
            healthScore = Math.min(100, 75 + (currentStock - reorderPoint));
        }

        product.setInventoryHealthStatus(status);
        product.setInventoryHealthScore(healthScore);
    }

    @Transactional(readOnly = true)
    public List<InventoryHealthDTO> getInventoryHealthOverview() {
        return productRepository.findAll().stream()
                .map(p -> {
                    updateInventoryHealthMetrics(p);
                    String rec = switch (p.getInventoryHealthStatus()) {
                        case CRITICAL -> "Restock immediately within 24 hours. Critical stockout imminent.";
                        case LOW_STOCK -> "Reorder recommended. Estimated remaining stock: " + p.getEstimatedStockoutDays() + " days.";
                        case OVERSTOCKED -> "Consider 10-15% promotion or bundle to clear excess holding cost.";
                        case HEALTHY -> "Stock level optimal. Next projected reorder in " + p.getEstimatedStockoutDays() + " days.";
                    };
                    return InventoryHealthDTO.builder()
                            .productId(p.getId())
                            .productName(p.getName())
                            .sku(p.getSku())
                            .currentStock(p.getStock())
                            .salesVelocity(p.getSalesVelocity())
                            .estimatedStockoutDays(p.getEstimatedStockoutDays())
                            .reorderPoint(p.getReorderPoint())
                            .status(p.getInventoryHealthStatus())
                            .healthScore(p.getInventoryHealthScore())
                            .recommendation(rec)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeadStockDTO> getDeadStockAnalytics(int daysThreshold) {
        List<Product> deadProducts = productRepository.findDeadStockProducts(daysThreshold);
        return deadProducts.stream()
                .map(p -> DeadStockDTO.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .sku(p.getSku())
                        .stockQuantity(p.getStock())
                        .unitPrice(p.getFinalPrice())
                        .deadStockValue(Math.round(p.getStock() * p.getFinalPrice() * 100.0) / 100.0)
                        .daysSinceLastSale(p.getDaysSinceLastSale())
                        .recommendedAction(p.getDaysSinceLastSale() > 60 ?
                                "Apply 20% liquidation discount or create bundle with top seller" :
                                "Consider 10% promotional campaign")
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReorderRecommendationDTO> getReorderRecommendations() {
        List<Product> lowStockProducts = productRepository.findProductsNeedingReorder();
        List<Supplier> suppliers = supplierRepository.findAll();
        Supplier defaultSupplier = suppliers.isEmpty() ? null : suppliers.get(0);

        return lowStockProducts.stream()
                .map(p -> {
                    double salesVel = p.getSalesVelocity() > 0 ? p.getSalesVelocity() : 2.0;
                    int leadTime = defaultSupplier != null ? defaultSupplier.getLeadTimeDays() : 7;
                    int recommendedQty = (int) Math.ceil((salesVel * leadTime * 2) + p.getSafetyStock() - p.getStock());

                    return ReorderRecommendationDTO.builder()
                            .productId(p.getId())
                            .productName(p.getName())
                            .sku(p.getSku())
                            .currentStock(p.getStock())
                            .salesVelocity(salesVel)
                            .predictedStockoutDays(p.getEstimatedStockoutDays())
                            .recommendedReorderQuantity(Math.max(20, recommendedQty))
                            .suggestedSupplierId(defaultSupplier != null ? defaultSupplier.getId() : null)
                            .suggestedSupplierName(defaultSupplier != null ? defaultSupplier.getName() : "Primary Supplier")
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request, String actor) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId()).orElse(null);
        }

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber("PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .supplier(supplier)
                .product(product)
                .variant(variant)
                .quantity(request.getQuantity())
                .unitCost(request.getUnitCost() != null ? request.getUnitCost() : product.getCostPrice())
                .status("ORDERED")
                .expectedDeliveryDate(request.getExpectedDeliveryDate() != null ? request.getExpectedDeliveryDate() : LocalDate.now().plusDays(supplier.getLeadTimeDays()))
                .build();

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        auditService.logAction(actor, "PURCHASE_ORDER_CREATE", "PurchaseOrder", savedPo.getId().toString(), null, savedPo.getPoNumber(), "Created purchase order for " + request.getQuantity() + " units");

        return savedPo;
    }

    @Transactional
    public PurchaseOrder receivePurchaseOrder(Long poId, String actor) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + poId));

        if ("RECEIVED".equalsIgnoreCase(po.getStatus())) {
            throw new BadRequestException("Purchase Order has already been received");
        }

        po.setStatus("RECEIVED");
        po.setReceivedAt(java.time.LocalDateTime.now());
        purchaseOrderRepository.save(po);

        // Record stock addition
        recordStockChange(po.getProduct(), po.getVariant(), po.getQuantity(), InventoryTransactionReason.SUPPLIER_RECEIPT, "Received via " + po.getPoNumber(), actor);

        auditService.logAction(actor, "PURCHASE_ORDER_RECEIVE", "PurchaseOrder", po.getId().toString(), "ORDERED", "RECEIVED", "Stock updated for PO " + po.getPoNumber());

        return po;
    }

    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse> getTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByTimestampDesc(pageable)
                .map(t -> InventoryTransactionResponse.builder()
                        .id(t.getId())
                        .productId(t.getProduct().getId())
                        .productName(t.getProduct().getName())
                        .productSku(t.getProduct().getSku())
                        .variantId(t.getVariant() != null ? t.getVariant().getId() : null)
                        .variantSku(t.getVariant() != null ? t.getVariant().getSku() : null)
                        .quantityBefore(t.getQuantityBefore())
                        .quantityChange(t.getQuantityChange())
                        .quantityAfter(t.getQuantityAfter())
                        .reason(t.getReason())
                        .notes(t.getNotes())
                        .changedBy(t.getChangedBy())
                        .timestamp(t.getTimestamp())
                        .build());
    }
}
