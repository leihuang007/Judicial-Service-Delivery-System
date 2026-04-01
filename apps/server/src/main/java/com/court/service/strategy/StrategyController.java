package com.court.service.strategy;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/strategies")
public class StrategyController {

    private final StrategyService strategyService;

    public StrategyController(StrategyService strategyService) {
        this.strategyService = strategyService;
    }

    @PostMapping
    public StrategyDtos.StrategyResponse create(@Valid @RequestBody StrategyDtos.CreateStrategyRequest request) {
        return strategyService.create(request);
    }

    @GetMapping
    public List<StrategyDtos.StrategyResponse> list() {
        return strategyService.list();
    }

    @GetMapping("/{id}")
    public StrategyDtos.StrategyResponse get(@PathVariable Long id) {
        return strategyService.get(id);
    }
}
