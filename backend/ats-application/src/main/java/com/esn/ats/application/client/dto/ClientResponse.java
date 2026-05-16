package com.esn.ats.application.client.dto;

public record ClientResponse(
        Long id,
        String companyName,
        String primaryContact,
        String email,
        String phone,
        String industry
) {
}
