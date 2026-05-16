package com.esn.ats.api.controller.auth;

import com.esn.ats.api.security.JwtPrincipalSupport;
import com.esn.ats.application.auth.AuthApplicationService;
import com.esn.ats.application.auth.dto.UserResponse;
import com.esn.ats.common.exception.UnauthorizedException;
import com.esn.ats.infrastructure.security.DomainUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthApplicationService authApplicationService;
    private final ObjectProvider<JwtPrincipalSupport> jwtPrincipalSupport;

    /**
     * Profil utilisateur résolu soit depuis les comptes internes JWT dev, soit depuis un JWT Entra OIDC.
     */
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Authentification requise pour /v1/auth/me.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof DomainUserDetails userDetails) {
            return authApplicationService.getCurrentUser(userDetails.getId());
        }

        if (principal instanceof Jwt jwt) {
            JwtPrincipalSupport support = jwtPrincipalSupport.getIfAvailable();
            if (support == null) {
                throw new UnauthorizedException(
                        "Le mode OAuth2 pour Entra ID n'est pas configuré côté API (JwtPrincipalSupport manquant).");
            }
            return support.toUserResponse(jwt);
        }

        throw new UnauthorizedException("Jeton d'authentification non supporté.");
    }
}
