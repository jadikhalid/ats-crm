package com.esn.ats.application.auth;

import com.esn.ats.application.auth.dto.LoginRequest;
import com.esn.ats.application.auth.dto.LoginResponse;
import com.esn.ats.application.auth.dto.UserResponse;
import com.esn.ats.application.auth.port.JwtTokenPort;
import com.esn.ats.application.auth.port.PasswordVerifierPort;
import com.esn.ats.common.exception.UnauthorizedException;
import com.esn.ats.domain.user.model.RoleType;
import com.esn.ats.domain.user.model.User;
import com.esn.ats.domain.user.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthApplicationService {

    private final UserRepository userRepository;
    private final PasswordVerifierPort passwordVerifier;
    private final JwtTokenPort jwtTokenPort;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(User::enabled)
                .orElseThrow(() -> new UnauthorizedException("Identifiants invalides"));

        if (!passwordVerifier.matches(request.password(), user.email())) {
            throw new UnauthorizedException("Identifiants invalides");
        }

        String token = jwtTokenPort.generateToken(user);
        return new LoginResponse(
                token,
                "Bearer",
                jwtTokenPort.getExpirationSeconds(),
                toUserResponse(user)
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Utilisateur introuvable"));
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.id(),
                user.email(),
                user.firstName(),
                user.lastName(),
                user.roles().stream().map(RoleType::name).collect(Collectors.toSet())
        );
    }
}
