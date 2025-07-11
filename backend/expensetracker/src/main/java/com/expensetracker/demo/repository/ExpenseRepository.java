package com.expensetracker.demo.repository;

import com.expensetracker.demo.model.Expense;
import com.expensetracker.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

	List<Expense> findByUser(User user);

	List<Expense> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    
    int countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    double getTotalExpenseAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT MIN(e.date) FROM Expense e WHERE e.user.id = :userId")
    Date findFirstExpenseDate(@Param("userId") Long userId);

    @Query("SELECT MAX(e.date) FROM Expense e WHERE e.user.id = :userId")
    Date findLastExpenseDate(@Param("userId") Long userId);
}

