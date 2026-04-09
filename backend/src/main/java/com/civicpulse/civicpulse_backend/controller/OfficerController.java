package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.service.OfficerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officer")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Grievance>> assigned(Authentication auth) {
        return ResponseEntity.ok(
            officerService.getAssigned(auth.getName()));
    }

    @PutMapping("/grievance/{id}/resolve")
    public ResponseEntity<Grievance> resolve(
            @PathVariable Long id,
            Authentication auth,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(officerService.resolve(id, auth.getName(), body));
    }
}