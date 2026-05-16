package com.esn.ats.application.opportunity;

import com.esn.ats.application.opportunity.dto.OpportunityRequest;
import com.esn.ats.application.opportunity.dto.OpportunityResponse;
import com.esn.ats.common.exception.ResourceNotFoundException;
import com.esn.ats.domain.client.model.Client;
import com.esn.ats.domain.client.port.ClientRepository;
import com.esn.ats.domain.opportunity.model.Opportunity;
import com.esn.ats.domain.opportunity.port.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OpportunityApplicationService {

    private final OpportunityRepository opportunityRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public List<OpportunityResponse> findAll() {
        return opportunityRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OpportunityResponse findById(Long id) {
        return opportunityRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunité introuvable : " + id));
    }

    @Transactional
    public OpportunityResponse create(OpportunityRequest request) {
        ensureClientExists(request.clientId());
        Opportunity opportunity = new Opportunity(
                null,
                request.title(),
                request.description(),
                request.profileSought(),
                request.status(),
                request.budget(),
                request.clientId()
        );
        return toResponse(opportunityRepository.save(opportunity));
    }

    @Transactional
    public OpportunityResponse update(Long id, OpportunityRequest request) {
        if (!opportunityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Opportunité introuvable : " + id);
        }
        ensureClientExists(request.clientId());
        Opportunity updated = new Opportunity(
                id,
                request.title(),
                request.description(),
                request.profileSought(),
                request.status(),
                request.budget(),
                request.clientId()
        );
        return toResponse(opportunityRepository.save(updated));
    }

    @Transactional
    public void delete(Long id) {
        if (!opportunityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Opportunité introuvable : " + id);
        }
        opportunityRepository.deleteById(id);
    }

    private void ensureClientExists(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new IllegalArgumentException("Client introuvable : " + clientId);
        }
    }

    private OpportunityResponse toResponse(Opportunity opportunity) {
        String companyName = clientRepository.findById(opportunity.clientId())
                .map(Client::companyName)
                .orElse(null);
        return new OpportunityResponse(
                opportunity.id(),
                opportunity.title(),
                opportunity.description(),
                opportunity.profileSought(),
                opportunity.status(),
                opportunity.budget(),
                opportunity.clientId(),
                companyName
        );
    }
}
