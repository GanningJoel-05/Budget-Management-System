package com.expensetracker.demo.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Expense {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String title;
	private double amount;

	@Temporal(TemporalType.DATE)
    private Date date;

	private String category;
	private String description;

	@ManyToOne
	@JoinColumn(name = "user_name")
	private User user;

    public Long getId() { 
    	return id; 
    }

    public void setId(Long id) { 
    	this.id = id;
    }

    public String getTitle() { 
    	return title; 
    }

    public void setTitle(String title) {
    	this.title = title; 
    }

    public double getAmount() { 
    	return amount; 
    }

    public void setAmount(double amount) { 
    	this.amount = amount; 
    }

    public Date getDate() { 
    	return date; 
    }

    public void setDate(Date date) { 
    	this.date = date; 
    }

    public String getCategory() {
    	return category; 
    }

    public void setCategory(String category) { 
    	this.category = category;
    }

    public String getDescription() { 
    	return description; 
    }

    public void setDescription(String description) { 
    	this.description = description; 
    }

    public User getUser() { 
    	return user; 
    }

    public void setUser(User user) { 
    	this.user = user; 
    }
}
