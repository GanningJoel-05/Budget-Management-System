package com.expensetracker.demo.controller;

import com.expensetracker.demo.model.Income;
import com.expensetracker.demo.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income")
@CrossOrigin(origins = "*")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @PostMapping("/add")
    public Income addIncome(@RequestBody Income income) {
        return incomeService.addIncome(income);
    }

    @GetMapping("/user/{userId}")
    public List<Income> getIncomeByUser(@PathVariable Long userId) {
        return incomeService.getIncomeByUser(userId);
    }
}
