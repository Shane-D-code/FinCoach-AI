package com.fincoach.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ScenarioRequest {
        private Double currentBalance;
        private Double monthlyIncome;
        private Double targetSavings;
        private Integer months;
    }

    @Data
    public static class RealTimeScenarioRequest {
        private Long userId;
        private Double currentBalance;
        private Double targetSavings;
        private Integer months;
        private String scenarioType; // SPENDING, INVESTMENT, DEBT_PAYOFF, SAVINGS_GOAL
    }

    @Data
    @Builder
    public static class ScenarioResponse {
        private Double futureBalance;
        private String riskLevel;
        private Double totalSavings;
        private Double riskAdjustedSavings;
        private String status;
        private String predictedOutcome;
        private String forecastTrend;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RiskAssessmentRequest {
        private Map<String, Object> data;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RiskAssessmentResponse {
        private Double risk_score;
        private String risk_label;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NearbyDealsRequest {
        private Double latitude;
        private Double longitude;
        private Double radius_km = 5.0;
        private Integer top_k = 10;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NearbyDealsResponse {
        private Integer count;
        private List<DealItem> deals;
        private List<Double> result;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DealItem {
        private String merchant_name; // Matches Python JSON key
        private String discount; // Matches Python JSON key
        private Double latitude;
        private Double longitude;
        private Double distance_km;
        private Double score;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RealTimeScenarioResponse {
        private String scenarioId;
        private Long userId;
        private String scenarioType;
        private Double futureBalance;
        private String riskLevel;
        private Double totalSavings;
        private Double riskAdjustedSavings;
        private String status;
        private String predictedOutcome;
        private String forecastTrend;
        private List<String> insights;
        private List<String> recommendations;
        private Double confidence;
        private Integer dataPoints;
        private LocalDateTime lastUpdated;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FinancialMetrics {
        private double avgMonthlyIncome;
        private double avgMonthlyExpenses;
        private double savingsRate;
        private double incomeStability;
        private double expenseVolatility;
        private Map<String, Double> categorySpending;
        private int totalTransactions;
        private int dataPoints;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PurchaseRequest {
        private Double currentBalance;
        private Double monthlyIncome;
        private Double monthlyExpenses;
        private Double purchaseAmount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PurchaseResponse {
        private Double new_balance;
        private String risk_level;
        private String advice;
        private Double recovery_months;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExpenseForecastRequest {
        private Integer userId;
        private Double monthlyIncome;
        private Double currentExpenses;
        private String category;
        private Integer months;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyForecast {
        private String month;
        private Double predicted_expense;
        private Double confidence_low;
        private Double confidence_high;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExpenseForecastResponse {
        private List<MonthlyForecast> forecasts;
        private Double total_forecasted;
        private Double average_monthly;
        private String trend;
        private List<String> recommendations;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PortfolioItem {
        private String symbol;
        private Double quantity;
        private Double purchase_price;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PortfolioRequest {
        private List<PortfolioItem> items;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PortfolioHolding {
        private String symbol;
        private Double quantity;
        private Double current_price_usd;
        private Double current_val_inr;
        private Double gain_pct;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PortfolioResponse {
        private Double total_value;
        private List<PortfolioHolding> holdings;
        private Double currency_rate;
    }

    // OCR DTOs
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExtractedItem {
        private String description;
        private Double amount;
        private Integer quantity;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BillData {
        private String merchant_name;
        private String date;
        private Double total_amount;
        private List<ExtractedItem> items;
        private Double tax;
        private String currency;
        private Double confidence;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OCRResponse {
        private Boolean success;
        private BillData bill_data;
        private String raw_text;
        private String message;
    }
}
