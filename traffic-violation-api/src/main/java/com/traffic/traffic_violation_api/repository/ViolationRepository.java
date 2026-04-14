package com.traffic.traffic_violation_api.repository;

import com.traffic.traffic_violation_api.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViolationRepository  extends JpaRepository<Violation,Long> {
    List<Violation> findByVehicleId(Long vehicleId);
}


