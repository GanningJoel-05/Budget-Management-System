package com.expensetracker.demo.service;

import com.expensetracker.demo.model.Budget;
import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.BudgetRepository;
import com.expensetracker.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    // Save or update budget
    public Budget setBudget(Budget budget) {
        // Find User entity by budget.userId (assuming Budget has userId or User)
        Long userId = budget.getUser().getId();  // or budget.getUserId() if userId is a field
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id " + userId);
        }

        User user = userOpt.get();

        // Check if budget exists for this user and monthYear
        Budget existing = budgetRepository.findByUserAndMonthYear(user, budget.getMonthYear());

        if (existing != null) {
            existing.setAmount(budget.getAmount());
            return budgetRepository.save(existing);
        } else {
            budget.setUser(user);
            return budgetRepository.save(budget);
        }
    }

    // Get budget by userId and current monthYear from Budget entity
    public Budget getBudgetByUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id " + userId);
        }
        User user = userOpt.get();

        // You can pass a specific monthYear or get the latest one, 
        // but here just returning budget for current month could be added later
        // For now, assuming one budget per user:
        return budgetRepository.findByUser(user);
    }
}
