package com.court.service.orchestration;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orchestration")
public class OrchestrationController {

    private final OrchestrationService orchestrationService;

    public OrchestrationController(OrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @GetMapping("/alerts")
    public List<OrchestrationDtos.AlertResponse> alerts(@RequestParam(defaultValue = "24") long hours) {
        return orchestrationService.deadlineAlerts(hours);
    }

    @PostMapping("/tasks/{taskId}/evaluate")
    public OrchestrationDtos.EvaluateResponse evaluate(@PathVariable Long taskId) {
        return orchestrationService.evaluateTask(taskId);
    }

    @GetMapping("/exceptions/open")
    public List<OrchestrationDtos.ExceptionTicketResponse> openExceptions() {
        return orchestrationService.openExceptions();
    }

    @PostMapping("/tasks/{taskId}/report")
    public OrchestrationDtos.DeliveryReportResponse generateReport(@PathVariable Long taskId) {
        return orchestrationService.generateReport(taskId);
    }

    @PostMapping("/tasks/{taskId}/archive")
    public OrchestrationDtos.ArchiveResponse archive(@PathVariable Long taskId) {
        return orchestrationService.archiveTask(taskId);
    }
}
