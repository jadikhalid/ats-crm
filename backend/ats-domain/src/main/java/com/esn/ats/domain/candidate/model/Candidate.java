package com.esn.ats.domain.candidate.model;

import java.util.List;

public record Candidate(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String cvPath,
        String cvContent,
        String profileSummary,
        List<String> skills,
        CandidateStatus status
) {
}
