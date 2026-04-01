package com.court.service.channel;

import com.court.service.common.AuditService;
import com.court.service.common.NotFoundException;
import com.court.service.task.ServiceTask;
import com.court.service.task.ServiceTaskRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChannelService {

    private final ServiceTaskRepository serviceTaskRepository;
    private final ChannelProviderRepository channelProviderRepository;
    private final ServiceAttemptRepository serviceAttemptRepository;
    private final AuditService auditService;

    public ChannelService(
            ServiceTaskRepository serviceTaskRepository,
            ChannelProviderRepository channelProviderRepository,
            ServiceAttemptRepository serviceAttemptRepository,
            AuditService auditService) {
        this.serviceTaskRepository = serviceTaskRepository;
        this.channelProviderRepository = channelProviderRepository;
        this.serviceAttemptRepository = serviceAttemptRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ChannelDtos.AttemptResponse dispatch(ChannelDtos.DispatchRequest request) {
        ServiceTask task = serviceTaskRepository.findById(request.taskId())
                .orElseThrow(() -> new NotFoundException("Task not found: " + request.taskId()));

        ChannelProvider provider = channelProviderRepository.findFirstByChannelTypeAndEnabledFlagIsTrueOrderByIdAsc(request.channelType())
                .orElseThrow(() -> new NotFoundException("No enabled provider for channel: " + request.channelType()));

        int attemptNo = serviceAttemptRepository.countByTask(task) + 1;
        OffsetDateTime now = OffsetDateTime.now();

        ServiceAttempt attempt = new ServiceAttempt();
        attempt.setTask(task);
        attempt.setAttemptNo(attemptNo);
        attempt.setChannelType(request.channelType());
        attempt.setProvider(provider);
        attempt.setSendStatus("SENT");
        attempt.setReceiptStatus("PENDING");
        attempt.setRequestPayload("{\"receiver\":\"" + request.receiver() + "\",\"content\":\"" + request.content().replace("\"", "'") + "\"}");
        attempt.setResponsePayload("{\"provider\":\"" + provider.getProviderName() + "\",\"accepted\":true}");
        attempt.setCreatedAt(now);
        attempt.setUpdatedAt(now);

        ServiceAttempt saved = serviceAttemptRepository.save(attempt);
        auditService.logCreate("system", "SERVICE_ATTEMPT", saved.getId());

        return toResponse(saved);
    }

    @Transactional
    public ChannelDtos.AttemptResponse callback(ChannelDtos.CallbackRequest request, String channelType) {
        ServiceAttempt attempt = serviceAttemptRepository.findById(request.attemptId())
                .orElseThrow(() -> new NotFoundException("Attempt not found: " + request.attemptId()));

        if (!attempt.getChannelType().equalsIgnoreCase(channelType)) {
            throw new IllegalArgumentException("Attempt channel mismatch. expected=" + attempt.getChannelType() + ", incoming=" + channelType);
        }

        OffsetDateTime now = OffsetDateTime.now();
        attempt.setReceiptStatus(request.receiptStatus());
        attempt.setFailureCode(request.failureCode());
        attempt.setFailureMessage(request.failureMessage());
        attempt.setReceiptTime(now);
        attempt.setUpdatedAt(now);

        if ("DELIVERED".equalsIgnoreCase(request.receiptStatus()) || "SIGNED".equalsIgnoreCase(request.receiptStatus())) {
            attempt.setSendStatus("DELIVERED");
        } else if ("FAILED".equalsIgnoreCase(request.receiptStatus()) || "RETURNED".equalsIgnoreCase(request.receiptStatus())) {
            attempt.setSendStatus("FAILED");
        }

        ServiceAttempt saved = serviceAttemptRepository.save(attempt);
        auditService.logCreate("system", "CHANNEL_CALLBACK", saved.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChannelDtos.AttemptResponse> listTaskAttempts(Long taskId) {
        return serviceAttemptRepository.findByTask_IdOrderByAttemptNoDesc(taskId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ChannelDtos.AttemptResponse toResponse(ServiceAttempt attempt) {
        return new ChannelDtos.AttemptResponse(
                attempt.getId(),
                attempt.getTask().getId(),
                attempt.getAttemptNo(),
                attempt.getChannelType(),
                attempt.getProvider() == null ? null : attempt.getProvider().getProviderName(),
                attempt.getSendStatus(),
                attempt.getReceiptStatus(),
                attempt.getFailureCode(),
                attempt.getFailureMessage(),
                attempt.getReceiptTime(),
                attempt.getCreatedAt(),
                attempt.getUpdatedAt());
    }
}
