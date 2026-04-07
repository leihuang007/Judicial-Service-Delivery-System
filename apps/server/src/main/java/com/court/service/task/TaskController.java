package com.court.service.task;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskLifecycleEventService taskLifecycleEventService;

    public TaskController(TaskService taskService, TaskLifecycleEventService taskLifecycleEventService) {
        this.taskService = taskService;
        this.taskLifecycleEventService = taskLifecycleEventService;
    }

    @PostMapping
    public TaskDtos.TaskResponse createTask(@Valid @RequestBody TaskDtos.CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @GetMapping
    public List<TaskDtos.TaskResponse> listTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String courtCode,
            @RequestParam(required = false) String courtCodes,
            @RequestParam(required = false) String caseNo,
            @RequestParam(required = false) String q) {
        return taskService.listTasks(status, courtCode, courtCodes, caseNo, q);
    }

    @GetMapping("/{taskId}")
    public TaskDtos.TaskResponse getTask(@PathVariable Long taskId) {
        return taskService.getTask(taskId);
    }

    @GetMapping("/{taskId}/events")
    public List<TaskLifecycleDtos.EventResponse> listTaskEvents(@PathVariable Long taskId) {
        return taskLifecycleEventService.listTaskEvents(taskId);
    }
}
