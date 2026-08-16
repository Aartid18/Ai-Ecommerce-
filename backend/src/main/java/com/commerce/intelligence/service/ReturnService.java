package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.ReturnDTOs.*;
import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.OrderStatus;
import com.commerce.intelligence.model.enums.ReturnStatus;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CustomerProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public ReturnResponse createReturnRequest(Long userId, CreateReturnRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to this customer");
        }

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Only delivered orders can be requested for return");
        }

        if (returnRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BadRequestException("A return request already exists for Order #" + order.getOrderNumber());
        }

        ReturnRequest returnReq = ReturnRequest.builder()
                .order(order)
                .customer(user)
                .reason(request.getReason())
                .customNotes(request.getCustomNotes())
                .evidenceUrl(request.getEvidenceUrl())
                .status(ReturnStatus.REQUESTED)
                .refundAmount(order.getFinalAmount())
                .build();

        ReturnRequest saved = returnRepository.save(returnReq);

        order.setOrderStatus(OrderStatus.RETURN_REQUESTED);
        orderRepository.save(order);

        notificationService.sendNotification(user, "Return Request Submitted",
                "Return request for Order #" + order.getOrderNumber() + " submitted. Status: Under Review",
                "RETURN", "/customer/orders");

        auditService.logAction(user.getUsername(), "RETURN_REQUESTED", "ReturnRequest", saved.getId().toString(), null, order.getOrderNumber(), "Customer submitted return request");

        return mapToResponse(saved);
    }

    @Transactional
    public ReturnResponse processReturnDecision(Long returnId, ReturnDecisionRequest request, String actor) {
        ReturnRequest returnReq = returnRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with id: " + returnId));

        returnReq.setStatus(request.getStatus());
        returnReq.setAdminDecisionNotes(request.getAdminDecisionNotes());
        returnReq.setDecidedBy(actor);
        if (request.getRefundAmount() != null) {
            returnReq.setRefundAmount(request.getRefundAmount());
        }

        ReturnRequest saved = returnRepository.save(returnReq);
        Order order = returnReq.getOrder();

        if (request.getStatus() == ReturnStatus.APPROVED || request.getStatus() == ReturnStatus.REFUNDED) {
            order.setOrderStatus(OrderStatus.RETURNED);
            order.setPaymentStatus(com.commerce.intelligence.model.enums.PaymentStatus.REFUNDED);
            orderRepository.save(order);

            // Increment customer return stats
            CustomerProfile profile = profileRepository.findByUser(order.getUser()).orElse(null);
            if (profile != null) {
                profile.setTotalReturns(profile.getTotalReturns() + 1);
                profileRepository.save(profile);
            }

            notificationService.sendNotification(order.getUser(), "Return Approved & Refunded",
                    "Return request for Order #" + order.getOrderNumber() + " approved. Refund amount: ₹" + (int)saved.getRefundAmount().doubleValue(),
                    "RETURN", "/customer/orders");
        } else if (request.getStatus() == ReturnStatus.REJECTED) {
            order.setOrderStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);

            notificationService.sendNotification(order.getUser(), "Return Request Decision",
                    "Return request for Order #" + order.getOrderNumber() + " was rejected. Reason: " + request.getAdminDecisionNotes(),
                    "RETURN", "/customer/orders");
        }

        auditService.logAction(actor, "RETURN_DECISION_" + request.getStatus(), "ReturnRequest", returnId.toString(), null, request.getStatus().name(), request.getAdminDecisionNotes());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReturnResponse> getAllReturnRequests() {
        return returnRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReturnResponse> getCustomerReturnRequests(Long customerId) {
        return returnRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ReturnResponse mapToResponse(ReturnRequest r) {
        return ReturnResponse.builder()
                .id(r.getId())
                .orderId(r.getOrder().getId())
                .orderNumber(r.getOrder().getOrderNumber())
                .customerName(r.getCustomer().getFullName() != null ? r.getCustomer().getFullName() : r.getCustomer().getUsername())
                .reason(r.getReason())
                .customNotes(r.getCustomNotes())
                .evidenceUrl(r.getEvidenceUrl())
                .status(r.getStatus())
                .adminDecisionNotes(r.getAdminDecisionNotes())
                .decidedBy(r.getDecidedBy())
                .refundAmount(r.getRefundAmount())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
