package com.court.service.common;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceAuditLogRepository extends JpaRepository<ServiceAuditLog, Long> {

	List<ServiceAuditLog> findTop200ByOrderByActionTimeDesc();
}
