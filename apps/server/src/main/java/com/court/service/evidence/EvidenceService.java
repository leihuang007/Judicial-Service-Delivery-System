package com.court.service.evidence;

import com.court.service.channel.ServiceAttempt;
import com.court.service.channel.ServiceAttemptRepository;
import com.court.service.common.AuditService;
import com.court.service.common.NotFoundException;
import com.court.service.task.ServiceTask;
import com.court.service.task.ServiceTaskRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvidenceService {

    private final EvidenceRecordRepository evidenceRecordRepository;
    private final ServiceTaskRepository serviceTaskRepository;
    private final ServiceAttemptRepository serviceAttemptRepository;
    private final AuditService auditService;

    public EvidenceService(
            EvidenceRecordRepository evidenceRecordRepository,
            ServiceTaskRepository serviceTaskRepository,
            ServiceAttemptRepository serviceAttemptRepository,
            AuditService auditService) {
        this.evidenceRecordRepository = evidenceRecordRepository;
        this.serviceTaskRepository = serviceTaskRepository;
        this.serviceAttemptRepository = serviceAttemptRepository;
        this.auditService = auditService;
    }

    @Transactional
    public EvidenceDtos.EvidenceResponse create(EvidenceDtos.CreateEvidenceRequest request) {
        ServiceTask task = serviceTaskRepository.findById(request.taskId())
                .orElseThrow(() -> new NotFoundException("Task not found: " + request.taskId()));

        ServiceAttempt attempt = null;
        if (request.attemptId() != null) {
            attempt = serviceAttemptRepository.findById(request.attemptId())
                    .orElseThrow(() -> new NotFoundException("Attempt not found: " + request.attemptId()));
        }

        EvidenceRecord record = new EvidenceRecord();
        record.setTask(task);
        record.setAttempt(attempt);
        record.setEvidenceType(request.evidenceType());
        record.setContent(request.content());
        record.setHashSha256(sha256(request.content()));
        record.setCreatedAt(OffsetDateTime.now());

        EvidenceRecord saved = evidenceRecordRepository.save(record);
        auditService.logCreate("system", "EVIDENCE", saved.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EvidenceDtos.EvidenceResponse> listByTask(Long taskId) {
        return evidenceRecordRepository.findByTask_IdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String sha256(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not supported", e);
        }
    }

    private EvidenceDtos.EvidenceResponse toResponse(EvidenceRecord record) {
        return new EvidenceDtos.EvidenceResponse(
                record.getId(),
                record.getTask().getId(),
                record.getAttempt() == null ? null : record.getAttempt().getId(),
                record.getEvidenceType(),
                record.getContent(),
                record.getHashSha256(),
                record.getCreatedAt());
    }
}
