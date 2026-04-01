package com.court.service.task;

import com.court.service.casefile.CaseInfo;
import com.court.service.casefile.CaseInfoRepository;
import com.court.service.common.NotFoundException;
import com.court.service.common.AuditService;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private static final String INITIAL_STATUS = "PENDING";

    private final ServiceTaskRepository serviceTaskRepository;
    private final CaseInfoRepository caseInfoRepository;
    private final AuditService auditService;
    private final Random random = new Random();

    public TaskService(
            ServiceTaskRepository serviceTaskRepository,
            CaseInfoRepository caseInfoRepository,
            AuditService auditService) {
        this.serviceTaskRepository = serviceTaskRepository;
        this.caseInfoRepository = caseInfoRepository;
        this.auditService = auditService;
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
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskDtos.TaskResponse> listTasks(String status) {
        List<ServiceTask> tasks = status == null || status.isBlank()
                ? serviceTaskRepository.findAll()
                : serviceTaskRepository.findByCurrentStatus(status);

        return tasks.stream().map(this::toResponse).toList();
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
