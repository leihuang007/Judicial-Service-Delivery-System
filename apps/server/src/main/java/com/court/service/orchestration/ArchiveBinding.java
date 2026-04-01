package com.court.service.orchestration;

import com.court.service.task.ServiceTask;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "archive_binding")
public class ArchiveBinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private ServiceTask task;

    @Column(name = "archive_system", nullable = false, length = 32)
    private String archiveSystem;

    @Column(name = "archive_no", nullable = false, length = 128)
    private String archiveNo;

    @Column(name = "archive_status", nullable = false, length = 16)
    private String archiveStatus;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Long getId() { return id; }
    public ServiceTask getTask() { return task; }
    public void setTask(ServiceTask task) { this.task = task; }
    public String getArchiveSystem() { return archiveSystem; }
    public void setArchiveSystem(String archiveSystem) { this.archiveSystem = archiveSystem; }
    public String getArchiveNo() { return archiveNo; }
    public void setArchiveNo(String archiveNo) { this.archiveNo = archiveNo; }
    public String getArchiveStatus() { return archiveStatus; }
    public void setArchiveStatus(String archiveStatus) { this.archiveStatus = archiveStatus; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
