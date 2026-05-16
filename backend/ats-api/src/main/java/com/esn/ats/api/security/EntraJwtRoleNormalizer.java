package com.esn.ats.api.security;

import java.util.Locale;

final class EntraJwtRoleNormalizer {

    private EntraJwtRoleNormalizer() {}

    /** Retourne un libellé {@code ROLE_*} ATS ou {@code null} si la valeur est inconnue / ambiguë. */
    static String normalizeOrNull(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String s = raw.strip();
        if (s.regionMatches(true, 0, "ROLE_", 0, 5)) {
            return "ROLE_" + s.substring(5).strip().replace(' ', '_').toUpperCase(Locale.ROOT);
        }
        return switch (s.toUpperCase(Locale.ROOT).replace('-', '_').replace('.', '_')) {
            case "ADMIN", "ADMINISTRATOR", "ATS_ADMIN", "GLOBAL_ADMIN", "APPLICATION_ADMINISTRATOR" -> "ROLE_ADMIN";
            case "AGENT", "ATS_AGENT", "RECRUITER", "INTERNAL_AGENT" -> "ROLE_AGENT";
            case "CLIENT", "ATS_CLIENT", "EXTERNAL", "CUSTOMER" -> "ROLE_CLIENT";
            default -> inferFromSubstring(s.toUpperCase(Locale.ROOT));
        };
    }

    private static String inferFromSubstring(String upper) {
        if (upper.contains("ADMIN")) {
            return "ROLE_ADMIN";
        }
        if (upper.contains("AGENT")) {
            return "ROLE_AGENT";
        }
        if (upper.contains("CLIENT")) {
            return "ROLE_CLIENT";
        }
        return null;
    }
}
