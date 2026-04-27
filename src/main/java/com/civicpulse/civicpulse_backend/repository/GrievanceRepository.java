package com.civicpulse.civicpulse_backend.repository;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.model.GrievanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCitizenId(Long citizenId);
    List<Grievance> findByAssignedOfficerId(Long officerId);
    List<Grievance> findByStatus(GrievanceStatus status);
    List<Grievance> findByCategory(String category);
    long countByStatus(GrievanceStatus status);

    // SLA reporting
    List<Grievance> findByDepartmentId(Long departmentId);
    long countByAssignedOfficerId(Long officerId);
    List<Grievance> findByStatusAndDeadlineBefore(GrievanceStatus status, LocalDateTime deadline);

    // Optimized category counting
    @Query("SELECT g.category, COUNT(g) FROM Grievance g GROUP BY g.category")
    List<Object[]> countByCategory();

    // Monthly stats
    @Query("SELECT FUNCTION('MONTH', g.submissionDate), FUNCTION('YEAR', g.submissionDate), COUNT(g) " +
           "FROM Grievance g GROUP BY FUNCTION('YEAR', g.submissionDate), FUNCTION('MONTH', g.submissionDate) " +
           "ORDER BY FUNCTION('YEAR', g.submissionDate), FUNCTION('MONTH', g.submissionDate)")
    List<Object[]> countByMonth();
}