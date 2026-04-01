package com.court.service.strategy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "service_strategy")
public class ServiceStrategy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "strategy_name", nullable = false, length = 128)
    private String strategyName;

    @Column(name = "case_type", length = 32)
    private String caseType;

    @Column(name = "channel_sequence", nullable = false, length = 128)
    private String channelSequence;

    @Column(name = "retry_max_times", nullable = false)
    private int retryMaxTimes;

    @Column(name = "enabled_flag", nullable = false)
    private boolean enabledFlag;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public String getStrategyName() { return strategyName; }
    public void setStrategyName(String strategyName) { this.strategyName = strategyName; }
    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }
    public String getChannelSequence() { return channelSequence; }
    public void setChannelSequence(String channelSequence) { this.channelSequence = channelSequence; }
    public int getRetryMaxTimes() { return retryMaxTimes; }
    public void setRetryMaxTimes(int retryMaxTimes) { this.retryMaxTimes = retryMaxTimes; }
    public boolean isEnabledFlag() { return enabledFlag; }
    public void setEnabledFlag(boolean enabledFlag) { this.enabledFlag = enabledFlag; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
