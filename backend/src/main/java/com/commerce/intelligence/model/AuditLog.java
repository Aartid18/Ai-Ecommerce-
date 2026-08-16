package com.commerce.intelligence.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_actor", columnList = "actor"),
    @Index(name = "idx_audit_entity", columnList = "entityName, entityId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String actor;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityName;

    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String beforeStateJson;

    @Column(columnDefinition = "TEXT")
    private String afterStateJson;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
