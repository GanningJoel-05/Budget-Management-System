package com.BudgetManagement.BMSApp.repository;

import com.BudgetManagement.BMSApp.model.Budget;
import com.BudgetManagement.BMSApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Budget findByUserAndMonthYear(User user, String monthYear);

    Budget findByUser(User user);
}