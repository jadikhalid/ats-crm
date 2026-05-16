package com.esn.ats.api.controller.agent;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/agent")
@PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
public class AgentController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("scope", "agent", "message", "Espace commercial / RH");
    }
}
