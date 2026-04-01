package com.court.service.evidence;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface EvidenceRecordRepository extends JpaRepository<EvidenceRecord, Long> {

    List<EvidenceRecord> findByTask_IdOrderByCreatedAtDesc(Long taskId);
}
