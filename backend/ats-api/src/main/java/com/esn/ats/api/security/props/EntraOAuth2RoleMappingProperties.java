package com.esn.ats.api.security.props;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

/**
 * YAML {@code app.security.entra.*} pour mapper les JWT Entra ID vers nos {@code ROLE_*}.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.security.entra")
public class EntraOAuth2RoleMappingProperties {

    /**
     * Claim contenant une liste ou une chaîne de rôles (souvent {@code roles}).
     */
    private String rolesClaim = "roles";

    /**
     * Valeurs {@code scp} (access token Microsoft) nommées → autorités ATS ({@code ROLE_AGENT}, …).
     */
    private Map<String, String> scopeToAuthority = new HashMap<>();

    /**
     * Object ID de groupe Entra (claim {@code groups}) → {@code ROLE_*} ATS.
     */
    private Map<String, String> groupObjectIdToRole = new HashMap<>();

    /** Autorité unique si aucun rôle résolu ({@code ROLE_CLIENT} conseillé en phase POC). */
    private String fallbackAuthority = "";

    /**
     * Liste séparée par virgule (prioritaire sur {@link #fallbackAuthority}) si aucun rôle après parsing.
     */
    private String bootstrapRoles = "";
}
