package com.commerce.intelligence.service;

import com.commerce.intelligence.model.AuditLog;
import com.commerce.intelligence.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void logAction(String actor, String action, String entityName, String entityId, String beforeStateJson, String afterStateJson, String reason) {
        AuditLog auditLog = AuditLog.builder()
                .actor(actor != null ? actor : "SYSTEM")
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .beforeStateJson(beforeStateJson)
                .afterStateJson(afterStateJson)
                .reason(reason)
                .build();

        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
