package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OfficerService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    public OfficerService(GrievanceRepository grievanceRepo,
                          UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<Grievance> getAssigned(String email) {
        User officer = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Not found"));
        return grievanceRepo.findByAssignedOfficerId(officer.getId());
    }

    public Grievance resolve(Long id, Map<String, String> body) {
        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        g.setStatus(GrievanceStatus.valueOf(body.get("status")));
        g.setResolutionNote(body.get("note"));
        if ("RESOLVED".equals(body.get("status"))) {
            g.setResolvedDate(java.time.LocalDateTime.now());
        }
        return grievanceRepo.save(g);
    }
}