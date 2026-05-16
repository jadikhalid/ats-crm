package com.esn.ats.api.controller.agent.matching;

import com.esn.ats.application.matching.MatchingApplicationService;
import com.esn.ats.domain.ai.dto.MatchingResultDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/agent/matching")
@PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
@RequiredArgsConstructor
public class AgentMatchingController {

    private final MatchingApplicationService matchingApplicationService;

    /**
     * Calcule score 0–100 et explication IA entre un candidat et une opportunité.
     */
    @PostMapping
    public MatchingResultDto match(@Valid @RequestBody MatchingScoreRequest request) {
        return matchingApplicationService.scoreCandidateAgainstOpportunity(
                request.candidateId(),
                request.opportunityId());
    }

    public record MatchingScoreRequest(
            @NotNull Long candidateId,
            @NotNull Long opportunityId
    ) {
    }
}
