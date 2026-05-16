package com.esn.ats.application.auth.dto;

import java.util.Set;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        Set<String> roles
) {
}
