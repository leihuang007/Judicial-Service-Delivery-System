package com.court.service.task;

import com.court.service.common.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskLifecycleEventService {

    private final TaskLifecycleEventRepository taskLifecycleEventRepository;
    private final ServiceTaskRepository serviceTaskRepository;

    public TaskLifecycleEventService(
            TaskLifecycleEventRepository taskLifecycleEventRepository,
            ServiceTaskRepository serviceTaskRepository) {
        this.taskLifecycleEventRepository = taskLifecycleEventRepository;
        this.serviceTaskRepository = serviceTaskRepository;
    }

    @Transactional
    public void recordEvent(
            ServiceTask task,
            String eventType,
            String fromStatus,
            String toStatus,
            String eventNote,
            String actor) {
        TaskLifecycleEvent event = new TaskLifecycleEvent();
        event.setTask(task);
        event.setEventType(eventType);
        event.setFromStatus(fromStatus);
        event.setToStatus(toStatus);
        event.setEventNote(eventNote);
        event.setActor(actor);
        event.setCreatedAt(OffsetDateTime.now());
        taskLifecycleEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<TaskLifecycleDtos.EventResponse> listTaskEvents(Long taskId) {
        if (!serviceTaskRepository.existsById(taskId)) {
            throw new NotFoundException("Task not found: " + taskId);
        }

        return taskLifecycleEventRepository.findByTask_IdOrderByCreatedAtDescIdDesc(taskId).stream()
                .map(e -> new TaskLifecycleDtos.EventResponse(
                        e.getId(),
                        e.getTask().getId(),
                        e.getEventType(),
                        e.getFromStatus(),
                        e.getToStatus(),
                        e.getEventNote(),
                        e.getActor(),
                        e.getCreatedAt()))
                .toList();
    }
}
