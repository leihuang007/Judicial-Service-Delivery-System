package com.court.service.task;

import java.time.OffsetDateTime;

public final class TaskLifecycleDtos {

    private TaskLifecycleDtos() {
    }

    public record EventResponse(
            Long id,
            Long taskId,
            String eventType,
            String fromStatus,
            String toStatus,
            String eventNote,
            String actor,
            OffsetDateTime createdAt) {
    }
}
