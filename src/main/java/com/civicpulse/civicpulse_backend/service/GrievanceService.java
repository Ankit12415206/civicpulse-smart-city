package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
@Transactional
public class GrievanceService {

    private static final Logger log = LoggerFactory.getLogger(GrievanceService.class);

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final SentimentService sentimentService;

    public GrievanceService(GrievanceRepository grievanceRepo,
                            UserRepository userRepo,
                            EmailService emailService,
                            SentimentService sentimentService) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
        this.sentimentService = sentimentService;
    }

    public Grievance submitGrievance(String title, String description,
                                      String category, String location,
                                      String imageUrl, String email,
                                      Double latitude, Double longitude) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Grievance g = new Grievance();
        g.setTitle(title);
        g.setDescription(description);
        g.setCategory(category);
        g.setLocation(location);
        g.setImageUrl(imageUrl);
        g.setCitizenId(citizen.getId());
        if (latitude != null) g.setLatitude(latitude);
        if (longitude != null) g.setLongitude(longitude);

        // Emotion AI: analyze sentiment and auto-set priority
        try {
            var sentiment = sentimentService.analyzeSentiment(description);
            g.setSentimentScore((Double) sentiment.get("score"));
            g.setSentimentLabel((String) sentiment.get("sentiment"));
            String aiPriority = (String) sentiment.get("priority");
            g.setPriority(sentimentService.priorityToInt(aiPriority));
            log.info("Sentiment: {} | Priority auto-set to: {}", sentiment.get("sentiment"), aiPriority);
        } catch (Exception e) {
            log.warn("Sentiment analysis skipped: {}", e.getMessage());
        }

        Grievance saved = grievanceRepo.save(g);
        grievanceRepo.flush();
        return saved;
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
        Grievance saved = grievanceRepo.save(g);

        // Notify citizen about status change
        userRepo.findById(g.getCitizenId()).ifPresent(citizen ->
            emailService.sendStatusUpdateEmail(citizen.getEmail(), g.getTitle(), status)
        );

        return saved;
    }
}