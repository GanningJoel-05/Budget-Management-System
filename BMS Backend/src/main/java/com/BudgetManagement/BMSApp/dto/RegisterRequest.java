package com.BudgetManagement.BMSApp.dto;

import lombok.Getter;
import lombok.Setter;

// FIX: Added no-arg constructor — Jackson REQUIRES it to deserialize JSON request body.
// Without it, POST /api/auth/register always fails with 400 Bad Request.
@Setter
@Getter
public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;

    // Required by Jackson
    public RegisterRequest() {}

    public RegisterRequest(String fullName, String email, String password) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }

}