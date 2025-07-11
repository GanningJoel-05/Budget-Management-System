package com.expensetracker.demo.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.ExpenseRepository;
import com.expensetracker.demo.repository.UserRepository;

@Service
public class DashboardService {
	

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private ExpenseRepository expenseRepo;

    public User registerUser(User user) {
        return userRepo.save(user);
    }

    public User login(String email, String password) {
        return userRepo.findByEmailAndPassword(email, password);
    }

    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public Map<String, Object> getDashboardSummary(Long userId) {
    	Map<String, Object> summary = new HashMap<>();
    	
    	double totalExpenses = expenseRepo.getTotalExpenseAmountByUserId(userId);
        int numberOfExpenses = expenseRepo.countByUserId(userId);
        Date firstExpenseDate = expenseRepo.findFirstExpenseDate(userId);
        Date lastExpenseDate = expenseRepo.findLastExpenseDate(userId);

        summary.put("totalExpenses", totalExpenses);
        summary.put("numberOfExpenses", numberOfExpenses);
        summary.put("firstExpenseDate", firstExpenseDate);
        summary.put("lastExpenseDate", lastExpenseDate);
        
        return summary;
        }
    }


