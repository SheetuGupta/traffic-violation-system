package com.traffic.traffic_violation_api.repository;

import com.traffic.traffic_violation_api.entity.Violation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViolationRepository  extends JpaRepository<Violation,Long> {
    List<Violation> findByVehicleId(Long vehicleId);

    List<Violation> findByStatus(String status);
    Page<Violation> findByStatus(String status, Pageable pageable);
}


