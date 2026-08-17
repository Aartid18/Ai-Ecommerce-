package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.OrderDTOs.*;
import com.commerce.intelligence.service.OrderService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders & Risk Management", description = "Order checkout, status progression, and risk review engine")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Place Order / Checkout", description = "Converts shopping cart items to a confirmed order, evaluates risk score, updates inventory, and records COGS/profit")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest checkoutRequest) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.createOrderFromCart(userId, checkoutRequest));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Customer Orders", description = "Retrieves orders placed by the currently logged-in customer")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(orderService.getCustomerOrders(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Order Details", description = "Retrieves single order with complete tracking timeline and risk audit info")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/manage")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "All Orders List", description = "List of all orders for operations management")
    public ResponseEntity<List<OrderResponse>> getAllOrdersList() {
        return ResponseEntity.ok(orderService.getAllOrdersList());
    }

    @GetMapping("/manage/high-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "High Risk Orders Queue", description = "List of orders flagged by the fraud risk engine requiring manual review")
    public ResponseEntity<List<OrderResponse>> getHighRiskOrders() {
        return ResponseEntity.ok(orderService.getHighRiskOrders());
    }

    @GetMapping("/manage/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "All Orders Paginated (Admin / Order Manager)", description = "Paginated list of all orders across the platform with risk indicators")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        return ResponseEntity.ok(orderService.getAllOrders(PageRequest.of(page, size, Sort.by(direction, sortField))));
    }

    @PutMapping("/manage/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "Update Order Status", description = "Transitions order status (CONFIRMED, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED) with history audit")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request, actor));
    }

    @PutMapping("/manage/{id}/risk-review")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "Review High-Risk Order", description = "Executes manual risk decision (APPROVE, REJECT, REQUEST_VERIFICATION) with audit log trace")
    public ResponseEntity<OrderResponse> reviewOrderRisk(
            @PathVariable Long id,
            @Valid @RequestBody RiskReviewRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(orderService.reviewOrderRisk(id, request, actor));
    }
}
