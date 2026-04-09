package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;
    private final DepartmentRepository deptRepo;

    public AdminService(GrievanceRepository grievanceRepo,
                        UserRepository userRepo,
                        DepartmentRepository deptRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
        this.deptRepo = deptRepo;
    }

    public Grievance assignOfficer(Long grievanceId,
                                    Map<String, Object> body) {
        Grievance g = grievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grievance not found"));

        if (!body.containsKey("officerId")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "officerId is required");
        }

        Long officerId = Long.valueOf(body.get("officerId").toString());
        User officer = userRepo.findById(officerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Officer not found"));
        if (officer.getRole() != Role.OFFICER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user is not an officer");
        }

        g.setAssignedOfficerId(officerId);
        g.setPriority(Integer.valueOf(body.getOrDefault("priority", 1).toString()));
        g.setStatus(GrievanceStatus.IN_PROGRESS);

        if (body.containsKey("departmentId")) {
            Long departmentId = Long.valueOf(body.get("departmentId").toString());
            boolean departmentExists = deptRepo.existsById(departmentId);
            if (!departmentExists) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid departmentId");
            }
            g.setDepartmentId(departmentId);
        }

        // SLA deadline — default 3 days, or from body
        int days = body.containsKey("deadlineDays")
            ? Integer.valueOf(body.get("deadlineDays").toString())
            : 3;
        g.setDeadline(LocalDateTime.now().plusDays(days));

        return grievanceRepo.save(g);
    }

    public List<User> getAllOfficers() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.OFFICER)
                .toList();
    }

    public List<Department> getAllDepartments() {
        return deptRepo.findAll();
    }
}