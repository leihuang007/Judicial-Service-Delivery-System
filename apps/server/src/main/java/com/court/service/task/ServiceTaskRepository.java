package com.court.service.task;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceTaskRepository extends JpaRepository<ServiceTask, Long> {

    Optional<ServiceTask> findByTaskNo(String taskNo);

    List<ServiceTask> findByCurrentStatus(String currentStatus);

    List<ServiceTask> findByLegalDeadlineAtBetweenAndCurrentStatusNot(
            OffsetDateTime start,
            OffsetDateTime end,
            String status);
}
