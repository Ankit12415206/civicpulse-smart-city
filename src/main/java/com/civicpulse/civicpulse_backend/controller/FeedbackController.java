package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.model.Feedback;
import com.civicpulse.civicpulse_backend.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/citizen/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submit(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                feedbackService.submitFeedback(body, auth.getName()));
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/reopen/{id}")
    public ResponseEntity<?> reopen(@PathVariable Long id) {
        feedbackService.reopenGrievance(id);
        return ResponseEntity.ok(Map.of("message", "Grievance reopened"));
    }
}