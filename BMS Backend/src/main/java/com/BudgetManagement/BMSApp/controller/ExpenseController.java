package com.BudgetManagement.BMSApp.controller;

import com.BudgetManagement.BMSApp.model.Expense;
import com.BudgetManagement.BMSApp.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    // FIX: Was returning raw Expense — now returns ResponseEntity for proper HTTP status codes
    @PostMapping("/add")
    public ResponseEntity<?> addExpense(@RequestBody Expense expense) {
        try {
            Expense saved = expenseService.addExpense(expense);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getExpensesByUserId(@PathVariable Long userId) {
        try {
            List<Expense> expenses = expenseService.getAllExpenses(userId);
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        try {
            Expense updated = expenseService.updateExpense(id, expense);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        try {
            expenseService.deleteExpense(id);
            return ResponseEntity.ok("Deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}