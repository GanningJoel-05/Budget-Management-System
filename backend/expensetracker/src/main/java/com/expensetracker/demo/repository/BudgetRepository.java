package com.expensetracker.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.expensetracker.demo.model.Budget;
import com.expensetracker.demo.model.User;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Budget findByUserAndMonthYear(User user, String monthYear);
    Budget findByUser(User user);
}
