package com.court.service.orchestration;

import java.time.OffsetDateTime;

public final class OrchestrationDtos {

    private OrchestrationDtos() {
    }

    public record AlertResponse(Long taskId, String taskNo, String status, OffsetDateTime legalDeadlineAt, long hoursRemaining) {
    }

    public record EvaluateResponse(Long taskId, String taskStatus, String note) {
    }

    public record ExceptionTicketResponse(Long id, Long taskId, String level, String code, String status, String note, OffsetDateTime updatedAt) {
    }

    public record DeliveryReportResponse(Long id, Long taskId, String reportNo, String hashSha256, OffsetDateTime generatedAt) {
    }

    public record ArchiveResponse(Long id, Long taskId, String archiveSystem, String archiveNo, String archiveStatus, OffsetDateTime createdAt) {
    }
}
