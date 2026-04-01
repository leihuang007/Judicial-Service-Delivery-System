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

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskDtos.TaskResponse createTask(@Valid @RequestBody TaskDtos.CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @GetMapping
    public List<TaskDtos.TaskResponse> listTasks(@RequestParam(required = false) String status) {
        return taskService.listTasks(status);
    }

    @GetMapping("/{taskId}")
    public TaskDtos.TaskResponse getTask(@PathVariable Long taskId) {
        return taskService.getTask(taskId);
    }
}
