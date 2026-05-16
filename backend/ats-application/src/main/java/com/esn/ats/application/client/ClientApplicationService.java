package com.esn.ats.application.client;

import com.esn.ats.application.client.dto.ClientRequest;
import com.esn.ats.application.client.dto.ClientResponse;
import com.esn.ats.common.exception.ResourceNotFoundException;
import com.esn.ats.domain.client.model.Client;
import com.esn.ats.domain.client.port.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientApplicationService {

    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return clientRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(Long id) {
        return clientRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable : " + id));
    }

    @Transactional
    public ClientResponse create(ClientRequest request) {
        if (clientRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Un client avec cet email existe déjà");
        }
        Client client = new Client(
                null,
                request.companyName(),
                request.primaryContact(),
                request.email(),
                request.phone(),
                request.industry()
        );
        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(Long id, ClientRequest request) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client introuvable : " + id);
        }
        if (clientRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new IllegalArgumentException("Un client avec cet email existe déjà");
        }
        Client updated = new Client(
                id,
                request.companyName(),
                request.primaryContact(),
                request.email(),
                request.phone(),
                request.industry()
        );
        return toResponse(clientRepository.save(updated));
    }

    @Transactional
    public void delete(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client introuvable : " + id);
        }
        clientRepository.deleteById(id);
    }

    private ClientResponse toResponse(Client client) {
        return new ClientResponse(
                client.id(),
                client.companyName(),
                client.primaryContact(),
                client.email(),
                client.phone(),
                client.industry()
        );
    }
}
