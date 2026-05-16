package com.esn.ats.application.matching;

import com.esn.ats.common.exception.ResourceNotFoundException;
import com.esn.ats.domain.ai.dto.CandidateProfileDto;
import com.esn.ats.domain.ai.dto.MatchingResultDto;
import com.esn.ats.domain.ai.port.AiService;
import com.esn.ats.domain.candidate.model.Candidate;
import com.esn.ats.domain.candidate.port.CandidateRepository;
import com.esn.ats.domain.opportunity.model.Opportunity;
import com.esn.ats.domain.opportunity.port.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MatchingApplicationService {

    private final CandidateRepository candidateRepository;
    private final OpportunityRepository opportunityRepository;
    private final AiService aiService;

    public CandidateProfileDto parseCv(String cvText) {
        if (!StringUtils.hasText(cvText)) {
            throw new IllegalArgumentException("Le texte du CV est obligatoire.");
        }
        return aiService.parseCv(cvText.trim());
    }

    @Transactional(readOnly = true)
    public MatchingResultDto scoreCandidateAgainstOpportunity(Long candidateId, Long opportunityId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable : " + candidateId));
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunité introuvable : " + opportunityId));
        return aiService.scoreCandidateAgainstOpportunity(candidate, opportunity);
    }
}
