package com.expensetracker.demo.service;

import com.expensetracker.demo.model.Expense;
import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.ExpenseRepository;
import com.expensetracker.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDate;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepo;

    @Autowired
    private UserRepository userRepo;

    public Expense addExpense(Expense expense) {
        return expenseRepo.save(expense);
    }

    // ✅ FIXED: Accepts userId instead of User
    public List<Expense> getAllExpenses(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        return expenseRepo.findByUser(user);
    }

    public List<Expense> getMonthlyExpenses(User user, LocalDate start, LocalDate end) {
        return expenseRepo.findByUserAndDateBetween(user, start, end);
    }

    public double calculateTotalExpenses(User user) {
        return getAllExpenses(user.getId()).stream().mapToDouble(Expense::getAmount).sum();
    }
}

