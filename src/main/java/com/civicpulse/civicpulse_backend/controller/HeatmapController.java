package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.repository.GrievanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/heatmap")
public class HeatmapController {

    private final GrievanceRepository grievanceRepo;

    public HeatmapController(GrievanceRepository grievanceRepo) {
        this.grievanceRepo = grievanceRepo;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getHeatmapData() {
        List<Map<String, Object>> points = grievanceRepo.findAll().stream()
            .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
            .map(g -> {
                Map<String, Object> point = new HashMap<>();
                point.put("id", g.getId());
                point.put("title", g.getTitle());
                point.put("category", g.getCategory());
                point.put("status", g.getStatus().name());
                point.put("latitude", g.getLatitude());
                point.put("longitude", g.getLongitude());
                point.put("priority", g.getPriority());
                point.put("sentimentLabel", g.getSentimentLabel());
                return point;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(points);
    }
}
