package com.esn.ats.domain.user.model;

import java.util.Set;

public record User(
        Long id,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        Set<RoleType> roles
) {
}
