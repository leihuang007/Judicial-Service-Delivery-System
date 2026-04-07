package com.court.service.task;

import com.court.service.casefile.CaseInfo;
import com.court.service.casefile.CaseInfoRepository;
import com.court.service.common.NotFoundException;
import com.court.service.common.AuditService;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private static final String INITIAL_STATUS = "PENDING";

    private final ServiceTaskRepository serviceTaskRepository;
    private final CaseInfoRepository caseInfoRepository;
    private final AuditService auditService;
    private final TaskLifecycleEventService taskLifecycleEventService;
    private final Random random = new Random();

    public TaskService(
            ServiceTaskRepository serviceTaskRepository,
            CaseInfoRepository caseInfoRepository,
            AuditService auditService,
            TaskLifecycleEventService taskLifecycleEventService) {
        this.serviceTaskRepository = serviceTaskRepository;
        this.caseInfoRepository = caseInfoRepository;
        this.auditService = auditService;
        this.taskLifecycleEventService = taskLifecycleEventService;
    }

    @Transactional
    public TaskDtos.TaskResponse createTask(TaskDtos.CreateTaskRequest request) {
        CaseInfo caseInfo = caseInfoRepository.findById(request.caseId())
                .orElseThrow(() -> new NotFoundException("Case not found: " + request.caseId()));

        OffsetDateTime now = OffsetDateTime.now();

        ServiceTask task = new ServiceTask();
        task.setTaskNo(generateTaskNo(now));
        task.setCaseInfo(caseInfo);
        task.setDocType(request.docType());
        task.setPartyName(request.partyName());
        task.setCurrentStatus(INITIAL_STATUS);
        task.setLegalDeadlineAt(request.legalDeadlineAt());
        task.setCreatedAt(now);
        task.setUpdatedAt(now);

        ServiceTask saved = serviceTaskRepository.save(task);
        auditService.logCreate("system", "SERVICE_TASK", saved.getId());
        taskLifecycleEventService.recordEvent(
            saved,
            "TASK_CREATED",
            null,
            saved.getCurrentStatus(),
            "Task created by API request.",
            "system");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskDtos.TaskResponse> listTasks(String status, String courtCode, String courtCodes, String caseNo, String q) {
        String normalizedStatus = status == null ? "" : status.trim();
        String normalizedCourt = courtCode == null ? "" : courtCode.trim();
        String normalizedCaseNo = caseNo == null ? "" : caseNo.trim();
        String normalizedQuery = q == null ? "" : q.trim().toLowerCase();
        Set<String> normalizedCourts = parseCourtCodes(courtCodes);

        if (!normalizedCourt.isBlank()) {
            normalizedCourts.add(normalizedCourt.toLowerCase());
        }

        List<ServiceTask> tasks = normalizedStatus.isBlank()
                ? serviceTaskRepository.findAll()
            : serviceTaskRepository.findByCurrentStatus(normalizedStatus);

        return tasks.stream()
            .filter(t -> normalizedCourts.isEmpty() || normalizedCourts.contains(t.getCaseInfo().getCourtCode().toLowerCase()))
            .filter(t -> normalizedCaseNo.isBlank() || t.getCaseInfo().getCaseNo().equalsIgnoreCase(normalizedCaseNo))
            .filter(t -> {
                if (normalizedQuery.isBlank()) {
                return true;
                }
                String text = (
                    t.getTaskNo() + " "
                        + t.getCaseInfo().getCaseNo() + " "
                        + t.getPartyName() + " "
                        + t.getDocType() + " "
                        + t.getCaseInfo().getCourtCode())
                    .toLowerCase();
                return text.contains(normalizedQuery);
            })
            .map(this::toResponse)
            .toList();
    }

    private Set<String> parseCourtCodes(String courtCodes) {
        if (courtCodes == null || courtCodes.isBlank()) {
            return new java.util.HashSet<>();
        }
        return Arrays.stream(courtCodes.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public TaskDtos.TaskResponse getTask(Long taskId) {
        ServiceTask task = serviceTaskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
        return toResponse(task);
    }

    private String generateTaskNo(OffsetDateTime now) {
        String prefix = "SD-" + now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + "-" + (1000 + random.nextInt(9000));
    }

    private TaskDtos.TaskResponse toResponse(ServiceTask task) {
        return new TaskDtos.TaskResponse(
                task.getId(),
                task.getTaskNo(),
                task.getCaseInfo().getId(),
                task.getCaseInfo().getCaseNo(),
                task.getDocType(),
                task.getPartyName(),
                task.getCurrentStatus(),
                task.getLegalDeadlineAt(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
