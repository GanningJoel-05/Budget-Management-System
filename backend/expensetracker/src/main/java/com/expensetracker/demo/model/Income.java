package com.expensetracker.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "incomes")
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;
    private double amount;
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Income() {
    	
    }

    public Income(Long id, String source, double amount, LocalDate date, User user) {
        this.id = id;
        this.source = source;
        this.amount = amount;
        this.date = date;
        this.user = user;
    }

    public Long getId() { 
    	return id; 
    }

    public void setId(Long id) { 
    	this.id = id; 
    }

    public String getSource() { 
    	return source; 
    }

    public void setSource(String source) { 
    	this.source = source; 
    }

    public double getAmount() { 
    	return amount; 
    }

    public void setAmount(double amount) { 
    	this.amount = amount;
    }

    public LocalDate getDate() { 
    	return date; 
    }

    public void setDate(LocalDate date) { 
    	this.date = date; 
    }

    public User getUser() {
    	return user; 
    }

    public void setUser(User user) { 
    	this.user = user; 
    }
}
