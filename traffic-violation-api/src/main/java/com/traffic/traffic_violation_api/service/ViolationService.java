package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.Violation;
import com.traffic.traffic_violation_api.repository.ViolationRepository;
import io.micrometer.common.KeyValues;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ViolationService {

    @Autowired
    private ViolationRepository violationRepository;

    public Violation saveViolation(Violation violation){
        return violationRepository.save(violation);
    }

    public List<Violation> getViolationsByVehicleId(Long vehicleId){
        return violationRepository.findByVehicleId(vehicleId);
    }

    public Double getTotalFineByVehicle(Long vehicleId){
        List<Violation> violations = violationRepository.findByVehicleId(vehicleId);

        return violations.stream()
                .filter(v -> v.getFineAmount() != null)
                .mapToDouble(Violation::getFineAmount)
                .sum();
    }
}
