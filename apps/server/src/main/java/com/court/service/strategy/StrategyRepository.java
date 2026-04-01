package com.court.service.strategy;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface StrategyRepository extends JpaRepository<ServiceStrategy, Long> {
    List<ServiceStrategy> findByEnabledFlagIsTrue();
}
