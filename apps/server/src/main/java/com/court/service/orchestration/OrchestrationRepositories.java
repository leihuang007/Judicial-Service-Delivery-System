package com.court.service.orchestration;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface ExceptionTicketRepository extends JpaRepository<ExceptionTicket, Long> {
    List<ExceptionTicket> findByStatusOrderByUpdatedAtDesc(String status);
}

interface DeliveryReportRepository extends JpaRepository<DeliveryReport, Long> {
    Optional<DeliveryReport> findByTask_Id(Long taskId);
}

interface ArchiveBindingRepository extends JpaRepository<ArchiveBinding, Long> {
    List<ArchiveBinding> findByTask_Id(Long taskId);
}
