package com.court.service.channel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public final class ChannelDtos {

    private ChannelDtos() {
    }

    public record DispatchRequest(
            @NotNull Long taskId,
            @NotBlank @Size(max = 16) String channelType,
            @NotBlank @Size(max = 256) String receiver,
            @NotBlank @Size(max = 2000) String content) {
    }

    public record CallbackRequest(
            @NotNull Long attemptId,
            @NotBlank @Size(max = 32) String receiptStatus,
            @Size(max = 32) String failureCode,
            @Size(max = 512) String failureMessage) {
    }

    public record AttemptResponse(
            Long id,
            Long taskId,
            int attemptNo,
            String channelType,
            String providerName,
            String sendStatus,
            String receiptStatus,
            String failureCode,
            String failureMessage,
            OffsetDateTime receiptTime,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
