package com.court.service.channel;

import com.court.service.task.ServiceTask;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceAttemptRepository extends JpaRepository<ServiceAttempt, Long> {

    List<ServiceAttempt> findByTask_IdOrderByAttemptNoDesc(Long taskId);

    int countByTask(ServiceTask task);
}
