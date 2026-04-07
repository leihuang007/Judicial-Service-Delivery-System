package com.court.service.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskLifecycleEventRepository extends JpaRepository<TaskLifecycleEvent, Long> {

    List<TaskLifecycleEvent> findByTask_IdOrderByCreatedAtDescIdDesc(Long taskId);
}
