package com.court.service.casefile;

import com.court.service.common.NotFoundException;
import com.court.service.common.AuditService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseService {

    private final CaseInfoRepository caseInfoRepository;
    private final AuditService auditService;

    public CaseService(CaseInfoRepository caseInfoRepository, AuditService auditService) {
        this.caseInfoRepository = caseInfoRepository;
        this.auditService = auditService;
    }

    @Transactional
    public CaseDtos.CaseResponse createCase(CaseDtos.CreateCaseRequest request) {
        caseInfoRepository.findByCaseNo(request.caseNo())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Case number already exists: " + request.caseNo());
                });

        OffsetDateTime now = OffsetDateTime.now();
        CaseInfo caseInfo = new CaseInfo();
        caseInfo.setCaseNo(request.caseNo());
        caseInfo.setCaseType(request.caseType());
        caseInfo.setCourtCode(request.courtCode());
        caseInfo.setTribunalCode(request.tribunalCode());
        caseInfo.setCaseStatus(request.caseStatus());
        caseInfo.setAcceptedAt(request.acceptedAt());
        caseInfo.setCreatedAt(now);
        caseInfo.setUpdatedAt(now);

        CaseInfo saved = caseInfoRepository.save(caseInfo);
        auditService.logCreate("system", "CASE", saved.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CaseDtos.CaseResponse> listCases() {
        return caseInfoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CaseDtos.CaseResponse getCase(Long caseId) {
        CaseInfo caseInfo = caseInfoRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Case not found: " + caseId));
        return toResponse(caseInfo);
    }

    private CaseDtos.CaseResponse toResponse(CaseInfo caseInfo) {
        return new CaseDtos.CaseResponse(
                caseInfo.getId(),
                caseInfo.getCaseNo(),
                caseInfo.getCaseType(),
                caseInfo.getCourtCode(),
                caseInfo.getTribunalCode(),
                caseInfo.getCaseStatus(),
                caseInfo.getAcceptedAt(),
                caseInfo.getCreatedAt(),
                caseInfo.getUpdatedAt());
    }
}
