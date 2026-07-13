package com.BudgetManagement.BMSApp.controller;

import com.BudgetManagement.BMSApp.dto.LoginRequest;
import com.BudgetManagement.BMSApp.dto.RegisterRequest;
import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        // FIX: Validate required fields — was missing, allowed blank registrations
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().body("Full name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Password is required.");
        }

        String result = authService.register(request);
        if (result.equals("User registered successfully")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // FIX: Validate required fields before hitting DB
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        User user = authService.login(request);
        if (user == null) {
            // FIX: Was returning empty 401 — now returns a readable error message
            return ResponseEntity.status(401).body("Invalid email or password.");
        }
        // NOTE: Password is @JsonIgnore on User model, so it won't be included in response
        return ResponseEntity.ok(user);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<User> getUser(@PathVariable String email) {
        User user = authService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
}