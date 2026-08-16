package com.commerce.intelligence.service;

import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.Order;
import com.commerce.intelligence.model.Payment;
import com.commerce.intelligence.model.enums.PaymentMethod;
import com.commerce.intelligence.model.enums.PaymentStatus;
import com.commerce.intelligence.repository.OrderRepository;
import com.commerce.intelligence.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final AuditService auditService;
    private final ActivityFeedSseService sseService;

    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
    }

    @Transactional
    public Payment createPaymentRecord(Order order, PaymentMethod method) {
        Payment payment = Payment.builder()
                .order(order)
                .paymentTransactionId("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .amount(order.getFinalAmount())
                .status(method == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.SUCCESS)
                .paymentMethod(method)
                .providerReference(method == PaymentMethod.ONLINE_CARD ? "MOCK-" + UUID.randomUUID().toString().substring(0, 12) : null)
                .build();
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment confirmPayment(Long orderId, String actor) {
        Payment payment = getPaymentByOrderId(orderId);
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment already completed");
        }
        payment.setStatus(PaymentStatus.SUCCESS);
        Payment saved = paymentRepository.save(payment);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        orderRepository.save(order);

        sseService.publishEvent("PAYMENT", "Payment confirmed for Order #" + order.getOrderNumber(),
                order.getId().toString(), "/orders/manage");
        auditService.logAction(actor, "PAYMENT_CONFIRMED", "Payment", saved.getId().toString(), null, null, null);
        return saved;
    }

    @Transactional
    public Payment processRefund(Long orderId, String actor, String reason) {
        Payment payment = getPaymentByOrderId(orderId);
        payment.setStatus(PaymentStatus.REFUNDED);
        Payment saved = paymentRepository.save(payment);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        orderRepository.save(order);

        auditService.logAction(actor, "PAYMENT_REFUNDED", "Payment", saved.getId().toString(), null, null, reason);
        return saved;
    }
}
