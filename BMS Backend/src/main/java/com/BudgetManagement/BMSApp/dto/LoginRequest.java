package com.BudgetManagement.BMSApp.dto;

import lombok.Getter;
import lombok.Setter;

// FIX: Added no-arg constructor — Jackson REQUIRES it to deserialize JSON request body.
// Without it, POST /api/auth/login always fails with 400 Bad Request.
@Setter
@Getter
public class LoginRequest {

    private String email;
    private String password;

    // Required by Jackson
    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

}