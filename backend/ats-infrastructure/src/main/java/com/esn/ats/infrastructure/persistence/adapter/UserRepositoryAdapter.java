package com.esn.ats.infrastructure.persistence.adapter;

import com.esn.ats.domain.user.model.RoleType;
import com.esn.ats.domain.user.model.User;
import com.esn.ats.domain.user.port.UserRepository;
import com.esn.ats.infrastructure.persistence.entity.UserEntity;
import com.esn.ats.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findWithRolesById(id).map(this::toDomain);
    }

    private User toDomain(UserEntity entity) {
        return new User(
                entity.getId(),
                entity.getEmail(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.isEnabled(),
                entity.getRoles().stream()
                        .map(role -> RoleType.fromAuthority(role.getName()))
                        .collect(Collectors.toSet())
        );
    }
}
