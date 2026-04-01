package com.court.service.strategy;

import com.court.service.common.AuditService;
import com.court.service.common.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StrategyService {

    private final StrategyRepository strategyRepository;
    private final AuditService auditService;

    public StrategyService(StrategyRepository strategyRepository, AuditService auditService) {
        this.strategyRepository = strategyRepository;
        this.auditService = auditService;
    }

    @Transactional
    public StrategyDtos.StrategyResponse create(StrategyDtos.CreateStrategyRequest request) {
        ServiceStrategy strategy = new ServiceStrategy();
        strategy.setStrategyName(request.strategyName());
        strategy.setCaseType(request.caseType());
        strategy.setChannelSequence(request.channelSequence());
        strategy.setRetryMaxTimes(request.retryMaxTimes());
        strategy.setEnabledFlag(request.enabledFlag());
        strategy.setCreatedAt(OffsetDateTime.now());
        strategy.setUpdatedAt(OffsetDateTime.now());
        ServiceStrategy saved = strategyRepository.save(strategy);
        auditService.logCreate("system", "SERVICE_STRATEGY", saved.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StrategyDtos.StrategyResponse> list() {
        return strategyRepository.findByEnabledFlagIsTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public StrategyDtos.StrategyResponse get(Long id) {
        ServiceStrategy strategy = strategyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Strategy not found: " + id));
        return toResponse(strategy);
    }

    private StrategyDtos.StrategyResponse toResponse(ServiceStrategy s) {
        return new StrategyDtos.StrategyResponse(
                s.getId(),
                s.getStrategyName(),
                s.getCaseType(),
                s.getChannelSequence(),
                s.getRetryMaxTimes(),
                s.isEnabledFlag());
    }
}
