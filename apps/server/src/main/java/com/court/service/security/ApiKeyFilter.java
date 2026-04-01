package com.court.service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    private final SecurityProperties securityProperties;

    public ApiKeyFilter(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String configuredApiKey = securityProperties.apiKey();
        String path = request.getRequestURI();

        if (!StringUtils.hasText(configuredApiKey)
                || path.startsWith("/api/system/healthz")
                || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String incoming = request.getHeader("X-API-Key");
        if (!configuredApiKey.equals(incoming)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid API key\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
