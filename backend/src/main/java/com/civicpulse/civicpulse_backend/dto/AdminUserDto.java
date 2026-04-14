package com.civicpulse.civicpulse_backend.dto;

import com.civicpulse.civicpulse_backend.model.Role;
import com.civicpulse.civicpulse_backend.model.User;

public record AdminUserDto(
        Long id,
        String username,
        String email,
        Role role
) {
    public static AdminUserDto from(User user) {
        return new AdminUserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
