package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.User;
import com.traffic.traffic_violation_api.entity.Vehicle;
import com.traffic.traffic_violation_api.entity.Violation;
import com.traffic.traffic_violation_api.repository.UserRepository;
import com.traffic.traffic_violation_api.repository.VehicleRepository;
import com.traffic.traffic_violation_api.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ViolationService {

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // SAVE
    public Violation saveViolation(Violation violation) {
        return violationRepository.save(violation);
    }

    // GET ALL
    public List<Violation> getAllViolations() {
        return violationRepository.findAll();
    }

    // GET BY VEHICLE NUMBER
    public List<Violation> getViolationsByVehicleNumber(String vehicleNumber) {
        return violationRepository.findByVehicleNumber(vehicleNumber.toUpperCase());
    }

    // TOTAL FINE BY VEHICLE NUMBER
    public Double getTotalFineByVehicleNumber(String vehicleNumber) {
        return violationRepository.findByVehicleNumber(vehicleNumber.toUpperCase())
                .stream()
                .filter(v -> v.getFineAmount() != null)
                .mapToDouble(Violation::getFineAmount)
                .sum();
    }

    public List<Violation> getViolationsByUserId(Long userId) {
        List<String> vehicleNumbers = vehicleRepository.findByUserId(userId).stream()
                .map(Vehicle::getVehicleNumber)
                .filter(Objects::nonNull)
                .map(v -> v.trim().toUpperCase())
                .filter(v -> !v.isBlank())
                .toList();

        if (vehicleNumbers.isEmpty()) {
            return List.of();
        }

        return violationRepository.findByVehicleNumberIn(vehicleNumbers);
    }

    public Double getTotalFineByUser(Long userId) {
        return getViolationsByUserId(userId).stream()
                .filter(v -> v.getFineAmount() != null)
                .mapToDouble(Violation::getFineAmount)
                .sum();
    }

    // FILTER BY STATUS
    public List<Violation> getViolationsByStatus(String status) {
        return violationRepository.findByStatus(status);
    }

    public List<Violation> getViolationsByReporterId(Long reporterId) {
        return violationRepository.findByReporterId(reporterId);
    }

    public List<Violation> getViolationsByReporterEmail(String reporterEmail) {
        if (reporterEmail == null || reporterEmail.isBlank()) {
            return List.of();
        }

        String normalizedEmail = reporterEmail.trim().toLowerCase();
        Map<Long, Violation> byId = new LinkedHashMap<>();

        for (Violation violation : violationRepository.findByReporterEmailIgnoreCase(normalizedEmail)) {
            byId.put(violation.getId(), violation);
        }

        User reporter = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (reporter != null) {
            for (Violation violation : violationRepository.findByReporterId(reporter.getId())) {
                byId.put(violation.getId(), violation);
            }
        }

        return new ArrayList<>(byId.values());
    }

    // PAGINATION + SORTING
    public Page<Violation> getViolations(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return violationRepository.findAll(PageRequest.of(page, size, sort));
    }

    // TOTAL SYSTEM FINE
    public Double getTotalSystemFine() {
        return violationRepository.findAll().stream()
                .filter(v -> v.getFineAmount() != null)
                .mapToDouble(Violation::getFineAmount)
                .sum();
    }

    // TOP VIOLATOR
    // Removed as Vehicle entity is no longer used

    // UPLOAD WITH IMAGE
    public Violation saveViolationWithImage(
            MultipartFile file,
            String violationType,
            Double fineAmount,
            String vehicleNumber,
            String location,
            Long reporterId,
            String reporterName,
            String reporterEmail
    ) throws IOException {

        String uploadDir = "uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), Paths.get(uploadDir, fileName));

        Violation violation = new Violation();
        violation.setVehicleNumber(vehicleNumber.toUpperCase().trim()); // ✅
        violation.setViolationType(violationType);
        violation.setFineAmount(fineAmount);
        violation.setStatus("PENDING");
        violation.setImageUrl("http://localhost:8080/uploads/" + fileName);
        violation.setViolationDate(LocalDateTime.now());
        violation.setLocation(location);
        violation.setReporterId(reporterId);
        violation.setReporterName(reporterName);
        violation.setReporterEmail(normalizeEmail(reporterEmail));

        return violationRepository.save(violation);
    }

    private String normalizeEmail(String email) {
        return email == null || email.isBlank() ? null : email.trim().toLowerCase();
    }

    // VEHICLE DETAIL — saari violations + total fine ek saath (modal ke liye)
    public Map<String, Object> getVehicleDetail(String vehicleNumber) {
        String plate = vehicleNumber.toUpperCase();
        List<Violation> violations = violationRepository.findByVehicleNumber(plate);

        double totalFine = violations.stream()
                .filter(v -> v.getFineAmount() != null)
                .mapToDouble(Violation::getFineAmount)
                .sum();

        Map<String, Object> result = new HashMap<>();
        result.put("vehicleNumber", plate);
        result.put("totalFine", totalFine);
        result.put("totalViolations", violations.size());
        result.put("violations", violations);
        return result;
    }

    // BULK UPDATE STATUS
    public void bulkUpdateStatus(List<Long> ids, String status) {
        List<Violation> violations = violationRepository.findAllById(ids);
        for (Violation v : violations) {
            v.setStatus(status);
        }
        violationRepository.saveAll(violations);
    }

    // ASSIGN OFFICER
    public Violation assignOfficer(Long id, String officerName) {
        Violation v = violationRepository.findById(id).orElseThrow(() -> new RuntimeException("Violation not found"));
        v.setAssignedOfficer(officerName);
        return violationRepository.save(v);
    }
}
