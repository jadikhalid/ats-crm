package com.esn.ats.domain.candidate.port;

import com.esn.ats.domain.candidate.model.Candidate;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository {

    List<Candidate> findAll();

    Optional<Candidate> findById(Long id);

    Candidate save(Candidate candidate);

    void deleteById(Long id);

    boolean existsById(Long id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}
