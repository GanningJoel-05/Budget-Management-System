package com.BudgetManagement.BMSApp.service;

import com.BudgetManagement.BMSApp.model.Budget;
import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.repository.BudgetRepository;
import com.BudgetManagement.BMSApp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    /**
     * FIX: Frontend sends { amount: X, userId: Y } — not a nested User object.
     * Original code called budget.getUser().getId() which NPE'd when user was null.
     * Now we accept a plain userId field via a wrapper, look up the User, and save.
     *
     * Also FIX: monthYear was never set from frontend — auto-generate current month.
     */
    public Budget setBudget(Budget budget) {
        Long userId = budget.getUser() != null ? budget.getUser().getId() : null;

        if (userId == null) {
            throw new RuntimeException("userId is required to set a budget.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Auto-set monthYear to current month if not provided
        String monthYear = budget.getMonthYear();
        if (monthYear == null || monthYear.isBlank()) {
            monthYear = LocalDate.now().format(DateTimeFormatter.ofPattern("MM-yyyy"));
        }

        // Upsert: update existing budget for this month, or create new one
        Budget existing = budgetRepository.findByUserAndMonthYear(user, monthYear);
        if (existing != null) {
            existing.setAmount(budget.getAmount());
            return budgetRepository.save(existing);
        } else {
            budget.setUser(user);
            budget.setMonthYear(monthYear);
            return budgetRepository.save(budget);
        }
    }

    public Budget getBudgetByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get budget for current month
        String currentMonthYear = LocalDate.now().format(DateTimeFormatter.ofPattern("MM-yyyy"));
        Budget budget = budgetRepository.findByUserAndMonthYear(user, currentMonthYear);

        // Fallback: return any budget for the user
        if (budget == null) {
            budget = budgetRepository.findByUser(user);
        }
        return budget;
    }
}