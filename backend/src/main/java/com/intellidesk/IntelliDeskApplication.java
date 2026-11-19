package com.intellidesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * IntelliDesk Application Entry Point
 * 
 * Configures the Spring Boot application context with JPA auditing enabled
 * to automatically track entity creation and modification timestamps.
 */
@SpringBootApplication
@EnableJpaAuditing
public class IntelliDeskApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntelliDeskApplication.class, args);
    }
}
