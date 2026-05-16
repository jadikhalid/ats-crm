package com.esn.ats.application.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank String companyName,
        @NotBlank String primaryContact,
        @NotBlank @Email String email,
        String phone,
        String industry
) {
}
