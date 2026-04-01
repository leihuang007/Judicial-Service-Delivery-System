package com.court.service.channel;

import com.court.service.task.ServiceTask;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface ChannelProviderRepository extends JpaRepository<ChannelProvider, Long> {

    Optional<ChannelProvider> findFirstByChannelTypeAndEnabledFlagIsTrueOrderByIdAsc(String channelType);
}
