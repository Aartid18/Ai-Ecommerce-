package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.OrderDTOs.*;
import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.*;
import com.commerce.intelligence.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CustomerProfileRepository profileRepository;
    private final InventoryService inventoryService;
    private final RiskEngineService riskEngineService;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final ActivityFeedSseService sseService;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderResponse createOrderFromCart(Long userId, CheckoutRequest checkoutRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Cart is empty for checkout"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        double totalAmount = cart.getTotalAmount();
        double discountAmount = cart.getDiscountAmount();
        double shippingFee = totalAmount >= 999.0 ? 0.0 : 80.0;
        double taxAmount = Math.round(totalAmount * 0.05 * 100.0) / 100.0; // 5% estimated tax
        double finalAmount = Math.round((totalAmount - discountAmount + shippingFee + taxAmount) * 100.0) / 100.0;

        // Calculate Cost of Goods Sold (COGS) & Profitability
        double totalCOGS = 0.0;
        for (CartItem item : cart.getItems()) {
            double itemCost = item.getProduct().getCostPrice() != null ? item.getProduct().getCostPrice() : item.getProduct().getPrice() * 0.6;
            totalCOGS += (itemCost * item.getQuantity());
        }

        double estimatedProfit = Math.round((finalAmount - totalCOGS - shippingFee) * 100.0) / 100.0;
        double marginPct = finalAmount > 0 ? Math.round((estimatedProfit / finalAmount) * 100.0 * 10.0) / 10.0 : 0.0;

        // Risk Engine Evaluation
        RiskEngineService.RiskEvaluationResult riskResult = riskEngineService.evaluateOrderRisk(user, checkoutRequest, finalAmount);

        String riskReasonsJson;
        try {
            riskReasonsJson = objectMapper.writeValueAsString(riskResult.getReasons());
        } catch (JsonProcessingException e) {
            riskReasonsJson = "[\"" + String.join("\", \"", riskResult.getReasons()) + "\"]";
        }

        PaymentMethod paymentMethod = checkoutRequest.getPaymentMethod() != null ? checkoutRequest.getPaymentMethod() : PaymentMethod.COD;
        PaymentStatus initialPaymentStatus = paymentMethod == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.SUCCESS;

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .customerName(checkoutRequest.getCustomerName())
                .customerEmail(checkoutRequest.getCustomerEmail())
                .phone(checkoutRequest.getPhone())
                .shippingAddress(checkoutRequest.getShippingAddress())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .couponCode(cart.getAppliedCouponCode())
                .shippingFee(shippingFee)
                .taxAmount(taxAmount)
                .finalAmount(finalAmount)
                .paymentStatus(initialPaymentStatus)
                .paymentMethod(paymentMethod)
                .orderStatus(OrderStatus.PENDING)
                .riskScore(riskResult.getScore())
                .riskLevel(riskResult.getLevel())
                .riskReasonsJson(riskReasonsJson)
                .isRiskReviewed(riskResult.getLevel() == RiskLevel.LOW)
                .cogs(Math.round(totalCOGS * 100.0) / 100.0)
                .shippingCost(shippingFee)
                .estimatedProfit(estimatedProfit)
                .profitMarginPercentage(marginPct)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Deduct inventory & create OrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            inventoryService.recordStockChange(
                    cartItem.getProduct(),
                    cartItem.getVariant(),
                    -cartItem.getQuantity(),
                    InventoryTransactionReason.ORDER,
                    "Order #" + savedOrder.getOrderNumber(),
                    user.getUsername());

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .variant(cartItem.getVariant())
                    .productName(cartItem.getProduct().getName())
                    .sku(cartItem.getVariant() != null ? cartItem.getVariant().getSku() : cartItem.getProduct().getSku())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .unitCost(cartItem.getProduct().getCostPrice() != null ? cartItem.getProduct().getCostPrice() : cartItem.getProduct().getPrice() * 0.6)
                    .totalPrice(Math.round(cartItem.getQuantity() * cartItem.getUnitPrice() * 100.0) / 100.0)
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));
        }

        savedOrder.setItems(orderItems);

        // Record Initial Order Status History
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .previousStatus(null)
                .newStatus(OrderStatus.PENDING)
                .changedBy(user.getUsername())
                .reason("Order created by customer")
                .notes("Payment Method: " + paymentMethod)
                .build();
        statusHistoryRepository.save(history);

        // Create Payment abstraction record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentTransactionId("PAY-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase())
                .amount(finalAmount)
                .status(initialPaymentStatus)
                .paymentMethod(paymentMethod)
                .providerReference("MOCK-GATEWAY-REF")
                .build();
        paymentRepository.save(payment);

        // Update CustomerProfile metrics
        CustomerProfile profile = profileRepository.findByUser(user).orElse(null);
        if (profile != null) {
            profile.setTotalOrdersPlaced(profile.getTotalOrdersPlaced() + 1);
            profile.setTotalSpent(profile.getTotalSpent() + finalAmount);
            profileRepository.save(profile);
        }

        // Clear cart
        cart.getItems().clear();
        cart.setAppliedCouponCode(null);
        cart.setDiscountAmount(0.0);
        cart.setTotalAmount(0.0);
        cart.setFinalAmount(0.0);
        cartRepository.save(cart);

        // Notifications & SSE Activity Stream
        notificationService.sendNotification(user, "Order Confirmed!",
                "Order #" + savedOrder.getOrderNumber() + " placed successfully. Total: ₹" + (int)finalAmount,
                "ORDER", "/customer/orders");

        sseService.publishEvent("ORDER",
                "🟢 Order #" + savedOrder.getOrderNumber() + " placed by " + user.getUsername() + " (₹" + (int)finalAmount + ")",
                savedOrder.getId().toString(),
                "/admin/orders");

        if (savedOrder.getRiskLevel() == RiskLevel.HIGH || savedOrder.getRiskLevel() == RiskLevel.CRITICAL) {
            sseService.publishEvent("RISK",
                    "⚠️ High Risk Order Detected: #" + savedOrder.getOrderNumber() + " (Risk Score: " + savedOrder.getRiskScore() + "/100)",
                    savedOrder.getId().toString(),
                    "/orders/risk");
        }

        auditService.logAction(user.getUsername(), "ORDER_CHECKOUT", "Order", savedOrder.getId().toString(), null, savedOrder.getOrderNumber(), "Order placed successfully");

        return mapToOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String actor) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus prevStatus = order.getOrderStatus();
        OrderStatus newStatus = request.getNewStatus();

        if (prevStatus == newStatus) {
            return mapToOrderResponse(order);
        }

        order.setOrderStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        }

        Order savedOrder = orderRepository.save(order);

        // Save Status History
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .changedBy(actor)
                .reason(request.getReason())
                .notes(request.getNotes())
                .build();
        statusHistoryRepository.save(history);

        // Notify customer
        notificationService.sendNotification(order.getUser(), "Order Update",
                "Your Order #" + order.getOrderNumber() + " is now " + newStatus.name().replace("_", " "),
                "ORDER", "/customer/orders");

        sseService.publishEvent("ORDER",
                "Order #" + order.getOrderNumber() + " status changed: " + prevStatus + " -> " + newStatus,
                order.getId().toString(),
                "/admin/orders");

        auditService.logAction(actor, "ORDER_STATUS_UPDATE", "Order", order.getId().toString(), prevStatus.name(), newStatus.name(), request.getReason());

        return mapToOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse reviewOrderRisk(Long orderId, RiskReviewRequest request, String actor) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setIsRiskReviewed(true);
        order.setReviewedBy(actor);
        order.setReviewedAt(LocalDateTime.now());
        order.setRiskActionNotes(request.getNotes());

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            order.setOrderStatus(OrderStatus.CANCELLED);
            // Restore inventory
            for (OrderItem item : order.getItems()) {
                inventoryService.recordStockChange(
                        item.getProduct(), item.getVariant(), item.getQuantity(),
                        InventoryTransactionReason.CANCELLATION, "Restored stock due to Risk Rejection for Order #" + order.getOrderNumber(), actor);
            }
        }

        Order savedOrder = orderRepository.save(order);

        auditService.logAction(actor, "RISK_REVIEW_" + request.getAction().toUpperCase(), "Order", order.getId().toString(),
                "Risk Score: " + order.getRiskScore(), request.getAction(), request.getNotes());

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToOrderResponse);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null ?
                order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProduct().getId())
                                .productName(item.getProductName())
                                .sku(item.getSku())
                                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>();

        List<OrderStatusHistoryResponse> historyResponses = statusHistoryRepository.findByOrderIdOrderByTimestampAsc(order.getId()).stream()
                .map(h -> OrderStatusHistoryResponse.builder()
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .changedBy(h.getChangedBy())
                        .reason(h.getReason())
                        .notes(h.getNotes())
                        .timestamp(h.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        List<String> riskReasons = new ArrayList<>();
        if (order.getRiskReasonsJson() != null) {
            try {
                riskReasons = objectMapper.readValue(order.getRiskReasonsJson(), List.class);
            } catch (Exception e) {
                riskReasons.add("Failed payment attempts / High order value");
            }
        }

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .phone(order.getPhone())
                .shippingAddress(order.getShippingAddress())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .shippingFee(order.getShippingFee())
                .taxAmount(order.getTaxAmount())
                .finalAmount(order.getFinalAmount())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .orderStatus(order.getOrderStatus())
                .riskScore(order.getRiskScore())
                .riskLevel(order.getRiskLevel())
                .riskReasons(riskReasons)
                .isRiskReviewed(order.getIsRiskReviewed())
                .reviewedBy(order.getReviewedBy())
                .reviewedAt(order.getReviewedAt())
                .riskActionNotes(order.getRiskActionNotes())
                .estimatedProfit(order.getEstimatedProfit())
                .profitMarginPercentage(order.getProfitMarginPercentage())
                .createdAt(order.getCreatedAt())
                .statusHistory(historyResponses)
                .build();
    }
}
