package com.esn.ats.domain.opportunity.model;

import java.math.BigDecimal;

public record Opportunity(
        Long id,
        String title,
        String description,
        String profileSought,
        OpportunityStatus status,
        BigDecimal budget,
        Long clientId
) {
}
