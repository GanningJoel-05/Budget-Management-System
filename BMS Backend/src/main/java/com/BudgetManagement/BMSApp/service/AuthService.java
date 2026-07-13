package com.BudgetManagement.BMSApp.service;

import com.BudgetManagement.BMSApp.dto.LoginRequest;
import com.BudgetManagement.BMSApp.dto.RegisterRequest;
import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(RegisterRequest request) {
        // FIX: Normalize email the same way everywhere (trim + lowercase) so
        // register/login/forgot-password all match on the same value regardless
        // of how the user typed their email.
        String email = normalizeEmail(request.getEmail());

        if (userRepo.existsByEmail(email)) {
            return "Email already registered. Please login.";
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        // FIX: Password is now hashed with BCrypt before storage instead of plain text.
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepo.save(user);
        return "User registered successfully";
    }

    public User login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        // FIX: Can no longer look up by findByEmailAndPassword since passwords
        // are hashed (a hash is never equal to the plain text). Fetch by email,
        // then verify the raw password against the stored hash.
        User user = userRepo.findByEmail(email);
        if (user == null) return null;

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        return matches ? user : null;
    }

    public User getUserByEmail(String email) {
        return userRepo.findByEmail(normalizeEmail(email));
    }

    public boolean checkIfEmailExists(String email) {
        return userRepo.existsByEmail(normalizeEmail(email));
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}