package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.Vehicle;
import com.traffic.traffic_violation_api.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class VehicleService {
    @Autowired
    private VehicleRepository vehicleRepository;

    public Vehicle saveVehicle(Vehicle vehicle) {
        if (vehicle.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required");
        }
        if (vehicle.getVehicleNumber() == null || vehicle.getVehicleNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle number is required");
        }
        if (vehicle.getLicenseNumber() == null || vehicle.getLicenseNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "License number is required");
        }

        vehicle.setVehicleNumber(vehicle.getVehicleNumber().trim().toUpperCase());
        vehicle.setLicenseNumber(vehicle.getLicenseNumber().trim().toUpperCase());
        if (vehicle.getVehicleType() == null || vehicle.getVehicleType().isBlank()) {
            vehicle.setVehicleType("Car");
        }

        Vehicle existing = vehicleRepository.findByVehicleNumberIgnoreCase(vehicle.getVehicleNumber());
        if (existing != null) {
            if (!Objects.equals(existing.getUserId(), vehicle.getUserId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle already registered to another user");
            }
            existing.setVehicleType(vehicle.getVehicleType());
            existing.setLicenseNumber(vehicle.getLicenseNumber());
            return vehicleRepository.save(existing);
        }

        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehiclesByUserId(Long userId) {
        return vehicleRepository.findByUserId(userId);
    }
}
