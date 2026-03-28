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

@RestController
@RequestMapping("/api")
public class GrievanceController {

    private final GrievanceService grievanceService;
    private final String UPLOAD_DIR = "uploads/";

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload dir");
        }
    }

    @PostMapping("/citizen/grievance/submit")
    public ResponseEntity<Grievance> submit(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("location") String location,
            @RequestParam(value = "image", required = false)
                MultipartFile image,
            Authentication auth) throws IOException {

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String filename = UUID.randomUUID()
                + "_" + image.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.write(path, image.getBytes());
            imageUrl = "/uploads/" + filename;
        }

        return ResponseEntity.ok(
            grievanceService.submitGrievance(
                title, description, category,
                location, imageUrl, auth.getName()
            )
        );
    }

    @GetMapping("/citizen/grievance/my")
    public ResponseEntity<List<Grievance>> myGrievances(
            Authentication auth) {
        return ResponseEntity.ok(
            grievanceService.getMyGrievances(auth.getName()));
    }

    @GetMapping("/admin/grievance/all")
    public ResponseEntity<List<Grievance>> allGrievances() {
        return ResponseEntity.ok(
            grievanceService.getAllGrievances());
    }

    @GetMapping("/grievance/{id}")
    public ResponseEntity<Grievance> getOne(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            grievanceService.getById(id));
    }

    @PutMapping("/grievance/{id}/status")
    public ResponseEntity<Grievance> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            grievanceService.updateStatus(
                id, body.get("status"), body.get("note")));
    }
}