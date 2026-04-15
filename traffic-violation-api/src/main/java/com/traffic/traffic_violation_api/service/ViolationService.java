package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.Vehicle;
import com.traffic.traffic_violation_api.entity.Violation;
import com.traffic.traffic_violation_api.repository.VehicleRepository;
import com.traffic.traffic_violation_api.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@Service
public class ViolationService {

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Violation saveViolation(Violation violation){
        return violationRepository.save(violation);
    }

    public List<Violation> getViolationsByVehicleId(Long vehicleId){
        return violationRepository.findByVehicleId(vehicleId);
    }

    public Double getTotalFineByVehicle(Long vehicleId){
        return violationRepository.findByVehicleId(vehicleId).stream()
                .map(Violation::getFineAmount)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    public List<Violation> getViolationsByUserId(Long userId){

        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
        List<Violation> allViolations = new ArrayList<>();

        for (Vehicle v : vehicles) {
            allViolations.addAll(
                    violationRepository.findByVehicleId(v.getId())
            );
        }

        return allViolations;
    }

    public Double getTotalFineByUser(Long userId){
        return getViolationsByUserId(userId).stream()
                .map(Violation::getFineAmount)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    public List<Violation> getViolationsByStatus(String status) {
        return violationRepository.findByStatus(status);
    }

    public Page<Violation> getViolations(int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return violationRepository.findAll(pageable);
    }

    public Double getTotalSystemFine() {
        return violationRepository.findAll().stream()
                .map(Violation::getFineAmount)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    public Long getTopViolator() {

        List<Violation> violations = violationRepository.findAll();
        Map<Long, Double> userFineMap = new HashMap<>();

        for (Violation v : violations) {

            Long vehicleId = v.getVehicleId();
            Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);

            if (vehicle != null && vehicle.getUserId() != null) {

                Long userId = vehicle.getUserId();
                Double fine = v.getFineAmount() != null ? v.getFineAmount() : 0.0;

                userFineMap.put(userId,
                        userFineMap.getOrDefault(userId, 0.0) + fine);
            }
        }

        return userFineMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }
}