package com.expensetracker.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  
public class ForgotPasswordController {

    private final UserRepository userRepository;

    public ForgotPasswordController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok("Email found.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password");
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setPassword(newPassword);
            userRepository.save(user);
            return ResponseEntity.ok("Password reset successful.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
    }
}
