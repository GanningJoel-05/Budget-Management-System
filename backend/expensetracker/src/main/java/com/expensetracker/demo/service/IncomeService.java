package com.expensetracker.demo.service;

import com.expensetracker.demo.model.Income;
import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.IncomeRepository;
import com.expensetracker.demo.repository.UserRepository;
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

    public Income addIncome(Income income) {
        return incomeRepo.save(income);
    }

    // ✅ Added this method to match controller (takes userId)
    public List<Income> getIncomeByUser(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        return incomeRepo.findByUser(user);
    }

    public List<Income> getMonthlyIncome(User user, LocalDate start, LocalDate end) {
        return incomeRepo.findByUserAndDateBetween(user, start, end);
    }

    public double calculateTotalIncome(User user) {
        return getIncomeByUser(user.getId()).stream().mapToDouble(Income::getAmount).sum();
    }
}
