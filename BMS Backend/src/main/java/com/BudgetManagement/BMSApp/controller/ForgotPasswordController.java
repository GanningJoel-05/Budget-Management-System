package com.BudgetManagement.BMSApp.controller;

import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // FIX: Added null/blank check — was NPE-ing if email key was missing from request
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase());
        if (user != null) {
            return ResponseEntity.ok("Email found.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email       = request.get("email");
        String newPassword = request.get("password");

        // FIX: Validate both fields before processing
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("New password is required.");
        }
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body("Password must be at least 8 characters.");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase());
        if (user != null) {
            // FIX: Hash the new password with BCrypt instead of storing plain text,
            // to stay consistent with AuthService.register().
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok("Password reset successful.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
    }
}