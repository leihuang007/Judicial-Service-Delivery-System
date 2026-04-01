package com.court.service.task;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public final class TaskDtos {

    private TaskDtos() {
    }

    public record CreateTaskRequest(
            @NotNull Long caseId,
            @NotBlank @Size(max = 32) String docType,
            @NotBlank @Size(max = 128) String partyName,
            @NotNull @Future OffsetDateTime legalDeadlineAt) {
    }

    public record TaskResponse(
            Long id,
            String taskNo,
            Long caseId,
            String caseNo,
            String docType,
            String partyName,
            String currentStatus,
            OffsetDateTime legalDeadlineAt,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
