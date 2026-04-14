package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class GrievanceService {

    private static final Logger log = LoggerFactory.getLogger(GrievanceService.class);

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    @Value("${app.abuse.duplicate-window-days:7}")
    private int duplicateWindowDays;

    @Value("${app.abuse.user-limit-per-24h:5}")
    private int userLimitPer24h;

    @Value("${app.abuse.ip-limit-per-24h:10}")
    private int ipLimitPer24h;

    @Value("${app.abuse.pending-same-location-limit:3}")
    private int pendingSameLocationLimit;

    public GrievanceService(GrievanceRepository grievanceRepo,
                            UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    public Grievance submitGrievance(String title, String description,
                                      String category, String location,
                                      String imageUrl, String email,
                                      String clientIp) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        validateSubmission(citizen.getId(), title, description, category, location, clientIp);

        Grievance g = new Grievance();
        g.setTitle(title.trim());
        g.setDescription(description.trim());
        g.setCategory(category.trim());
        g.setLocation(location.trim());
        g.setImageUrl(imageUrl);
        g.setCitizenId(citizen.getId());
        g.setSubmittedIp(clientIp);
        Grievance saved = grievanceRepo.save(g);
        grievanceRepo.flush();
        return saved;
    }

    private void validateSubmission(Long citizenId,
                                    String title,
                                    String description,
                                    String category,
                                    String location,
                                    String clientIp) {
        validateInput(title, description, category, location);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime duplicateCutoff = now.minusDays(duplicateWindowDays);
        List<Grievance> recent = grievanceRepo.findByCitizenIdAndSubmissionDateAfter(citizenId, duplicateCutoff);

        String normalizedTitle = normalize(title);
        String normalizedCategory = normalize(category);
        String normalizedLocation = normalize(location);

        for (Grievance existing : recent) {
            if (normalizedTitle.equals(normalize(existing.getTitle()))
                    && normalizedCategory.equals(normalize(existing.getCategory()))
                    && normalizedLocation.equals(normalize(existing.getLocation()))) {
                throw new AbuseRuleViolationException(
                        "DUPLICATE_FOUND",
                        "A similar grievance already exists in the recent window.",
                        HttpStatus.CONFLICT,
                        0,
                        existing.getId()
                );
            }
        }

        LocalDateTime rateCutoff = now.minusHours(24);
        long userCount = grievanceRepo.countByCitizenIdAndSubmissionDateAfter(citizenId, rateCutoff);
        if (userCount >= userLimitPer24h) {
            throw new AbuseRuleViolationException(
                    "RATE_LIMIT_USER",
                    "Submission limit reached. Please try again later.",
                    HttpStatus.TOO_MANY_REQUESTS,
                    3600,
                    null
            );
        }

        if (clientIp != null && !clientIp.isBlank()) {
            long ipCount = grievanceRepo.countBySubmittedIpAndSubmissionDateAfter(clientIp, rateCutoff);
            if (ipCount >= ipLimitPer24h) {
                throw new AbuseRuleViolationException(
                        "RATE_LIMIT_IP",
                        "Too many submissions from this network. Please try again later.",
                        HttpStatus.TOO_MANY_REQUESTS,
                        3600,
                        null
                );
            }
        }

        long pendingSameLocation = grievanceRepo.countByCitizenIdAndLocationIgnoreCaseAndCategoryIgnoreCaseAndStatus(
                citizenId,
                location.trim(),
                category.trim(),
                GrievanceStatus.PENDING
        );
        if (pendingSameLocation >= pendingSameLocationLimit) {
            throw new AbuseRuleViolationException(
                    "SPAM_LOCATION_PENDING",
                    "Too many unresolved complaints for the same location and category.",
                    HttpStatus.TOO_MANY_REQUESTS,
                    86400,
                    null
            );
        }
    }

    private void validateInput(String title, String description, String category, String location) {
        if (title == null || title.trim().length() < 5 || title.trim().length() > 200) {
            throw new AbuseRuleViolationException(
                    "INVALID_TITLE",
                    "Title must be between 5 and 200 characters.",
                    HttpStatus.BAD_REQUEST,
                    0,
                    null
            );
        }
        if (description == null || description.trim().length() < 10 || description.trim().length() > 2000) {
            throw new AbuseRuleViolationException(
                    "INVALID_DESCRIPTION",
                    "Description must be between 10 and 2000 characters.",
                    HttpStatus.BAD_REQUEST,
                    0,
                    null
            );
        }
        if (category == null || category.trim().isEmpty()) {
            throw new AbuseRuleViolationException(
                    "INVALID_CATEGORY",
                    "Category is required.",
                    HttpStatus.BAD_REQUEST,
                    0,
                    null
            );
        }
        if (location == null || location.trim().isEmpty()) {
            throw new AbuseRuleViolationException(
                    "INVALID_LOCATION",
                    "Location is required.",
                    HttpStatus.BAD_REQUEST,
                    0,
                    null
            );
        }
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    public static class AbuseRuleViolationException extends RuntimeException {
        private final String code;
        private final HttpStatus status;
        private final Integer retryAfterSeconds;
        private final Long existingGrievanceId;

        public AbuseRuleViolationException(String code,
                                          String message,
                                          HttpStatus status,
                                          Integer retryAfterSeconds,
                                          Long existingGrievanceId) {
            super(message);
            this.code = code;
            this.status = status;
            this.retryAfterSeconds = retryAfterSeconds;
            this.existingGrievanceId = existingGrievanceId;
        }

        public String getCode() {
            return code;
        }

        public HttpStatus getStatus() {
            return status;
        }

        public Integer getRetryAfterSeconds() {
            return retryAfterSeconds;
        }

        public Long getExistingGrievanceId() {
            return existingGrievanceId;
        }
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