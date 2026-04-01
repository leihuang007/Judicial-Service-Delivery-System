package com.court.service.casefile;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseInfoRepository extends JpaRepository<CaseInfo, Long> {

    Optional<CaseInfo> findByCaseNo(String caseNo);
}
