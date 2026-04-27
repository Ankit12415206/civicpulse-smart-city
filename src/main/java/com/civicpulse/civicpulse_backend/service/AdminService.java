package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;
    private final DepartmentRepository deptRepo;
    private final EmailService emailService;

    public AdminService(GrievanceRepository grievanceRepo,
                        UserRepository userRepo,
                        DepartmentRepository deptRepo,
                        EmailService emailService) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
        this.deptRepo = deptRepo;
        this.emailService = emailService;
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
        int days = body.containsKey("deadlineDays")
            ? Integer.valueOf(body.get("deadlineDays").toString()) : 3;
        g.setDeadline(LocalDateTime.now().plusDays(days));
        Grievance saved = grievanceRepo.save(g);

        // Notify officer about new assignment
        userRepo.findById(Long.valueOf(body.get("officerId").toString())).ifPresent(officer ->
            emailService.sendAssignmentEmail(officer.getEmail(), g.getTitle())
        );
        // Notify citizen about status change to IN_PROGRESS
        userRepo.findById(g.getCitizenId()).ifPresent(citizen ->
            emailService.sendStatusUpdateEmail(citizen.getEmail(), g.getTitle(), "IN_PROGRESS")
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public List<User> getAllOfficers() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.OFFICER)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return deptRepo.findAll();
    }
}