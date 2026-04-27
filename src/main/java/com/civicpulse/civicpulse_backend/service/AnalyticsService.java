package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.model.GrievanceStatus;
import com.civicpulse.civicpulse_backend.repository.DepartmentRepository;
import com.civicpulse.civicpulse_backend.repository.GrievanceRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final GrievanceRepository grievanceRepo;
    private final DepartmentRepository deptRepo;

    public AnalyticsService(GrievanceRepository grievanceRepo,
                            DepartmentRepository deptRepo) {
        this.grievanceRepo = grievanceRepo;
        this.deptRepo = deptRepo;
    }

    @Cacheable("analyticsSummary")
    public Map<String, Object> getSummary() {
        Map<String, Object> result = new HashMap<>();
        result.put("total",      grievanceRepo.count());
        result.put("pending",    grievanceRepo.countByStatus(
                                     GrievanceStatus.PENDING));
        result.put("inProgress", grievanceRepo.countByStatus(
                                     GrievanceStatus.IN_PROGRESS));
        result.put("resolved",   grievanceRepo.countByStatus(
                                     GrievanceStatus.RESOLVED));
        result.put("reopened",   grievanceRepo.countByStatus(
                                     GrievanceStatus.REOPENED));
        result.put("closed",     grievanceRepo.countByStatus(
                                     GrievanceStatus.CLOSED));
        return result;
    }

    /** Optimized: single GROUP BY query instead of 6 separate queries */
    @Cacheable("categoryStats")
    public Map<String, Long> getCategoryStats() {
        Map<String, Long> result = new LinkedHashMap<>();
        grievanceRepo.countByCategory().forEach(row -> {
            String category = (String) row[0];
            Long count = (Long) row[1];
            if (category != null) result.put(category, count);
        });
        return result;
    }

    /** SLA Performance Report: avg resolution time, breach rate per department */
    @Cacheable("slaReport")
    public Map<String, Object> getSlaReport() {
        List<Grievance> all = grievanceRepo.findAll();
        Map<String, Object> report = new HashMap<>();

        // Overall SLA stats
        List<Grievance> resolved = all.stream()
            .filter(g -> g.getResolvedDate() != null && g.getSubmissionDate() != null)
            .collect(Collectors.toList());

        double avgResolutionHours = resolved.stream()
            .mapToLong(g -> ChronoUnit.HOURS.between(g.getSubmissionDate(), g.getResolvedDate()))
            .average().orElse(0);
        report.put("avgResolutionHours", Math.round(avgResolutionHours * 10.0) / 10.0);
        report.put("avgResolutionDays", Math.round((avgResolutionHours / 24.0) * 10.0) / 10.0);

        // SLA breaches (resolved AFTER deadline, or still open past deadline)
        long breachedCount = all.stream()
            .filter(g -> g.getDeadline() != null)
            .filter(g -> {
                if (g.getResolvedDate() != null) {
                    return g.getResolvedDate().isAfter(g.getDeadline());
                }
                return LocalDateTime.now().isAfter(g.getDeadline())
                    && g.getStatus() != GrievanceStatus.RESOLVED
                    && g.getStatus() != GrievanceStatus.CLOSED;
            })
            .count();
        long withDeadline = all.stream().filter(g -> g.getDeadline() != null).count();
        double breachRate = withDeadline > 0 ? Math.round((breachedCount * 100.0 / withDeadline) * 10.0) / 10.0 : 0;
        report.put("breachedCount", breachedCount);
        report.put("breachRate", breachRate);
        report.put("onTimeRate", Math.round((100.0 - breachRate) * 10.0) / 10.0);

        // Per-department breakdown
        List<Map<String, Object>> deptStats = new ArrayList<>();
        Map<String, List<Grievance>> byCategory = all.stream()
            .filter(g -> g.getCategory() != null)
            .collect(Collectors.groupingBy(Grievance::getCategory));

        byCategory.forEach((category, grievances) -> {
            Map<String, Object> dept = new HashMap<>();
            dept.put("department", category);
            dept.put("total", grievances.size());
            long deptResolved = grievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED || g.getStatus() == GrievanceStatus.CLOSED)
                .count();
            dept.put("resolved", deptResolved);
            double deptAvg = grievances.stream()
                .filter(g -> g.getResolvedDate() != null && g.getSubmissionDate() != null)
                .mapToLong(g -> ChronoUnit.HOURS.between(g.getSubmissionDate(), g.getResolvedDate()))
                .average().orElse(0);
            dept.put("avgHours", Math.round(deptAvg * 10.0) / 10.0);
            long deptBreached = grievances.stream()
                .filter(g -> g.getDeadline() != null)
                .filter(g -> {
                    if (g.getResolvedDate() != null) return g.getResolvedDate().isAfter(g.getDeadline());
                    return LocalDateTime.now().isAfter(g.getDeadline())
                        && g.getStatus() != GrievanceStatus.RESOLVED
                        && g.getStatus() != GrievanceStatus.CLOSED;
                })
                .count();
            dept.put("breached", deptBreached);
            deptStats.add(dept);
        });
        report.put("departments", deptStats);

        return report;
    }

    /** Monthly trend report for line charts */
    public List<Map<String, Object>> getMonthlyReport() {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] monthNames = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        grievanceRepo.countByMonth().forEach(row -> {
            Map<String, Object> entry = new HashMap<>();
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            long count = ((Number) row[2]).longValue();
            entry.put("month", monthNames[month]);
            entry.put("year", year);
            entry.put("label", monthNames[month] + " " + year);
            entry.put("count", count);
            result.add(entry);
        });
        return result;
    }
}