package com.fincoach.service;

import com.fincoach.dto.Dtos.*;
import com.fincoach.repository.TransactionRepository;
import com.fincoach.repository.UserRepository;
import com.fincoach.entity.Transaction;
import com.fincoach.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional
public class ScenarioSimulationService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MLService mlService;

    /**
     * Simulate financial scenario based on real user transaction data
     */
    public RealTimeScenarioResponse simulateRealTimeScenario(RealTimeScenarioRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's transaction history for the last 12 months
        LocalDate twelveMonthsAgo = LocalDate.now().minusMonths(12);
        List<Transaction> recentTransactions = transactionRepository
                .findByUserAndDateAfter(user, twelveMonthsAgo);

        // Calculate real financial metrics from actual data
        FinancialMetrics metrics = calculateFinancialMetrics(recentTransactions);

        // Generate scenario simulation request with real data
        ScenarioRequest scenarioRequest = createScenarioRequest(request, metrics);

        // Call ML service for enhanced simulation
        ScenarioResponse mlResponse = mlService.simulateScenario(scenarioRequest);

        // Combine ML response with real-time insights
        return createRealTimeResponse(request, metrics, mlResponse, recentTransactions);
    }

    /**
     * Calculate financial metrics from real transaction data
     */
    private FinancialMetrics calculateFinancialMetrics(List<Transaction> transactions) {
        if (transactions.isEmpty()) {
            return createEmptyMetrics();
        }

        // Separate income and expenses
        List<Transaction> income = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .collect(Collectors.toList());

        List<Transaction> expenses = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.toList());

        // Calculate monthly averages
        double avgMonthlyIncome = calculateMonthlyAverage(income);
        double avgMonthlyExpenses = calculateMonthlyAverage(expenses);

        // Calculate spending patterns
        Map<String, Double> categorySpending = calculateCategorySpending(expenses);

        // Calculate savings rate
        double savingsRate = avgMonthlyIncome > 0 ? (avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome : 0;

        // Calculate income stability (coefficient of variation)
        double incomeStability = calculateIncomeStability(income);

        // Calculate expense volatility
        double expenseVolatility = calculateExpenseVolatility(expenses);

        return FinancialMetrics.builder()
                .avgMonthlyIncome(avgMonthlyExpenses)
                .avgMonthlyExpenses(avgMonthlyExpenses)
                .savingsRate(savingsRate)
                .incomeStability(incomeStability)
                .expenseVolatility(expenseVolatility)
                .categorySpending(categorySpending)
                .totalTransactions(transactions.size())
                .dataPoints(transactions.size())
                .build();
    }

    private double calculateMonthlyAverage(List<Transaction> transactions) {
        if (transactions.isEmpty())
            return 0.0;

        Map<YearMonth, Double> monthlyTotals = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(Transaction::getAmount)));

        return monthlyTotals.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    private Map<String, Double> calculateCategorySpending(List<Transaction> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)));
    }

    private double calculateIncomeStability(List<Transaction> income) {
        if (income.size() < 2)
            return 1.0;

        List<Double> monthlyIncomes = income.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(Transaction::getAmount)))
                .values()
                .stream()
                .map(Double::doubleValue)
                .collect(Collectors.toList());

        double mean = monthlyIncomes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = monthlyIncomes.stream()
                .mapToDouble(inc -> Math.pow(inc - mean, 2))
                .average()
                .orElse(0.0);

        return variance > 0 ? Math.sqrt(variance) / mean : 0.0;
    }

    private double calculateExpenseVolatility(List<Transaction> expenses) {
        if (expenses.size() < 2)
            return 0.0;

        List<Double> monthlyExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(Transaction::getAmount)))
                .values()
                .stream()
                .map(Double::doubleValue)
                .collect(Collectors.toList());

        double mean = monthlyExpenses.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = monthlyExpenses.stream()
                .mapToDouble(expense -> Math.pow(expense - mean, 2))
                .average()
                .orElse(0.0);

        return mean > 0 ? Math.sqrt(variance) / mean : 0.0;
    }

    private FinancialMetrics createEmptyMetrics() {
        return FinancialMetrics.builder()
                .avgMonthlyIncome(0.0)
                .avgMonthlyExpenses(0.0)
                .savingsRate(0.0)
                .incomeStability(1.0)
                .expenseVolatility(0.0)
                .categorySpending(new HashMap<>())
                .totalTransactions(0)
                .dataPoints(0)
                .build();
    }

    /**
     * Create scenario request for ML service with real financial data
     */
    private ScenarioRequest createScenarioRequest(RealTimeScenarioRequest request, FinancialMetrics metrics) {
        return ScenarioRequest.builder()
                .currentBalance(request.getCurrentBalance())
                .monthlyIncome(metrics.getAvgMonthlyIncome())
                .targetSavings(request.getTargetSavings())
                .months(request.getMonths())
                .build();
    }

    /**
     * Create real-time scenario response with insights
     */
    private RealTimeScenarioResponse createRealTimeResponse(
            RealTimeScenarioRequest request,
            FinancialMetrics metrics,
            ScenarioResponse mlResponse,
            List<Transaction> transactions) {

        // Generate insights based on real data
        List<String> insights = generateInsights(metrics, request, mlResponse);

        // Calculate scenario confidence based on data quality
        double confidence = calculateConfidence(metrics);

        // Generate recommendations
        List<String> recommendations = generateRecommendations(metrics, request);

        return RealTimeScenarioResponse.builder()
                .scenarioId(generateScenarioId())
                .userId(request.getUserId())
                .scenarioType(request.getScenarioType())
                .futureBalance(mlResponse.getFutureBalance())
                .riskLevel(mlResponse.getRiskLevel())
                .totalSavings(mlResponse.getTotalSavings())
                .riskAdjustedSavings(mlResponse.getRiskAdjustedSavings())
                .status(mlResponse.getStatus())
                .predictedOutcome(mlResponse.getPredictedOutcome())
                .forecastTrend(mlResponse.getForecastTrend())
                .insights(insights)
                .recommendations(recommendations)
                .confidence(confidence)
                .dataPoints(metrics.getDataPoints())
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    private List<String> generateInsights(FinancialMetrics metrics, RealTimeScenarioRequest request,
            ScenarioResponse mlResponse) {
        List<String> insights = new ArrayList<>();

        if (metrics.getDataPoints() < 30) {
            insights.add("Limited transaction data available. Consider adding more transactions for better accuracy.");
        } else {
            insights.add("Analysis based on " + metrics.getDataPoints() + " transactions over the past 12 months.");
        }

        if (metrics.getSavingsRate() < 0.1) {
            insights.add("Your current savings rate is low (" + String.format("%.1f", metrics.getSavingsRate() * 100)
                    + "%). Consider reducing expenses.");
        } else if (metrics.getSavingsRate() > 0.3) {
            insights.add("Excellent savings rate (" + String.format("%.1f", metrics.getSavingsRate() * 100)
                    + "%)! You're on track for financial success.");
        }

        if (metrics.getExpenseVolatility() > 0.5) {
            insights.add("High expense volatility detected. Your spending patterns are inconsistent.");
        }

        if (metrics.getIncomeStability() > 0.3) {
            insights.add("Income variability detected. Consider building an emergency fund.");
        }

        return insights;
    }

    private double calculateConfidence(FinancialMetrics metrics) {
        double dataQualityScore = Math.min(metrics.getDataPoints() / 100.0, 1.0);
        double stabilityScore = 1.0 - Math.min(metrics.getIncomeStability(), 1.0);
        double consistencyScore = 1.0 - Math.min(metrics.getExpenseVolatility(), 1.0);

        return (dataQualityScore + stabilityScore + consistencyScore) / 3.0;
    }

    private List<String> generateRecommendations(FinancialMetrics metrics, RealTimeScenarioRequest request) {
        List<String> recommendations = new ArrayList<>();

        if (metrics.getSavingsRate() < 0.1) {
            recommendations.add("Increase your savings rate by reducing discretionary spending or increasing income.");
        }

        if (metrics.getExpenseVolatility() > 0.5) {
            recommendations
                    .add("Create a detailed budget to reduce expense volatility and improve financial predictability.");
        }

        if (metrics.getIncomeStability() > 0.3) {
            recommendations.add("Build an emergency fund to protect against income variability.");
        }

        recommendations.add("Consider automating your savings to maintain consistent progress toward your goals.");

        return recommendations;
    }

    private String generateScenarioId() {
        return "SCN_" + System.currentTimeMillis();
    }
}
