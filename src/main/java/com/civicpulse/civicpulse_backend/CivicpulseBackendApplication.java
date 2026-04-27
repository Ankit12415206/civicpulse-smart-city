package com.civicpulse.civicpulse_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableCaching
public class CivicpulseBackendApplication {

    private static final Logger log = LoggerFactory.getLogger(CivicpulseBackendApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(CivicpulseBackendApplication.class, args);
	}

    @Bean
    public CommandLineRunner updateDatabaseSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE grievances MODIFY COLUMN status ENUM('PENDING','IN_PROGRESS','RESOLVED','REOPENED','CLOSED') DEFAULT 'PENDING'");
                log.info("Successfully updated grievances status enum to include CLOSED.");
            } catch (Exception e) {
                log.warn("Could not alter grievances table (it may not exist yet or already be updated): {}", e.getMessage());
            }
        };
    }
}
