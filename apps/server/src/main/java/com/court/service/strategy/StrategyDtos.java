package com.court.service.strategy;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class StrategyDtos {

    private StrategyDtos() {
    }

    public record CreateStrategyRequest(
            @NotBlank @Size(max = 128) String strategyName,
            @Size(max = 32) String caseType,
            @NotBlank @Size(max = 128) String channelSequence,
            @Max(10) int retryMaxTimes,
            boolean enabledFlag) {
    }

    public record StrategyResponse(
            Long id,
            String strategyName,
            String caseType,
            String channelSequence,
            int retryMaxTimes,
            boolean enabledFlag) {
    }
}
