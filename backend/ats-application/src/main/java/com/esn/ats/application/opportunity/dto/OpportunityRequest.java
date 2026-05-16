package com.esn.ats.application.opportunity.dto;

import com.esn.ats.domain.opportunity.model.OpportunityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OpportunityRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String profileSought,
        @NotNull OpportunityStatus status,
        BigDecimal budget,
        @NotNull Long clientId
) {
}
