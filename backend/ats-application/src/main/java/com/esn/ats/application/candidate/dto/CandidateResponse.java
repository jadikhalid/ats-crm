package com.esn.ats.application.candidate.dto;

import com.esn.ats.domain.candidate.model.CandidateStatus;

import java.util.List;

public record CandidateResponse(
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
