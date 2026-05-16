package com.esn.ats.api.controller.agent.opportunity;

import com.esn.ats.application.opportunity.OpportunityApplicationService;
import com.esn.ats.application.opportunity.dto.OpportunityRequest;
import com.esn.ats.application.opportunity.dto.OpportunityResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/agent/opportunities")
@PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
@RequiredArgsConstructor
public class AgentOpportunityController {

    private final OpportunityApplicationService opportunityApplicationService;

    @GetMapping
    public List<OpportunityResponse> findAll() {
        return opportunityApplicationService.findAll();
    }

    @GetMapping("/{id}")
    public OpportunityResponse findById(@PathVariable Long id) {
        return opportunityApplicationService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OpportunityResponse create(@Valid @RequestBody OpportunityRequest request) {
        return opportunityApplicationService.create(request);
    }

    @PutMapping("/{id}")
    public OpportunityResponse update(@PathVariable Long id, @Valid @RequestBody OpportunityRequest request) {
        return opportunityApplicationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        opportunityApplicationService.delete(id);
    }
}
