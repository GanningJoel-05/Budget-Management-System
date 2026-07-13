package com.BudgetManagement.BMSApp.repository;

import com.BudgetManagement.BMSApp.model.Expense;
import com.BudgetManagement.BMSApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    // FIX: Changed param types from java.util.Date to LocalDate — matches Expense.date field type
    List<Expense> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    // Count by user ID directly via @Query (avoids fetching full User object)
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    double getTotalExpenseAmountByUserId(@Param("userId") Long userId);

    // FIX: Return type changed from java.util.Date to LocalDate to match model field
    @Query("SELECT MIN(e.date) FROM Expense e WHERE e.user.id = :userId")
    LocalDate findFirstExpenseDate(@Param("userId") Long userId);

    @Query("SELECT MAX(e.date) FROM Expense e WHERE e.user.id = :userId")
    LocalDate findLastExpenseDate(@Param("userId") Long userId);
}