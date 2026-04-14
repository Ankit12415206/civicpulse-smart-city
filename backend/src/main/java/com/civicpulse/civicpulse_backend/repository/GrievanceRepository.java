package com.civicpulse.civicpulse_backend.repository;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.model.GrievanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCitizenId(Long citizenId);
    List<Grievance> findByAssignedOfficerId(Long officerId);
    List<Grievance> findByStatus(GrievanceStatus status);
    List<Grievance> findByCategory(String category);
    long countByStatus(GrievanceStatus status);

    List<Grievance> findByCitizenIdAndSubmissionDateAfter(Long citizenId, LocalDateTime submissionDate);
    long countByCitizenIdAndSubmissionDateAfter(Long citizenId, LocalDateTime submissionDate);
    long countBySubmittedIpAndSubmissionDateAfter(String submittedIp, LocalDateTime submissionDate);
    long countByCitizenIdAndLocationIgnoreCaseAndCategoryIgnoreCaseAndStatus(
            Long citizenId,
            String location,
            String category,
            GrievanceStatus status
    );
}