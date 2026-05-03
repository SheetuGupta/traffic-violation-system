package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.FineConfiguration;
import com.traffic.traffic_violation_api.repository.FineConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FineConfigurationService {

    @Autowired
    private FineConfigurationRepository repository;

    public List<FineConfiguration> getAll() {
        return repository.findAll();
    }

    public FineConfiguration save(FineConfiguration config) {
        Optional<FineConfiguration> existing = repository.findByViolationType(config.getViolationType());
        if (existing.isPresent()) {
            FineConfiguration current = existing.get();
            current.setAmount(config.getAmount());
            return repository.save(current);
        }
        return repository.save(config);
    }
}
