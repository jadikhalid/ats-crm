package com.esn.ats.api.controller.client;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/client")
@PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
public class ClientController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("scope", "client", "message", "Espace client");
    }
}
