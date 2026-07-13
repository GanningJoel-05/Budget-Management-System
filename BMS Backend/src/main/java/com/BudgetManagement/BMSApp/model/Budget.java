package com.BudgetManagement.BMSApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double amount;

    // Stores "MM-YYYY" e.g. "06-2025" — used to find budget for current month
    private String monthYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    public Budget() {}

    public Budget(Long id, double amount, String monthYear, User user) {
        this.id = id;
        this.amount = amount;
        this.monthYear = monthYear;
        this.user = user;
    }

}