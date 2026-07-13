package com.BudgetManagement.BMSApp.controller;

import com.BudgetManagement.BMSApp.model.Budget;
import com.BudgetManagement.BMSApp.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // NOTE: Frontend calls POST /api/budget/budget/add — keeping doubled path to match frontend.
    // To clean up in future: change to /add and update frontend to /api/budget/add
    @PostMapping("/budget/add")
    public ResponseEntity<?> addBudget(@RequestBody Budget budget) {
        try {
            Budget saved = budgetService.setBudget(budget);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBudgetByUser(@PathVariable Long userId) {
        try {
            Budget budget = budgetService.getBudgetByUser(userId);
            if (budget == null) {
                // No budget set yet — return empty object so frontend handles gracefully
                return ResponseEntity.ok(new Budget());
            }
            return ResponseEntity.ok(budget);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}