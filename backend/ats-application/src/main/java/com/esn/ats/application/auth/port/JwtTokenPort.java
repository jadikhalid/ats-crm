package com.esn.ats.application.auth.port;

import com.esn.ats.domain.user.model.User;

public interface JwtTokenPort {

    String generateToken(User user);

    long getExpirationSeconds();

    boolean validateToken(String token);

    Long extractUserId(String token);
}
