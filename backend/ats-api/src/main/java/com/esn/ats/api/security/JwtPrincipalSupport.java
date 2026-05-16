package com.esn.ats.api.security;

import com.esn.ats.application.auth.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Locale;
import java.util.Set;

/**
 * Projection d'un JWT Entra en {@link UserResponse} exploitable par l'Angular (rôles = libellés {@code ROLE_*}).
 */
@Component
@ConditionalOnProperty(name = "app.security.auth-mode", havingValue = "oauth2-resource-server")
@RequiredArgsConstructor
public class JwtPrincipalSupport {

    private final EntraJwtGrantedAuthoritiesConverter authoritiesConverter;

    public UserResponse toUserResponse(Jwt jwt) {
        Collection<? extends GrantedAuthority> authorities = authoritiesConverter.convert(jwt);
        Set<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).collect(java.util.stream.Collectors.toSet());

        String subject = jwt.getSubject() != null ? jwt.getSubject() : "unknown";
        long syntheticId = Math.abs(subject.hashCode());

        String email = pickNonBlank(jwt.getClaimAsString("email"), jwt.getClaimAsString("preferred_username"), jwt.getClaimAsString("upn"));

        String first =
                pickNonBlank(jwt.getClaimAsString("given_name"), splitGivenName(jwt.getClaimAsString("name")));
        String last = pickNonBlank(jwt.getClaimAsString("family_name"), splitFamilyName(jwt.getClaimAsString("name")));

        if (email.isBlank()) {
            email = subject.contains("@") ? subject : subject + "@entra.subject";
        }

        return new UserResponse(syntheticId, email.strip(), first, last, roles);
    }

    private static String pickNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v.strip();
            }
        }
        return "";
    }

    private static String splitGivenName(String full) {
        if (full == null || full.isBlank()) {
            return "";
        }
        String[] p = full.strip().split("\\s+", 2);
        return p.length > 0 ? p[0] : "";
    }

    private static String splitFamilyName(String full) {
        if (full == null || full.isBlank()) {
            return "";
        }
        String[] p = full.strip().split("\\s+", 2);
        return p.length > 1 ? p[1].strip().toUpperCase(Locale.FRANCE) : "";
    }
}
