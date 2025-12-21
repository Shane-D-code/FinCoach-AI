package com.fincoach.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class Dtos {

    @Data
    public static class SignupRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class OtpVerificationRequest {
        private String email;
        private String otp;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class JwtResponse {
        private String token;
        private Long id;
        private String name;
        private String email;
        private Boolean verified;
    }

    @Data
    public static class TransactionRequest {
        private LocalDate date;
        private String category;
        private Double amount;
        private String type; // INCOME, EXPENSE
        private String source; // MANUAL, OCR
    }

    @Data
    @Builder
    public static class DailySpendResponse {
        private Double totalSpent;
        private Map<String, Double> categoryBreakdown;
        private Boolean limitExceeded;
    }

    @Data
    @Builder
    public static class BudgetRecommendationResponse {
        private String category;
        private String suggestion;
        private String riskLevel; // LOW, MEDIUM, HIGH
    }

    @Data
    public static class ScenarioRequest {
        private Double currentBalance;
        private Double monthlyIncome;
        private Double targetSavings;
        private Integer months;
    }

    @Data
    @Builder
    public static class ScenarioResponse {
        private Double futureBalance;
        private String riskLevel;
    }
}
