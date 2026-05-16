package com.esn.ats.infrastructure.persistence.adapter;

import com.esn.ats.domain.client.model.Client;
import com.esn.ats.domain.client.port.ClientRepository;
import com.esn.ats.infrastructure.persistence.entity.ClientEntity;
import com.esn.ats.infrastructure.persistence.repository.ClientJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ClientRepositoryAdapter implements ClientRepository {

    private final ClientJpaRepository clientJpaRepository;

    @Override
    public List<Client> findAll() {
        return clientJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Client> findById(Long id) {
        return clientJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Client save(Client client) {
        ClientEntity entity = client.id() != null
                ? clientJpaRepository.findById(client.id()).orElse(new ClientEntity())
                : new ClientEntity();
        mapToEntity(client, entity);
        return toDomain(clientJpaRepository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        clientJpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return clientJpaRepository.existsById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return clientJpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByEmailAndIdNot(String email, Long id) {
        return clientJpaRepository.existsByEmailAndIdNot(email, id);
    }

    private void mapToEntity(Client client, ClientEntity entity) {
        entity.setCompanyName(client.companyName());
        entity.setPrimaryContact(client.primaryContact());
        entity.setEmail(client.email());
        entity.setPhone(client.phone());
        entity.setIndustry(client.industry());
    }

    private Client toDomain(ClientEntity entity) {
        return new Client(
                entity.getId(),
                entity.getCompanyName(),
                entity.getPrimaryContact(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getIndustry()
        );
    }
}
