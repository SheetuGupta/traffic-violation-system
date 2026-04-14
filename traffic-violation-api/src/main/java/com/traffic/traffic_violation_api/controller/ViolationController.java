package com.traffic.traffic_violation_api.controller;

import com.traffic.traffic_violation_api.entity.Violation;
import com.traffic.traffic_violation_api.service.ViolationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/violations")
public class ViolationController {
    @Autowired
    private ViolationService violationService;

    @PostMapping
    public Violation createViolation(@RequestBody Violation violation){
        return violationService.saveViolation(violation);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<Violation> getViolationsByVehicle(@PathVariable Long vehicleId){
        return violationService.getViolationsByVehicleId(vehicleId);
    }

    @GetMapping("/vehicle/{vehicleId}/total-fine")
    public Double getTotalFine(@PathVariable Long vehicleId){
        return violationService.getTotalFineByVehicle(vehicleId);
    }
}
