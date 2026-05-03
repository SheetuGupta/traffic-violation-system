package com.traffic.traffic_violation_api.repository;

import com.traffic.traffic_violation_api.entity.FineConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FineConfigurationRepository extends JpaRepository<FineConfiguration, Long> {
    Optional<FineConfiguration> findByViolationType(String violationType);
}
