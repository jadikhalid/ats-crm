package com.esn.ats.domain.client.model;

public record Client(
        Long id,
        String companyName,
        String primaryContact,
        String email,
        String phone,
        String industry
) {
}
