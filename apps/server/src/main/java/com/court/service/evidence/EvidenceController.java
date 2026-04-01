package com.court.service.evidence;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping
    public EvidenceDtos.EvidenceResponse create(@Valid @RequestBody EvidenceDtos.CreateEvidenceRequest request) {
        return evidenceService.create(request);
    }

    @GetMapping
    public List<EvidenceDtos.EvidenceResponse> listByTask(@RequestParam Long taskId) {
        return evidenceService.listByTask(taskId);
    }
}
