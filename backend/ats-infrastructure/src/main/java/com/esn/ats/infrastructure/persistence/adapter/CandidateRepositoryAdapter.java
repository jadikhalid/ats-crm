package com.esn.ats.infrastructure.persistence.adapter;

import com.esn.ats.domain.candidate.model.Candidate;
import com.esn.ats.domain.candidate.port.CandidateRepository;
import com.esn.ats.infrastructure.persistence.entity.CandidateEntity;
import com.esn.ats.infrastructure.persistence.repository.CandidateJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CandidateRepositoryAdapter implements CandidateRepository {

    private final CandidateJpaRepository candidateJpaRepository;

    @Override
    public List<Candidate> findAll() {
        return candidateJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Candidate> findById(Long id) {
        return candidateJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Candidate save(Candidate candidate) {
        CandidateEntity entity = candidate.id() != null
                ? candidateJpaRepository.findById(candidate.id()).orElse(new CandidateEntity())
                : new CandidateEntity();
        mapToEntity(candidate, entity);
        return toDomain(candidateJpaRepository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        candidateJpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return candidateJpaRepository.existsById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return candidateJpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByEmailAndIdNot(String email, Long id) {
        return candidateJpaRepository.existsByEmailAndIdNot(email, id);
    }

    private void mapToEntity(Candidate candidate, CandidateEntity entity) {
        entity.setFirstName(candidate.firstName());
        entity.setLastName(candidate.lastName());
        entity.setEmail(candidate.email());
        entity.setPhone(candidate.phone());
        entity.setCvPath(candidate.cvPath());
        entity.setCvContent(candidate.cvContent());
        entity.setProfileSummary(candidate.profileSummary());
        entity.setSkills(candidate.skills() != null ? List.copyOf(candidate.skills()) : List.of());
        entity.setStatus(candidate.status());
    }

    private Candidate toDomain(CandidateEntity entity) {
        return new Candidate(
                entity.getId(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getCvPath(),
                entity.getCvContent(),
                entity.getProfileSummary(),
                entity.getSkills() != null ? List.copyOf(entity.getSkills()) : List.of(),
                entity.getStatus());
    }
}
