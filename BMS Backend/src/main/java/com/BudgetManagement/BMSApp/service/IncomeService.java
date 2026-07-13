package com.BudgetManagement.BMSApp.service;

import com.BudgetManagement.BMSApp.model.Income;
import com.BudgetManagement.BMSApp.model.User;
import com.BudgetManagement.BMSApp.repository.IncomeRepository;
import com.BudgetManagement.BMSApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepo;

    @Autowired
    private UserRepository userRepo;

    /**
     * FIX: Same issue as ExpenseService — frontend sends userId as a number.
     * Must resolve full User entity before saving Income.
     */
    public Income addIncome(Income income) {
        if (income.getUser() != null && income.getUser().getId() != null) {
            User user = userRepo.findById(income.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + income.getUser().getId()));
            income.setUser(user);
        }
        return incomeRepo.save(income);
    }

    public List<Income> getIncomeByUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return incomeRepo.findByUser(user);
    }

    public List<Income> getMonthlyIncome(User user, LocalDate start, LocalDate end) {
        return incomeRepo.findByUserAndDateBetween(user, start, end);
    }

    public double calculateTotalIncome(Long userId) {
        return getIncomeByUser(userId).stream().mapToDouble(Income::getAmount).sum();
    }

    public Income updateIncome(Long id, Income updated) {
        Income existing = incomeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found with ID: " + id));
        existing.setSource(updated.getSource());
        existing.setAmount(updated.getAmount());
        existing.setDate(updated.getDate());
        return incomeRepo.save(existing);
    }

    public void deleteIncome(Long id) {
        if (!incomeRepo.existsById(id)) throw new RuntimeException("Income not found with ID: " + id);
        incomeRepo.deleteById(id);
    }
}