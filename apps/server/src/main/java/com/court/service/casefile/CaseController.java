package com.court.service.casefile;

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
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping
    public CaseDtos.CaseResponse createCase(@Valid @RequestBody CaseDtos.CreateCaseRequest request) {
        return caseService.createCase(request);
    }

    @GetMapping
    public List<CaseDtos.CaseResponse> listCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String courtCode,
            @RequestParam(required = false) String courtCodes,
            @RequestParam(required = false) String q) {
        return caseService.listCases(status, courtCode, courtCodes, q);
    }

    @GetMapping("/{caseId}")
    public CaseDtos.CaseResponse getCase(@PathVariable Long caseId) {
        return caseService.getCase(caseId);
    }
}
