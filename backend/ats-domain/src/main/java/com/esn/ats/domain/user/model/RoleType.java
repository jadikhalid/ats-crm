package com.esn.ats.domain.user.model;

public enum RoleType {
    ROLE_CLIENT,
    ROLE_AGENT,
    ROLE_ADMIN;

    public static RoleType fromAuthority(String authority) {
        return RoleType.valueOf(authority);
    }
}
