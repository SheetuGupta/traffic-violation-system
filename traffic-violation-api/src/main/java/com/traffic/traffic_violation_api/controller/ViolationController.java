package com.traffic.traffic_violation_api.controller;

import com.traffic.traffic_violation_api.entity.Violation;
import com.traffic.traffic_violation_api.service.ViolationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/violations")
public class ViolationController {

    @Autowired
    private ViolationService violationService;

    // CREATE
    @PostMapping
    public Violation createViolation(@RequestBody Violation violation){
        return violationService.saveViolation(violation);
    }

    // GET BY VEHICLE
    @GetMapping("/vehicle/{vehicleId}")
    public List<Violation> getViolationsByVehicle(@PathVariable Long vehicleId){
        return violationService.getViolationsByVehicleId(vehicleId);
    }

    // TOTAL FINE BY VEHICLE
    @GetMapping("/vehicle/{vehicleId}/total-fine")
    public Map<String, Double> getTotalFine(@PathVariable Long vehicleId){

        Double total = violationService.getTotalFineByVehicle(vehicleId);

        Map<String, Double> response = new HashMap<>();
        response.put("totalFine", total);

        return response;
    }

    // GET BY USER
    @GetMapping("/user/{userId}")
    public List<Violation> getViolationsByUser(@PathVariable Long userId){
        return violationService.getViolationsByUserId(userId);
    }

    // TOTAL FINE BY USER
    @GetMapping("/user/{userId}/total-fine")
    public Map<String, Double> getTotalFineByUser(@PathVariable Long userId){

        Double total = violationService.getTotalFineByUser(userId);

        Map<String, Double> response = new HashMap<>();
        response.put("totalFine", total);

        return response;
    }

    // FILTER BY STATUS
    @GetMapping("/status/{status}")
    public List<Violation> getByStatus(@PathVariable String status) {
        return violationService.getViolationsByStatus(status.toUpperCase());
    }

    // PAGINATION + SORTING
    @GetMapping("/paginated")
    public Page<Violation> getPaginated(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam String sortBy,
            @RequestParam String direction) {

        return violationService.getViolations(page, size, sortBy, direction);
    }

    // TOTAL SYSTEM FINE
    @GetMapping("/total-fine")
    public Map<String, Double> getTotalSystemFine() {

        Double total = violationService.getTotalSystemFine();

        Map<String, Double> response = new HashMap<>();
        response.put("totalFine", total);

        return response;
    }

    // TOP VIOLATOR
    @GetMapping("/top-violator")
    public Map<String, Long> getTopViolator() {

        Long userId = violationService.getTopViolator();

        Map<String, Long> response = new HashMap<>();
        response.put("topViolatorUserId", userId);

        return response;
    }
}