package com.esn.ats.infrastructure.persistence.adapter;

import com.esn.ats.domain.opportunity.model.Opportunity;
import com.esn.ats.domain.opportunity.port.OpportunityRepository;
import com.esn.ats.infrastructure.persistence.entity.ClientEntity;
import com.esn.ats.infrastructure.persistence.entity.OpportunityEntity;
import com.esn.ats.infrastructure.persistence.repository.ClientJpaRepository;
import com.esn.ats.infrastructure.persistence.repository.OpportunityJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OpportunityRepositoryAdapter implements OpportunityRepository {

    private final OpportunityJpaRepository opportunityJpaRepository;
    private final ClientJpaRepository clientJpaRepository;

    @Override
    public List<Opportunity> findAll() {
        return opportunityJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Opportunity> findById(Long id) {
        return opportunityJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Opportunity save(Opportunity opportunity) {
        OpportunityEntity entity = opportunity.id() != null
                ? opportunityJpaRepository.findById(opportunity.id()).orElse(new OpportunityEntity())
                : new OpportunityEntity();
        ClientEntity client = clientJpaRepository.getReferenceById(opportunity.clientId());
        entity.setTitle(opportunity.title());
        entity.setDescription(opportunity.description());
        entity.setProfileSought(opportunity.profileSought());
        entity.setStatus(opportunity.status());
        entity.setBudget(opportunity.budget());
        entity.setClient(client);
        return toDomain(opportunityJpaRepository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        opportunityJpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return opportunityJpaRepository.existsById(id);
    }

    private Opportunity toDomain(OpportunityEntity entity) {
        return new Opportunity(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getProfileSought(),
                entity.getStatus(),
                entity.getBudget(),
                entity.getClient().getId()
        );
    }
}
