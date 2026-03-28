package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepo;
    private final UserRepository userRepo;
    private final GrievanceRepository grievanceRepo;

    public FeedbackService(FeedbackRepository feedbackRepo,
                           UserRepository userRepo,
                           GrievanceRepository grievanceRepo) {
        this.feedbackRepo = feedbackRepo;
        this.userRepo = userRepo;
        this.grievanceRepo = grievanceRepo;
    }

    public Feedback submitFeedback(Map<String, Object> body, String email) {
        User citizen = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Feedback f = new Feedback();
        f.setGrievanceId(Long.valueOf(body.get("grievanceId").toString()));
        f.setCitizenId(citizen.getId());
        f.setRating(Integer.valueOf(body.get("rating").toString()));
        f.setComment(body.get("comment").toString());
        return feedbackRepo.save(f);
    }

    public void reopenGrievance(Long grievanceId) {
        Grievance g = grievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new RuntimeException("Not found"));
        g.setStatus(GrievanceStatus.REOPENED);
        grievanceRepo.save(g);
    }
}