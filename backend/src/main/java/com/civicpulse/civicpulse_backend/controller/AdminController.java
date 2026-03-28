package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/grievance/{id}/assign")
    public ResponseEntity<Grievance> assign(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(adminService.assignOfficer(id, body));
    }

    @GetMapping("/officers")
    public ResponseEntity<List<User>> officers() {
        return ResponseEntity.ok(adminService.getAllOfficers());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> departments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }
}