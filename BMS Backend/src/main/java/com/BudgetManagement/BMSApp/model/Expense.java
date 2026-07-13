package com.BudgetManagement.BMSApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private double amount;

    // FIX: Changed from java.util.Date to LocalDate for consistency with Income
    // and proper JSON serialization (no timestamp issues)
    private LocalDate date;

    @Column(nullable = false)
    private String category;

    private String description;

    // FIX: Was @JoinColumn(name = "user_name") — WRONG column name, caused mapping failure
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    public Expense() {}

}