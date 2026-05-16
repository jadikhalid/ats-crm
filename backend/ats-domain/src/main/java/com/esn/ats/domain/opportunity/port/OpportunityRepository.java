package com.esn.ats.domain.opportunity.port;

import com.esn.ats.domain.opportunity.model.Opportunity;

import java.util.List;
import java.util.Optional;

public interface OpportunityRepository {

    List<Opportunity> findAll();

    Optional<Opportunity> findById(Long id);

    Opportunity save(Opportunity opportunity);

    void deleteById(Long id);

    boolean existsById(Long id);
}
