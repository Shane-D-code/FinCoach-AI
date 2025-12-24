package com.fincoach;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.fincoach.repository")
@EntityScan(basePackages = "com.fincoach.entity")
@EnableJpaAuditing
public class FinCoachApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinCoachApplication.class, args);
    }
}
