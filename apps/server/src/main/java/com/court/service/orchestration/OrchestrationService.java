package com.court.service.orchestration;

import com.court.service.channel.ServiceAttemptRepository;
import com.court.service.common.AuditService;
import com.court.service.common.NotFoundException;
import com.court.service.task.ServiceTask;
import com.court.service.task.ServiceTaskRepository;
import com.court.service.task.TaskLifecycleEventService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrchestrationService {

    private final ServiceTaskRepository serviceTaskRepository;
    private final ServiceAttemptRepository serviceAttemptRepository;
    private final ExceptionTicketRepository exceptionTicketRepository;
    private final DeliveryReportRepository deliveryReportRepository;
    private final ArchiveBindingRepository archiveBindingRepository;
    private final AuditService auditService;
    private final TaskLifecycleEventService taskLifecycleEventService;

    public OrchestrationService(
            ServiceTaskRepository serviceTaskRepository,
            ServiceAttemptRepository serviceAttemptRepository,
            ExceptionTicketRepository exceptionTicketRepository,
            DeliveryReportRepository deliveryReportRepository,
            ArchiveBindingRepository archiveBindingRepository,
            AuditService auditService,
            TaskLifecycleEventService taskLifecycleEventService) {
        this.serviceTaskRepository = serviceTaskRepository;
        this.serviceAttemptRepository = serviceAttemptRepository;
        this.exceptionTicketRepository = exceptionTicketRepository;
        this.deliveryReportRepository = deliveryReportRepository;
        this.archiveBindingRepository = archiveBindingRepository;
        this.auditService = auditService;
        this.taskLifecycleEventService = taskLifecycleEventService;
    }

    @Transactional(readOnly = true)
    public List<OrchestrationDtos.AlertResponse> deadlineAlerts(long hours) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime deadline = now.plusHours(hours);
        return serviceTaskRepository.findByLegalDeadlineAtBetweenAndCurrentStatusNot(now, deadline, "EFFECTIVE").stream()
                .map(task -> new OrchestrationDtos.AlertResponse(
                        task.getId(),
                        task.getTaskNo(),
                        task.getCurrentStatus(),
                        task.getLegalDeadlineAt(),
                        Duration.between(now, task.getLegalDeadlineAt()).toHours()))
                .toList();
    }

    @Transactional
    public OrchestrationDtos.EvaluateResponse evaluateTask(Long taskId) {
        ServiceTask task = serviceTaskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        boolean delivered = serviceAttemptRepository.findByTask_IdOrderByAttemptNoDesc(taskId)
                .stream()
                .anyMatch(a -> "SIGNED".equalsIgnoreCase(a.getReceiptStatus()) || "DELIVERED".equalsIgnoreCase(a.getReceiptStatus()));

        OffsetDateTime now = OffsetDateTime.now();
        String note;
        if (delivered) {
            applyStatusTransition(task, "EFFECTIVE", "Task marked EFFECTIVE based on delivery receipts.");
            note = "Task marked EFFECTIVE based on delivery receipts.";
        } else if (task.getLegalDeadlineAt().isBefore(now)) {
            applyStatusTransition(task, "FAILED_NEED_REMEDY", "Task overdue without valid receipt.");
            note = "Task overdue without valid receipt. Exception ticket created.";
            createException(task, "HIGH", "DEADLINE_OVERDUE", note);
        } else {
            applyStatusTransition(task, "IN_PROGRESS", "Task still within deadline and awaiting valid receipt.");
            note = "Task still within deadline and awaiting valid receipt.";
        }

        auditService.logCreate("system", "TASK_EVALUATION", task.getId());
        taskLifecycleEventService.recordEvent(
                task,
                "TASK_EVALUATED",
                task.getCurrentStatus(),
                task.getCurrentStatus(),
                note,
                "system");
        return new OrchestrationDtos.EvaluateResponse(task.getId(), task.getCurrentStatus(), note);
    }

    @Transactional(readOnly = true)
    public List<OrchestrationDtos.ExceptionTicketResponse> openExceptions() {
        return exceptionTicketRepository.findByStatusOrderByUpdatedAtDesc("OPEN").stream()
                .map(this::toTicketResponse)
                .toList();
    }

    @Transactional
    public OrchestrationDtos.DeliveryReportResponse generateReport(Long taskId) {
        ServiceTask task = serviceTaskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        return deliveryReportRepository.findByTask_Id(taskId)
                .map(this::toReportResponse)
                .orElseGet(() -> {
                    DeliveryReport report = new DeliveryReport();
                    String content = "Delivery report for task " + task.getTaskNo() + " generated at " + OffsetDateTime.now();
                    report.setTask(task);
                    report.setReportNo("RPT-" + UUID.randomUUID().toString().substring(0, 12));
                    report.setReportContent(content);
                    report.setHashSha256(sha256(content));
                    report.setGeneratedAt(OffsetDateTime.now());
                    DeliveryReport saved = deliveryReportRepository.save(report);
                    auditService.logCreate("system", "DELIVERY_REPORT", saved.getId());
                        taskLifecycleEventService.recordEvent(
                            task,
                            "TASK_REPORT_GENERATED",
                            task.getCurrentStatus(),
                            task.getCurrentStatus(),
                            "Delivery report generated: " + saved.getReportNo(),
                            "system");
                    return toReportResponse(saved);
                });
    }

    @Transactional
    public OrchestrationDtos.ArchiveResponse archiveTask(Long taskId) {
        ServiceTask task = serviceTaskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        deliveryReportRepository.findByTask_Id(taskId)
            .orElseThrow(() -> new IllegalStateException("Cannot archive task before report is generated: " + taskId));

        ArchiveBinding binding = new ArchiveBinding();
        binding.setTask(task);
        binding.setArchiveSystem("e-dossier");
        binding.setArchiveNo("ARC-" + UUID.randomUUID().toString().substring(0, 10));
        binding.setArchiveStatus("SUCCESS");
        binding.setCreatedAt(OffsetDateTime.now());
        ArchiveBinding saved = archiveBindingRepository.save(binding);
        auditService.logCreate("system", "ARCHIVE_BINDING", saved.getId());

        applyStatusTransition(task, "ARCHIVED", "Task archived to " + saved.getArchiveSystem() + ".");

        return new OrchestrationDtos.ArchiveResponse(
                saved.getId(),
                task.getId(),
                saved.getArchiveSystem(),
                saved.getArchiveNo(),
                saved.getArchiveStatus(),
                saved.getCreatedAt());
    }

    private void createException(ServiceTask task, String level, String code, String note) {
        ExceptionTicket ticket = new ExceptionTicket();
        ticket.setTask(task);
        ticket.setLevel(level);
        ticket.setCode(code);
        ticket.setStatus("OPEN");
        ticket.setNote(note);
        ticket.setCreatedAt(OffsetDateTime.now());
        ticket.setUpdatedAt(OffsetDateTime.now());
        exceptionTicketRepository.save(ticket);
        taskLifecycleEventService.recordEvent(
                task,
                "TASK_EXCEPTION_OPENED",
                task.getCurrentStatus(),
                task.getCurrentStatus(),
                code + ": " + note,
                "system");
    }

    private void applyStatusTransition(ServiceTask task, String targetStatus, String note) {
        String currentStatus = task.getCurrentStatus();
        if (currentStatus.equals(targetStatus)) {
            return;
        }

        if ("ARCHIVED".equals(currentStatus) && !"ARCHIVED".equals(targetStatus)) {
            throw new IllegalStateException("Archived task cannot transition to another status: " + task.getId());
        }

        task.setCurrentStatus(targetStatus);
        task.setUpdatedAt(OffsetDateTime.now());
        serviceTaskRepository.save(task);
        taskLifecycleEventService.recordEvent(
                task,
                "TASK_STATUS_CHANGED",
                currentStatus,
                targetStatus,
                note,
                "system");
    }

    private OrchestrationDtos.ExceptionTicketResponse toTicketResponse(ExceptionTicket t) {
        return new OrchestrationDtos.ExceptionTicketResponse(
                t.getId(),
                t.getTask().getId(),
                t.getLevel(),
                t.getCode(),
                t.getStatus(),
                t.getNote(),
                t.getUpdatedAt());
    }

    private OrchestrationDtos.DeliveryReportResponse toReportResponse(DeliveryReport r) {
        return new OrchestrationDtos.DeliveryReportResponse(
                r.getId(),
                r.getTask().getId(),
                r.getReportNo(),
                r.getHashSha256(),
                r.getGeneratedAt());
    }

    private String sha256(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(content.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not supported", e);
        }
    }
}
