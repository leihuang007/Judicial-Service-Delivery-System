package com.court.service.api;

import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @GetMapping("/healthz")
    public Map<String, Object> healthz() {
        return Map.of(
                "status", "UP",
                "service", "judicial-service-server",
                "time", OffsetDateTime.now().toString());
    }
}
