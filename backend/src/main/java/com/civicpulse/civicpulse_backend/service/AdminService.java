package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
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
                .orElseThrow(() -> new RuntimeException("Not found"));
        g.setAssignedOfficerId(
            Long.valueOf(body.get("officerId").toString()));
        g.setPriority(
            Integer.valueOf(body.get("priority").toString()));
        g.setStatus(GrievanceStatus.IN_PROGRESS);

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