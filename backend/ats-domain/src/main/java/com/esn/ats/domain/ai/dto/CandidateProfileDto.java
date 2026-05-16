package com.esn.ats.domain.ai.dto;

import java.util.List;

/**
 * Profil candidat extrait d'un CV (sortie IA structurée stricte).
 */
public record CandidateProfileDto(
        String firstName,
        String lastName,
        String email,
        String phone,
        List<String> skills,
        String summary
) {
    public CandidateProfileDto {
        skills = skills != null ? List.copyOf(skills) : List.of();
    }
}
