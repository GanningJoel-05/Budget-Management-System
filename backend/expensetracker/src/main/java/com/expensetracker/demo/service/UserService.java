package com.expensetracker.demo.service;

import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    // ✅ Get user details by userId
    public User getUserById(Long userId) {
        Optional<User> userOptional = userRepo.findById(userId);
        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    // Optionally: update user profile (if uncommented in controller)
    public User updateUser(Long userId, User updatedUser) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        user.setPassword(updatedUser.getPassword());

        return userRepo.save(user);
    }

    // Optionally: register or login methods (if needed elsewhere)
    public boolean emailExists(String email) {
        return userRepo.existsByEmail(email);
    }

    public User login(String email, String password) {
        return userRepo.findByEmailAndPassword(email, password);
    }

    public User register(User user) {
        return userRepo.save(user);
    }
}
