package com.civicpulse.civicpulse_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class SentimentService {

    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);
    private static final String SENTIMENT_API = "http://localhost:5000/analyze";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Analyze text sentiment via the Python Flask microservice.
     * Returns a map with: sentiment, score, priority, urgencyDetected
     * Falls back gracefully if the sentiment service is unavailable.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeSentiment(String text) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("sentiment", "neutral");
        fallback.put("score", 0.0);
        fallback.put("priority", "LOW");
        fallback.put("urgencyDetected", false);

        if (text == null || text.isBlank()) {
            return fallback;
        }

        try {
            Map<String, String> request = Map.of("text", text);
            Map<String, Object> response = restTemplate.postForObject(
                SENTIMENT_API, request, Map.class);
            if (response != null) {
                log.info("Sentiment analysis result: {}", response);
                return response;
            }
        } catch (Exception e) {
            log.warn("Sentiment service unavailable, using defaults: {}", e.getMessage());
        }

        return fallback;
    }

    /**
     * Convert sentiment priority string to integer (for Grievance.priority field)
     */
    public int priorityToInt(String priority) {
        return switch (priority != null ? priority.toUpperCase() : "") {
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            default -> 1;
        };
    }
}
