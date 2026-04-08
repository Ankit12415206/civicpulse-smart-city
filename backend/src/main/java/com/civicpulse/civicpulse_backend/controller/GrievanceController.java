package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.service.GrievanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class GrievanceController {

    private static final Logger log = LoggerFactory.getLogger(GrievanceController.class);

    private final GrievanceService grievanceService;
    private final String UPLOAD_DIR = "uploads/";

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
        try { Files.createDirectories(Paths.get(UPLOAD_DIR)); }
        catch (IOException e) { log.error("Upload dir error: {}", e.getMessage()); }
    }

    @PostMapping("/citizen/grievance/submit")
    public ResponseEntity<Grievance> submit(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("location") String location,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication auth) throws IOException {
        log.info("SUBMIT called by: {}", auth.getName());
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Files.write(Paths.get(UPLOAD_DIR + filename), image.getBytes());
            imageUrl = "/uploads/" + filename;
        }
        Grievance saved = grievanceService.submitGrievance(
            title, description, category, location, imageUrl, auth.getName());
        log.info("Saved grievance id={}", saved.getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/citizen/grievance/my")
    public ResponseEntity<List<Grievance>> myGrievances(Authentication auth) {
        log.info("MY GRIEVANCES called by: {}", auth.getName());
        List<Grievance> list = grievanceService.getMyGrievances(auth.getName());
        log.info("Returning {} grievances", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/admin/grievance/all")
    public ResponseEntity<List<Grievance>> allGrievances() {
        return ResponseEntity.ok(grievanceService.getAllGrievances());
    }

    @GetMapping("/grievance/{id}")
    public ResponseEntity<Grievance> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(grievanceService.getById(id));
    }

    @PutMapping("/grievance/{id}/status")
    public ResponseEntity<Grievance> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(grievanceService.updateStatus(
            id, body.get("status"), body.get("note")));
    }
}