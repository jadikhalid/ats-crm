package com.esn.ats.domain.user.port;

import com.esn.ats.domain.user.model.User;

import java.util.Optional;

public interface UserRepository {

    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id);
}
