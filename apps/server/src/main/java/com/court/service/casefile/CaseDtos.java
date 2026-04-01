package com.court.service.casefile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public final class CaseDtos {

    private CaseDtos() {
    }

    public record CreateCaseRequest(
            @NotBlank @Size(max = 64) String caseNo,
            @NotBlank @Size(max = 32) String caseType,
            @NotBlank @Size(max = 32) String courtCode,
            @NotBlank @Size(max = 32) String tribunalCode,
            @NotBlank @Size(max = 32) String caseStatus,
            OffsetDateTime acceptedAt) {
    }

    public record CaseResponse(
            Long id,
            String caseNo,
            String caseType,
            String courtCode,
            String tribunalCode,
            String caseStatus,
            OffsetDateTime acceptedAt,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
