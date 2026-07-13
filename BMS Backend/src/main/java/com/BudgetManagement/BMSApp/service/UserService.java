package com.BudgetManagement.BMSApp.service;

import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public User getUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    public boolean emailExists(String email) {
        return userRepo.existsByEmail(email);
    }
}