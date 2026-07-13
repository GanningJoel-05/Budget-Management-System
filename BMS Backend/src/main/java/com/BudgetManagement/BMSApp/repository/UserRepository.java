package com.BudgetManagement.BMSApp.repository;

import com.BudgetManagement.BMSApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    // FIX: findByEmailAndPassword removed — passwords are now BCrypt-hashed,
    // so lookup-by-plain-password no longer works. AuthService now fetches by
    // email and verifies the password with PasswordEncoder.matches().
    User findByEmail(String email);
}