package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AutoAssignService {

    private static final Logger log = LoggerFactory.getLogger(AutoAssignService.class);

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;

    public AutoAssignService(GrievanceRepository grievanceRepo,
                             UserRepository userRepo,
                             EmailService emailService) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
    }

    /**
     * Runs every 30 minutes to auto-assign high-priority pending grievances
     * to the officer with the lowest workload.
     */
    @Scheduled(fixedRate = 1800000) // 30 mins
    public void autoAssignHighPriority() {
        log.info("Running auto-assignment job...");

        List<Grievance> pending = grievanceRepo.findByStatus(GrievanceStatus.PENDING);
        List<User> officers = userRepo.findByRole(Role.OFFICER);

        if (officers.isEmpty()) {
            log.info("No officers registered — skipping auto-assignment.");
            return;
        }

        for (Grievance g : pending) {
            if (g.getPriority() != null && g.getPriority() >= 3) {
                // Find the officer with the least current workload
                User bestOfficer = null;
                long minLoad = Long.MAX_VALUE;

                for (User officer : officers) {
                    long load = grievanceRepo.countByAssignedOfficerId(officer.getId());
                    if (load < minLoad) {
                        minLoad = load;
                        bestOfficer = officer;
                    }
                }

                if (bestOfficer != null) {
                    g.setAssignedOfficerId(bestOfficer.getId());
                    g.setStatus(GrievanceStatus.IN_PROGRESS);
                    g.setDeadline(LocalDateTime.now().plusDays(2)); // High priority SLA
                    grievanceRepo.save(g);

                    log.info("Auto-assigned Grievance #{} to officer {}", g.getId(), bestOfficer.getEmail());
                    emailService.sendAssignmentEmail(bestOfficer.getEmail(), g.getTitle());
                }
            }
        }
    }

    /**
     * Runs daily at midnight to auto-escalate breached SLAs.
     */
    @Scheduled(cron = "0 0 0 * * ?") // Midnight
    public void autoEscalateBreachedSla() {
        log.info("Running SLA breach auto-escalation job...");

        List<Grievance> active = grievanceRepo.findAll().stream()
            .filter(g -> g.getStatus() != GrievanceStatus.RESOLVED && g.getStatus() != GrievanceStatus.CLOSED)
            .filter(g -> g.getDeadline() != null && g.getDeadline().isBefore(LocalDateTime.now()))
            .toList();

        for (Grievance g : active) {
            if (g.getPriority() == null || g.getPriority() < 3) {
                g.setPriority(3);
                grievanceRepo.save(g);
                log.info("Escalated Grievance #{} priority due to SLA breach", g.getId());
            }
        }
    }
}
