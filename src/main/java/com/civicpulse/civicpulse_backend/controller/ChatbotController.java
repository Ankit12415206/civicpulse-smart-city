package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/citizen/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> chat(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String message = body.getOrDefault("message", "");
        if (message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("reply", "Please type a message."));
        }
        return ResponseEntity.ok(chatbotService.processMessage(message, auth.getName()));
    }
}
