package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
@Transactional
public class GrievanceService {

    private static final Logger log = LoggerFactory.getLogger(GrievanceService.class);

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    public GrievanceService(GrievanceRepository grievanceRepo,
                            UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    public Grievance submitGrievance(String title, String description,
                                      String category, String location,
                                      String imageUrl, String email) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Grievance g = new Grievance();
        g.setTitle(title);
        g.setDescription(description);
        g.setCategory(category);
        g.setLocation(location);
        g.setImageUrl(imageUrl);
        g.setCitizenId(citizen.getId());
        Grievance saved = grievanceRepo.save(g);
        grievanceRepo.flush();
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Grievance> getMyGrievances(String email) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        List<Grievance> result = grievanceRepo.findByCitizenId(citizen.getId());
        log.info("getMyGrievances for {} citizenId={} found={}", email, citizen.getId(), result.size());
        return result;
    }

    @Transactional(readOnly = true)
    public List<Grievance> getAllGrievances() {
        return grievanceRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Grievance getById(Long id) {
        return grievanceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public Grievance updateStatus(Long id, String status, String note) {
        Grievance g = getById(id);
        g.setStatus(GrievanceStatus.valueOf(status));
        if (note != null) g.setResolutionNote(note);
        if ("RESOLVED".equals(status)) {
            g.setResolvedDate(java.time.LocalDateTime.now());
        }
        return grievanceRepo.save(g);
    }
}