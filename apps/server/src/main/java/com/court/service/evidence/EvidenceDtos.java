package com.court.service.evidence;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public final class EvidenceDtos {

    private EvidenceDtos() {
    }

    public record CreateEvidenceRequest(
            @NotNull Long taskId,
            Long attemptId,
            @NotBlank @Size(max = 32) String evidenceType,
            @NotBlank String content) {
    }

    public record EvidenceResponse(
            Long id,
            Long taskId,
            Long attemptId,
            String evidenceType,
            String content,
            String hashSha256,
            OffsetDateTime createdAt) {
    }
}
