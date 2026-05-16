package com.esn.ats.application.opportunity.dto;

import com.esn.ats.domain.opportunity.model.OpportunityStatus;

import java.math.BigDecimal;

public record OpportunityResponse(
        Long id,
        String title,
        String description,
        String profileSought,
        OpportunityStatus status,
        BigDecimal budget,
        Long clientId,
        String clientCompanyName
) {
}
