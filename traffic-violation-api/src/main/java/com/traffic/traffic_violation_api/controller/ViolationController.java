package com.traffic.traffic_violation_api.controller;

import com.traffic.traffic_violation_api.entity.Violation;
import com.traffic.traffic_violation_api.service.ViolationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/violations")
public class ViolationController {

    @Autowired
    private ViolationService violationService;

    // CREATE
    @PostMapping
    public Violation createViolation(@RequestBody Violation violation) {
        return violationService.saveViolation(violation);
    }

    // GET ALL
    @GetMapping
    public List<Violation> getAllViolations() {
        return violationService.getAllViolations();
    }

    // GET BY VEHICLE NUMBER
    @GetMapping("/vehicle-number/{vehicleNumber}")
    public List<Violation> getByVehicleNumber(@PathVariable String vehicleNumber) {
        return violationService.getViolationsByVehicleNumber(vehicleNumber);
    }

    // TOTAL FINE BY VEHICLE NUMBER
    @GetMapping("/vehicle-number/{vehicleNumber}/total-fine")
    public Map<String, Double> getTotalFineByVehicleNumber(@PathVariable String vehicleNumber) {
        return Map.of("totalFine", violationService.getTotalFineByVehicleNumber(vehicleNumber));
    }

    // VEHICLE DETAIL — violations list + total fine (frontend modal ke liye)
    @GetMapping("/vehicle-detail/{vehicleNumber}")
    public Map<String, Object> getVehicleDetail(@PathVariable String vehicleNumber) {
        return violationService.getVehicleDetail(vehicleNumber);
    }

    // GET BY USER REGISTERED VEHICLES
    @GetMapping("/user/{userId}")
    public List<Violation> getViolationsByUser(@PathVariable Long userId) {
        return violationService.getViolationsByUserId(userId);
    }

    @GetMapping("/user/{userId}/total-fine")
    public Map<String, Double> getTotalFineByUser(@PathVariable Long userId) {
        return Map.of("totalFine", violationService.getTotalFineByUser(userId));
    }

    // FILED BY USER
    @GetMapping("/reporter/{reporterId}")
    public List<Violation> getByReporterId(@PathVariable Long reporterId) {
        return violationService.getViolationsByReporterId(reporterId);
    }

    @GetMapping("/filed-by/{reporterId}")
    public List<Violation> getFiledByReporterId(@PathVariable Long reporterId) {
        return violationService.getViolationsByReporterId(reporterId);
    }

    @GetMapping("/reporter-email/{reporterEmail}")
    public List<Violation> getByReporterEmail(@PathVariable String reporterEmail) {
        return violationService.getViolationsByReporterEmail(reporterEmail);
    }

    @GetMapping("/filed-by-email")
    public List<Violation> getFiledByReporterEmail(@RequestParam String email) {
        return violationService.getViolationsByReporterEmail(email);
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
        return Map.of("totalFine", violationService.getTotalSystemFine());
    }

    // TOP VIOLATOR
    // Removed as Vehicle entity is no longer used

    // UPLOAD WITH IMAGE
    @PostMapping("/upload")
    public Violation uploadViolation(
            @RequestParam("file") MultipartFile file,
            @RequestParam String violationType,
            @RequestParam Double fineAmount,
            @RequestParam String vehicleNumber,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false) String reporterName,
            @RequestParam(required = false) String reporterEmail
    ) throws IOException {
        return violationService.saveViolationWithImage(
                file, violationType, fineAmount, vehicleNumber, location, reporterId, reporterName, reporterEmail
        );
    }

    // BULK UPDATE
    @PutMapping("/bulk-status")
    public Map<String, String> bulkUpdateStatus(@RequestBody Map<String, Object> payload) {
        List<Integer> intIds = (List<Integer>) payload.get("ids");
        List<Long> ids = intIds.stream().map(Integer::longValue).toList();
        String status = (String) payload.get("status");
        violationService.bulkUpdateStatus(ids, status);
        return Map.of("message", "Bulk update successful");
    }

    // ASSIGN OFFICER
    @PutMapping("/{id}/assign-officer")
    public Violation assignOfficer(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return violationService.assignOfficer(id, payload.get("officerName"));
    }
}
