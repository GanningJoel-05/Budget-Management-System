package com.BudgetManagement.BMSApp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Jackson to properly serialize/deserialize Java 8+ date types
 * (LocalDate, LocalDateTime) as "2025-06-15" strings instead of timestamps.
 *
 * This replaces the broken spring.jackson.serialization property
 * which is not supported in Jackson 3 (used by Spring Boot 4.x).
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Register the JavaTimeModule so Jackson knows how to handle LocalDate etc.
        mapper.registerModule(new JavaTimeModule());

        // Serialize dates as "2025-06-15" strings, NOT as [2025, 6, 15] arrays
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper;
    }
}