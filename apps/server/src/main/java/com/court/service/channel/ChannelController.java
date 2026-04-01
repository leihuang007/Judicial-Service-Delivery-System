package com.court.service.channel;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelService channelService;

    public ChannelController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @PostMapping("/dispatch")
    public ChannelDtos.AttemptResponse dispatch(@Valid @RequestBody ChannelDtos.DispatchRequest request) {
        return channelService.dispatch(request);
    }

    @GetMapping("/tasks/{taskId}/attempts")
    public List<ChannelDtos.AttemptResponse> listTaskAttempts(@PathVariable Long taskId) {
        return channelService.listTaskAttempts(taskId);
    }

    @PostMapping("/callbacks/sms")
    public ChannelDtos.AttemptResponse smsCallback(@Valid @RequestBody ChannelDtos.CallbackRequest request) {
        return channelService.callback(request, "sms");
    }

    @PostMapping("/callbacks/email")
    public ChannelDtos.AttemptResponse emailCallback(@Valid @RequestBody ChannelDtos.CallbackRequest request) {
        return channelService.callback(request, "email");
    }

    @PostMapping("/callbacks/postal")
    public ChannelDtos.AttemptResponse postalCallback(@Valid @RequestBody ChannelDtos.CallbackRequest request) {
        return channelService.callback(request, "postal");
    }

    @PostMapping("/callbacks/notary")
    public ChannelDtos.AttemptResponse notaryCallback(@Valid @RequestBody ChannelDtos.CallbackRequest request) {
        return channelService.callback(request, "notary");
    }
}
