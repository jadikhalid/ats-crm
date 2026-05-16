package com.esn.ats.application.candidate.dto;

import com.esn.ats.domain.candidate.model.CandidateStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CandidateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        String phone,
        String cvPath,
        List<String> skills,
        @NotNull CandidateStatus status
) {
}
