package com.esn.ats.api.controller.auth;

import com.esn.ats.application.auth.AuthApplicationService;
import com.esn.ats.application.auth.dto.LoginRequest;
import com.esn.ats.application.auth.dto.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentification par mot de passe (comptes locaux Flyway). Désactivée en OAuth2 Resource Server (Entra ID).
 */
@RestController
@RequestMapping("/v1/auth")
@ConditionalOnProperty(name = "app.security.auth-mode", havingValue = "jwt-local", matchIfMissing = true)
@RequiredArgsConstructor
public class LocalDevLoginController {

    private final AuthApplicationService authApplicationService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authApplicationService.login(request);
    }
}
