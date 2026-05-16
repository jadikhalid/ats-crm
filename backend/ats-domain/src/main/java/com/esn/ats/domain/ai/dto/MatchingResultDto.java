package com.esn.ats.domain.ai.dto;

import java.util.List;

/**
 * Résultat de matching candidat ↔ opportunité (réponse IA structurée).
 *
 * @param score      note entière entre 0 et 100 inclusive
 * @param strengths   points forts factuels, une ligne par entrée (français)
 * @param weaknesses  lacunes ou risques ou écarts, une ligne par entrée (français)
 */
public record MatchingResultDto(
        int score,
        List<String> strengths,
        List<String> weaknesses
) {
    public MatchingResultDto {
        strengths = strengths != null ? List.copyOf(strengths) : List.of();
        weaknesses = weaknesses != null ? List.copyOf(weaknesses) : List.of();
    }
}
