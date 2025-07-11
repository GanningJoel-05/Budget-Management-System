package com.expensetracker.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.expensetracker.demo.dto.LoginRequest;
import com.expensetracker.demo.dto.RegisterRequest;
import com.expensetracker.demo.model.User;
import com.expensetracker.demo.repository.UserRepository;

@Service

public class AuthService {
	
	@Autowired
    private UserRepository userRepo;
	
    public String register(RegisterRequest request) {
    
    	 User user = new User();
    	    user.setFullName(request.getFullName());
    	    System.out.println("Full Name: " + request.getFullName());
    	    user.setEmail(request.getEmail());
    	    user.setPassword(request.getPassword());

    	    userRepo.save(user);
    	    return "User registered successfully";
    }

    public User login(LoginRequest request) {
        return userRepo.findByEmailAndPassword(request.getEmail(), request.getPassword());
    }


    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email);
        
    }
    
    public boolean checkIfEmailExists(String email) {
        return userRepo.findByEmail(email) != null;
    }


}

