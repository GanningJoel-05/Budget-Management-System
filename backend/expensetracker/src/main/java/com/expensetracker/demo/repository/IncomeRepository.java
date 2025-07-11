package com.expensetracker.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.expensetracker.demo.model.Income;
import com.expensetracker.demo.model.User;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUser(User user);
    List<Income> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
}
