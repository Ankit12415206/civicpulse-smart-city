package com.civicpulse.civicpulse_backend.repository;

import com.civicpulse.civicpulse_backend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByGrievanceId(Long grievanceId);
}