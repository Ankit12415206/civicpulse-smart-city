package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Long>> categories() {
        return ResponseEntity.ok(analyticsService.getCategoryStats());
    }

    @GetMapping("/sla")
    public ResponseEntity<Map<String, Object>> slaReport() {
        return ResponseEntity.ok(analyticsService.getSlaReport());
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<Map<String, Object>>> monthlyReport() {
        return ResponseEntity.ok(analyticsService.getMonthlyReport());
    }
}