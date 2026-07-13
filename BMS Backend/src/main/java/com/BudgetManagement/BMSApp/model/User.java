package com.BudgetManagement.BMSApp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fullname", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    // FIX: @JsonIgnore prevents password from being sent in API responses
    @JsonIgnore
    @Column(name = "password", nullable = false)
    private String password;

    public User() {}

}