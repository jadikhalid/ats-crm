package com.esn.ats.api.security;

import com.esn.ats.api.security.props.EntraOAuth2RoleMappingProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Extrait des JWT Entra ID les autorités ATS ({@code ROLE_AGENT}, {@code ROLE_ADMIN}, {@code ROLE_CLIENT}).
 * Ordre : claim des rôles ({@linkplain EntraOAuth2RoleMappingProperties#getRolesClaim()}), puis {@code scp}, puis GUID de groupes.
 */
@Component
@ConditionalOnProperty(name = "app.security.auth-mode", havingValue = "oauth2-resource-server")
@RequiredArgsConstructor
public class EntraJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final EntraOAuth2RoleMappingProperties props;

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        LinkedHashSet<GrantedAuthority> out = new LinkedHashSet<>();

        mergeStringsIntoAuthorities(out, fromRolesClaim(jwt));
        mergeStringsIntoAuthorities(out, fromScopeClaim(jwt));
        mergeStringsIntoAuthorities(out, fromGroupIds(jwt));

        if (out.isEmpty() && props.getBootstrapRoles() != null && !props.getBootstrapRoles().isBlank()) {
            mergeCommaSeparated(out, props.getBootstrapRoles());
        }

        if (out.isEmpty() && props.getFallbackAuthority() != null && !props.getFallbackAuthority().isBlank()) {
            mergeCommaSeparated(out, props.getFallbackAuthority());
        }

        return new ArrayList<>(out);
    }

    private void mergeCommaSeparated(Collection<GrantedAuthority> out, String csv) {
        for (String p : csv.split("[, ;]+")) {
            String norm = EntraJwtRoleNormalizer.normalizeOrNull(p);
            if (norm != null) {
                out.add(new SimpleGrantedAuthority(norm));
            }
        }
    }

    private void mergeStringsIntoAuthorities(Collection<GrantedAuthority> out, Iterable<String> raw) {
        for (String s : raw) {
            String norm = EntraJwtRoleNormalizer.normalizeOrNull(s);
            if (norm != null) {
                out.add(new SimpleGrantedAuthority(norm));
            }
        }
    }

    private Set<String> fromRolesClaim(Jwt jwt) {
        Object raw = jwt.getClaim(props.getRolesClaim());
        LinkedHashSet<String> acc = new LinkedHashSet<>();
        if (raw instanceof Collection<?> col) {
            for (Object o : col) {
                if (o != null) {
                    acc.add(o.toString());
                }
            }
            return acc;
        }
        if (raw instanceof String s && !s.isBlank()) {
            for (String p : s.split("[, ;]+")) {
                acc.add(p.strip());
            }
        }
        return acc;
    }

    private Set<String> fromScopeClaim(Jwt jwt) {
        String scp = jwt.getClaimAsString("scp");
        if (scp == null || scp.isBlank()) {
            return Set.of();
        }
        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String chunk : scp.strip().split("\\s+")) {
            if (chunk.isBlank()) {
                continue;
            }
            Map<String, String> m = props.getScopeToAuthority();
            String mapped =
                    m.get(chunk);
            if (mapped == null) {
                mapped = m.get(chunk.toLowerCase(Locale.ROOT));
            }
            if (mapped != null && !mapped.isBlank()) {
                out.add(mapped.strip());
                continue;
            }
            out.add(chunk);
        }
        return out;
    }

    private Set<String> fromGroupIds(Jwt jwt) {
        LinkedHashSet<String> out = new LinkedHashSet<>();
        if (props.getGroupObjectIdToRole().isEmpty()) {
            return out;
        }
        var ids = jwt.getClaimAsStringList("groups");
        if (ids == null || ids.isEmpty()) {
            return out;
        }
        for (String guid : ids) {
            if (guid == null || guid.isBlank()) {
                continue;
            }
            String role = props.getGroupObjectIdToRole().get(guid.strip());
            if (role != null && !role.isBlank()) {
                out.add(role.strip());
            }
        }
        return out;
    }
}
