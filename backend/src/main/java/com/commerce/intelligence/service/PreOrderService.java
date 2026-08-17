package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.PreOrderDTOs.*;
import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.PreOrderStatus;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PreOrderService {

    private final PreOrderRepository preOrderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final ActivityFeedSseService sseService;

    @Transactional
    public PreOrderResponse joinPreOrder(Long userId, JoinPreOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId()).orElse(null);
        }

        double unitPrice = variant != null && variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getFinalPrice();

        PreOrder preOrder = PreOrder.builder()
                .user(user)
                .product(product)
                .variant(variant)
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .status(PreOrderStatus.PENDING_STOCK)
                .expectedAvailabilityDate(product.getPreOrderExpectedAvailability() != null ? product.getPreOrderExpectedAvailability() : "14 Days")
                .build();

        PreOrder saved = preOrderRepository.save(preOrder);

        // Update product pre-order count
        product.setPreOrderCount(product.getPreOrderCount() + request.getQuantity());
        productRepository.save(product);

        notificationService.sendNotification(user, "Pre-Order Confirmed",
                "You joined the pre-order for " + product.getName() + ". Expected availability: " + saved.getExpectedAvailabilityDate(),
                "PREORDER", "/customer/preorders");

        sseService.publishEvent("PREORDER",
                "Pre-order created for " + product.getName() + " by " + user.getUsername() + " (Total Pre-orders: " + product.getPreOrderCount() + ")",
                product.getId().toString(),
                "/admin/preorders");

        auditService.logAction(user.getUsername(), "PREORDER_JOIN", "PreOrder", saved.getId().toString(), null, "Pre-order Qty: " + request.getQuantity(), "Customer joined pre-order");

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PreOrderResponse> getCustomerPreOrders(Long userId) {
        return preOrderRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreOrderDemandSummaryDTO> getAllPreOrderDemandSummaries() {
        List<Product> preOrderProducts = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getPreOrderEnabled()) || (p.getPreOrderCount() != null && p.getPreOrderCount() > 0))
                .collect(Collectors.toList());

        return preOrderProducts.stream()
                .map(p -> getPreOrderDemandSummary(p.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PreOrderResponse> getAllPendingPreOrders() {
        return preOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PreOrderDemandSummaryDTO getPreOrderDemandSummary(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        long preOrdersCount = preOrderRepository.countByProductIdAndStatus(productId, PreOrderStatus.PENDING_STOCK);
        double expectedRevenue = Math.round(preOrdersCount * product.getFinalPrice() * 100.0) / 100.0;

        double salesVelocity = product.getSalesVelocity() > 0 ? product.getSalesVelocity() : 2.0;
        int leadTimeDays = 7;
        int safetyStock = product.getSafetyStock() != null ? product.getSafetyStock() : 10;
        int expectedCancellations = (int) Math.round(preOrdersCount * 0.05); // 5% cancellation factor

        int recommendedStock = (int) (preOrdersCount + (salesVelocity * leadTimeDays) + safetyStock - expectedCancellations);
        int recommendedPurchase = Math.max(0, recommendedStock - product.getStock());

        return PreOrderDemandSummaryDTO.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .currentStock(product.getStock())
                .totalPreOrdersCount(preOrdersCount)
                .expectedRevenue(expectedRevenue)
                .recommendedStockQuantity(recommendedStock)
                .recommendedPurchaseQuantity(recommendedPurchase)
                .expectedAvailabilityDate(product.getPreOrderExpectedAvailability() != null ? product.getPreOrderExpectedAvailability() : "14 Days")
                .supplierLeadTimeInfo("Standard Lead Time: 7 Days")
                .build();
    }

    @Transactional
    public void fulfillPreOrdersForProduct(Long productId, String actor) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<PreOrder> pendingPreOrders = preOrderRepository.findByProductIdAndStatus(productId, PreOrderStatus.PENDING_STOCK);

        for (PreOrder po : pendingPreOrders) {
            if (product.getStock() >= po.getQuantity()) {
                product.setStock(product.getStock() - po.getQuantity());
                po.setStatus(PreOrderStatus.FULFILLED);
                po.setFulfilledAt(LocalDateTime.now());
                preOrderRepository.save(po);

                notificationService.sendNotification(po.getUser(), "Pre-Order Ready!",
                        "Stock arrived! Your pre-order for " + product.getName() + " has been converted to an active order.",
                        "PREORDER", "/customer/orders");
            }
        }

        Long count = preOrderRepository.countByProductIdAndStatus(productId, PreOrderStatus.PENDING_STOCK);
        product.setPreOrderCount(count != null ? count.intValue() : 0);
        productRepository.save(product);

        auditService.logAction(actor, "PREORDER_FULFILLMENT", "Product", productId.toString(), null, "Fulfilled pre-orders", "Fulfill stock arrival for pre-orders");
    }

    private PreOrderResponse mapToResponse(PreOrder po) {
        return PreOrderResponse.builder()
                .id(po.getId())
                .productId(po.getProduct().getId())
                .productName(po.getProduct().getName())
                .productSku(po.getProduct().getSku())
                .mainImageUrl(po.getProduct().getMainImageUrl())
                .variantId(po.getVariant() != null ? po.getVariant().getId() : null)
                .quantity(po.getQuantity())
                .unitPrice(po.getUnitPrice())
                .status(po.getStatus())
                .expectedAvailabilityDate(po.getExpectedAvailabilityDate())
                .createdAt(po.getCreatedAt())
                .build();
    }
}
