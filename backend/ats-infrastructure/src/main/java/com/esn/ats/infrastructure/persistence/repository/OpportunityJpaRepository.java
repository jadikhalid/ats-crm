package com.esn.ats.infrastructure.persistence.repository;

import com.esn.ats.infrastructure.persistence.entity.OpportunityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpportunityJpaRepository extends JpaRepository<OpportunityEntity, Long> {
}
