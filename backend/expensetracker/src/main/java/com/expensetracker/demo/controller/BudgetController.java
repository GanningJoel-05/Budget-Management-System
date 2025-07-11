package com.expensetracker.demo.controller;

import com.expensetracker.demo.model.Budget;
import com.expensetracker.demo.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping("/budget/add")
    public ResponseEntity<?> addBudget(@RequestBody Budget budget) {
        Budget saved = budgetService.setBudget(budget);  // ✅ uses correct logic
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/user/{userId}")
    public Budget getBudgetByUser(@PathVariable Long userId) {
        return budgetService.getBudgetByUser(userId);
    }
}
