package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GrievanceService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    public GrievanceService(GrievanceRepository grievanceRepo,
                            UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    public Grievance submitGrievance(String title,
                                      String description,
                                      String category,
                                      String location,
                                      String imageUrl,
                                      String email) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Grievance g = new Grievance();
        g.setTitle(title);
        g.setDescription(description);
        g.setCategory(category);
        g.setLocation(location);
        g.setImageUrl(imageUrl);
        g.setCitizenId(citizen.getId());
        return grievanceRepo.save(g);
    }

    public List<Grievance> getMyGrievances(String email) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Not found"));
        return grievanceRepo.findByCitizenId(citizen.getId());
    }

    public List<Grievance> getAllGrievances() {
        return grievanceRepo.findAll();
    }

    public Grievance getById(Long id) {
        return grievanceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public Grievance updateStatus(Long id,
                                   String status,
                                   String note) {
        Grievance g = getById(id);
        g.setStatus(GrievanceStatus.valueOf(status));
        if (note != null) g.setResolutionNote(note);
        if ("RESOLVED".equals(status)) {
            g.setResolvedDate(java.time.LocalDateTime.now());
        }
        return grievanceRepo.save(g);
    }
}