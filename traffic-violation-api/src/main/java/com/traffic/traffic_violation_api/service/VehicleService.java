package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.Vehicle;
import com.traffic.traffic_violation_api.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {
    @Autowired
    private VehicleRepository vehicleRepositoy;
    public Vehicle saveVehicle(Vehicle vehicle){
        return vehicleRepositoy.save(vehicle);
    }

    public List<Vehicle> getVehiclesByUserId(Long userId){
        return vehicleRepositoy.findByUserId(userId);
    }
}
