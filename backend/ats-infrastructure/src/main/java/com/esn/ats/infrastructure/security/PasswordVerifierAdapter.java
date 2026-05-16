package com.esn.ats.infrastructure.security;

import com.esn.ats.application.auth.port.PasswordVerifierPort;
import com.esn.ats.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PasswordVerifierAdapter implements PasswordVerifierPort {

    private final UserJpaRepository userJpaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public boolean matches(String rawPassword, String email) {
        return userJpaRepository.findByEmail(email)
                .map(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash()))
                .orElse(false);
    }
}
