package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.ReturnDTOs.*;
import com.commerce.intelligence.service.ReturnService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
@Tag(name = "Returns & Refunds", description = "Return request lifecycle and refund processing")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping("/request")
    @Operation(summary = "Submit Return Request", description = "Creates a return request for a delivered order")
    public ResponseEntity<ReturnResponse> createReturnRequest(@Valid @RequestBody CreateReturnRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(returnService.createReturnRequest(userId, request));
    }

    @GetMapping("/my-returns")
    @Operation(summary = "Get Customer Returns", description = "Lists all return requests submitted by the logged-in customer")
    public ResponseEntity<List<ReturnResponse>> getMyReturns() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(returnService.getCustomerReturnRequests(userId));
    }

    @GetMapping({"/all", "/manage"})
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "Get All Return Requests (Admin / Order Manager)", description = "Lists all return requests across customers")
    public ResponseEntity<List<ReturnResponse>> getAllReturns() {
        return ResponseEntity.ok(returnService.getAllReturnRequests());
    }

    @PutMapping({"/{id}/decision", "/manage/{id}/decision"})
    @PreAuthorize("hasAnyRole('ADMIN', 'ORDER_MANAGER')")
    @Operation(summary = "Process Return Decision", description = "Approves, rejects, or refunds a return request with notes")
    public ResponseEntity<ReturnResponse> processReturnDecision(
            @PathVariable Long id,
            @Valid @RequestBody ReturnDecisionRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(returnService.processReturnDecision(id, request, actor));
    }
}
