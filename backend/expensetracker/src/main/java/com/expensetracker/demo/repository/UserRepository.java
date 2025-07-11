package com.expensetracker.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expensetracker.demo.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

	boolean existsByEmail(String email);

	User findByEmailAndPassword(String email, String password);

	User findByEmail(String email);

}
