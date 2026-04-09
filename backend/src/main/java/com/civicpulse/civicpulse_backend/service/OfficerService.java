package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@Service
public class OfficerService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    public OfficerService(GrievanceRepository grievanceRepo,
                          UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    public List<Grievance> getAssigned(String email) {
        User officer = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found"));
        return grievanceRepo.findByAssignedOfficerId(officer.getId());
    }

    public Grievance resolve(Long id, String email, Map<String, String> body) {
        User officer = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found"));

        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grievance not found"));

        if (g.getAssignedOfficerId() == null || !g.getAssignedOfficerId().equals(officer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can update only your assigned grievances");
        }

        String status = body.get("status");
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        g.setStatus(GrievanceStatus.valueOf(status));
        g.setResolutionNote(body.get("note"));
        if ("RESOLVED".equals(status)) {
            g.setResolvedDate(java.time.LocalDateTime.now());
        }
        return grievanceRepo.save(g);
    }
}