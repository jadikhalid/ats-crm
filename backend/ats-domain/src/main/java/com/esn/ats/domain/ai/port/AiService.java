package com.esn.ats.domain.ai.port;

import com.esn.ats.domain.ai.dto.CandidateProfileDto;
import com.esn.ats.domain.ai.dto.MatchingResultDto;
import com.esn.ats.domain.candidate.model.Candidate;
import com.esn.ats.domain.opportunity.model.Opportunity;

public interface AiService {

    CandidateProfileDto parseCv(String cvText);

    MatchingResultDto scoreCandidateAgainstOpportunity(Candidate candidate, Opportunity opportunity);
}
