package com.commerce.intelligence.controller;

import com.commerce.intelligence.model.AuditLog;
import com.commerce.intelligence.model.Notification;
import com.commerce.intelligence.service.ActivityFeedSseService;
import com.commerce.intelligence.service.AuditService;
import com.commerce.intelligence.service.NotificationService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/events", "/api/notifications", "/api/activity-feed"})
@RequiredArgsConstructor
@Tag(name = "Real-Time Operations & Notifications", description = "Server-Sent Events (SSE) live feed, in-app notifications, and audit logging")
public class ActivityFeedController {

    private final ActivityFeedSseService sseService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @GetMapping(value = {"/activity-stream", "/stream"}, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Real-Time SSE Activity Stream", description = "Subscribes to live operational events (orders placed, inventory changes, risk triggers, returns)")
    public SseEmitter streamActivity() {
        return sseService.subscribe();
    }

    @GetMapping({"/notifications", "/my"})
    @Operation(summary = "Get User Notifications", description = "Retrieves in-app notifications for the authenticated user")
    public ResponseEntity<List<Notification>> getNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping({"/notifications/unread-count", "/unread-count"})
    @Operation(summary = "Unread Notifications Count", description = "Returns count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    @PutMapping({"/notifications/{id}/read", "/{id}/read"})
    @Operation(summary = "Mark Notification as Read", description = "Marks a specific notification as read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/audit-logs", "/audit"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "System Audit Logs (Admin)", description = "Retrieves recent traceable audit logs of administrative and system decisions")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getRecentAuditLogs());
    }
}
