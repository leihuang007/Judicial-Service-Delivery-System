package com.court.service.common;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final ServiceAuditLogRepository repository;

    public AuditController(ServiceAuditLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/recent")
    public List<AuditLogResponse> recent() {
        return repository.findTop200ByOrderByActionTimeDesc().stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getActionType(),
                        log.getActor(),
                        log.getResourceType(),
                        log.getResourceId(),
                        log.getActionTime()))
                .toList();
    }

    public record AuditLogResponse(
            Long id,
            String actionType,
            String actor,
            String resourceType,
            String resourceId,
            OffsetDateTime actionTime) {
    }
}
