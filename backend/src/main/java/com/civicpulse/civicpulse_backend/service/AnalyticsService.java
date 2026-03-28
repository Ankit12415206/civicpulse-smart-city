package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.GrievanceStatus;
import com.civicpulse.civicpulse_backend.repository.GrievanceRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    private final GrievanceRepository grievanceRepo;

    public AnalyticsService(GrievanceRepository grievanceRepo) {
        this.grievanceRepo = grievanceRepo;
    }

    public Map<String, Object> getSummary() {
        Map<String, Object> result = new HashMap<>();
        result.put("total",      grievanceRepo.count());
        result.put("pending",    grievanceRepo.countByStatus(
                                     GrievanceStatus.PENDING));
        result.put("inProgress", grievanceRepo.countByStatus(
                                     GrievanceStatus.IN_PROGRESS));
        result.put("resolved",   grievanceRepo.countByStatus(
                                     GrievanceStatus.RESOLVED));
        result.put("reopened",   grievanceRepo.countByStatus(
                                     GrievanceStatus.REOPENED));
        return result;
    }

    public Map<String, Long> getCategoryStats() {
        Map<String, Long> result = new HashMap<>();
        result.put("WATER",
            (long) grievanceRepo.findByCategory("WATER").size());
        result.put("ROAD",
            (long) grievanceRepo.findByCategory("ROAD").size());
        result.put("SANITATION",
            (long) grievanceRepo.findByCategory("SANITATION").size());
        result.put("ELECTRICITY",
            (long) grievanceRepo.findByCategory("ELECTRICITY").size());
        result.put("STREET_LIGHT",
            (long) grievanceRepo.findByCategory("STREET_LIGHT").size());
        result.put("OTHER",
            (long) grievanceRepo.findByCategory("OTHER").size());
        return result;
    }
}