package com.traffic.traffic_violation_api.repository;

import com.traffic.traffic_violation_api.entity.Violation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViolationRepository extends JpaRepository<Violation, Long> {

    List<Violation> findByVehicleNumber(String vehicleNumber); // ✅ plate se search
    List<Violation> findByVehicleNumberIn(List<String> vehicleNumbers);
    List<Violation> findByStatus(String status);
    List<Violation> findByReporterId(Long reporterId);
    List<Violation> findByReporterEmailIgnoreCase(String reporterEmail);
    Page<Violation> findByStatus(String status, Pageable pageable);
    // findByVehicleId ❌ HATA DIYA
}
