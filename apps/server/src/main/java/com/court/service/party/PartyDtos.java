package com.court.service.party;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public final class PartyDtos {

    private PartyDtos() {
    }

    public record CreatePartyRequest(
            @NotNull Long caseId,
            @NotBlank @Size(max = 128) String partyName,
            @NotBlank @Size(max = 32) String partyType,
            @NotBlank @Size(max = 32) String legalRole) {
    }

    public record PartyResponse(
            Long id,
            Long caseId,
            String partyName,
            String partyType,
            String legalRole,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }

    public record CreateContactRequest(
            @NotNull Long partyId,
            @NotBlank @Size(max = 16) String contactType,
            @NotBlank @Size(max = 256) String contactValue,
            boolean isPrimary) {
    }

    public record ContactResponse(
            Long id,
            Long partyId,
            String contactType,
            String contactValue,
            boolean isPrimary,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
