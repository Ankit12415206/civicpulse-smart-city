package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String msg = userService.register(
            body.get("username"),
            body.get("email"),
            body.get("password"),
            body.get("role")
        );
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        Map<String, String> result = userService.login(
            body.get("email"),
            body.get("password")
        );
        return ResponseEntity.ok(result);
    }
}