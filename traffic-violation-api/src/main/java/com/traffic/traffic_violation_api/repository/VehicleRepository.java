package com.traffic.traffic_violation_api.repository;

import com.traffic.traffic_violation_api.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle,Long> {
    List<Vehicle> findByUserId(Long userId);
}
