package com.court.service.common;

import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final ServiceAuditLogRepository serviceAuditLogRepository;

    public AuditService(ServiceAuditLogRepository serviceAuditLogRepository) {
        this.serviceAuditLogRepository = serviceAuditLogRepository;
    }

    @Transactional
    public void logCreate(String actor, String resourceType, Object resourceId) {
        ServiceAuditLog log = new ServiceAuditLog();
        log.setActionType("CREATE");
        log.setActor(actor);
        log.setResourceType(resourceType);
        log.setResourceId(String.valueOf(resourceId));
        log.setActionTime(OffsetDateTime.now());
        serviceAuditLogRepository.save(log);
    }
}
