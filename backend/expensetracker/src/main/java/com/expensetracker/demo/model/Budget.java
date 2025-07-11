package com.expensetracker.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double amount;
    private String monthYear;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Budget() {
    	
    }

    public Budget(Long id, double amount, String monthYear, User user) {
        this.id = id;
        this.amount = amount;
        this.monthYear = monthYear;
        this.user = user;
    }

    public Long getId() { 
    	return id;
    }

    public void setId(Long id) { 
    	this.id = id; 
    }

    public double getAmount() { 
    	return amount; 
    }

    public void setAmount(double amount) { 
    	this.amount = amount;
    }

    public String getMonthYear() { 
    	return monthYear;
    }

    public void setMonthYear(String monthYear) {
    	this.monthYear = monthYear; 
    }

    public User getUser() { 
    	return user; 
    }

    public void setUser(User user) { 
    	this.user = user; 
    }
}
