package com.BudgetManagement.BMSApp.service;

import com.BudgetManagement.BMSApp.model.Expense;
import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.repository.ExpenseRepository;
import com.BudgetManagement.BMSApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepo;

    @Autowired
    private UserRepository userRepo;

    /**
     * FIX: The original addExpense(expense) just called expenseRepo.save(expense) directly.
     * But the frontend sends { ..., userId: 1 } — a plain number, not a nested User object.
     * Hibernate cannot resolve the User FK from just a userId field on the Expense object.
     * Solution: Accept a userId transient field, look up the User, then set it before saving.
     */
    public Expense addExpense(Expense expense) {
        if (expense.getUser() != null && expense.getUser().getId() != null) {
            User user = userRepo.findById(expense.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + expense.getUser().getId()));
            expense.setUser(user);
        }
        return expenseRepo.save(expense);
    }

    public List<Expense> getAllExpenses(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return expenseRepo.findByUser(user);
    }

    public List<Expense> getMonthlyExpenses(User user, LocalDate start, LocalDate end) {
        return expenseRepo.findByUserAndDateBetween(user, start, end);
    }

    public double calculateTotalExpenses(Long userId) {
        return expenseRepo.getTotalExpenseAmountByUserId(userId);
    }

    public Expense updateExpense(Long id, Expense updated) {
        Expense existing = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));
        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setDate(updated.getDate());
        existing.setCategory(updated.getCategory());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        return expenseRepo.save(existing);
    }

    public void deleteExpense(Long id) {
        if (!expenseRepo.existsById(id)) throw new RuntimeException("Expense not found with ID: " + id);
        expenseRepo.deleteById(id);
    }
}