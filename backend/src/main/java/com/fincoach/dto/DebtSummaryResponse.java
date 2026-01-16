package com.fincoach.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for aggregated debt summary statistics
 */
public class DebtSummaryResponse {
    
    private BigDecimal totalDebt;
    private BigDecimal totalOriginalDebt;
    private BigDecimal totalMinPayment;
    private BigDecimal totalMonthlyInterest;
    private BigDecimal averageInterestRate;
    private BigDecimal highestInterestRate;
    private BigDecimal lowestInterestRate;
    private Integer estimatedPayoffMonths;
    private Integer totalDebts;
    private Integer activeDebts;
    private Integer paidOffDebts;
    private BigDecimal totalInterestPaid;
    private BigDecimal totalPrincipalPaid;
    private BigDecimal progressPercentage;
    
    // Strategy-specific fields
    private String recommendedStrategy;
    private StrategyComparison strategyComparison;
    
    // Payoff plans for each debt
    private List<PayoffPlanResponse> payoffPlans;
    
    // Milestones
    private MilestoneInfo nextMilestone;
    private List<MilestoneInfo> milestones;
    
    // Constructors
    public DebtSummaryResponse() {
    }
    
    // Nested class for strategy comparison
    public static class StrategyComparison {
        private SnowballInfo snowball;
        private AvalancheInfo avalanche;
        private SavingsInfo savings;
        
        public SnowballInfo getSnowball() {
            return snowball;
        }
        
        public void setSnowball(SnowballInfo snowball) {
            this.snowball = snowball;
        }
        
        public AvalancheInfo getAvalanche() {
            return avalanche;
        }
        
        public void setAvalanche(AvalancheInfo avalanche) {
            this.avalanche = avalanche;
        }
        
        public SavingsInfo getSavings() {
            return savings;
        }
        
        public void setSavings(SavingsInfo savings) {
            this.savings = savings;
        }
    }
    
    public static class SnowballInfo {
        private Integer payoffMonths;
        private BigDecimal totalInterest;
        private BigDecimal monthlyPayment;
        
        public Integer getPayoffMonths() {
            return payoffMonths;
        }
        
        public void setPayoffMonths(Integer payoffMonths) {
            this.payoffMonths = payoffMonths;
        }
        
        public BigDecimal getTotalInterest() {
            return totalInterest;
        }
        
        public void setTotalInterest(BigDecimal totalInterest) {
            this.totalInterest = totalInterest;
        }
        
        public BigDecimal getMonthlyPayment() {
            return monthlyPayment;
        }
        
        public void setMonthlyPayment(BigDecimal monthlyPayment) {
            this.monthlyPayment = monthlyPayment;
        }
    }
    
    public static class AvalancheInfo {
        private Integer payoffMonths;
        private BigDecimal totalInterest;
        private BigDecimal monthlyPayment;
        
        public Integer getPayoffMonths() {
            return payoffMonths;
        }
        
        public void setPayoffMonths(Integer payoffMonths) {
            this.payoffMonths = payoffMonths;
        }
        
        public BigDecimal getTotalInterest() {
            return totalInterest;
        }
        
        public void setTotalInterest(BigDecimal totalInterest) {
            this.totalInterest = totalInterest;
        }
        
        public BigDecimal getMonthlyPayment() {
            return monthlyPayment;
        }
        
        public void setMonthlyPayment(BigDecimal monthlyPayment) {
            this.monthlyPayment = monthlyPayment;
        }
    }
    
    public static class SavingsInfo {
        private BigDecimal interestSaved;
        private Integer timeSavedMonths;
        private String recommendation;
        
        public BigDecimal getInterestSaved() {
            return interestSaved;
        }
        
        public void setInterestSaved(BigDecimal interestSaved) {
            this.interestSaved = interestSaved;
        }
        
        public Integer getTimeSavedMonths() {
            return timeSavedMonths;
        }
        
        public void setTimeSavedMonths(Integer timeSavedMonths) {
            this.timeSavedMonths = timeSavedMonths;
        }
        
        public String getRecommendation() {
            return recommendation;
        }
        
        public void setRecommendation(String recommendation) {
            this.recommendation = recommendation;
        }
    }
    
    // Getters and Setters
    public BigDecimal getTotalDebt() {
        return totalDebt;
    }
    
    public void setTotalDebt(BigDecimal totalDebt) {
        this.totalDebt = totalDebt;
    }
    
    public BigDecimal getTotalOriginalDebt() {
        return totalOriginalDebt;
    }
    
    public void setTotalOriginalDebt(BigDecimal totalOriginalDebt) {
        this.totalOriginalDebt = totalOriginalDebt;
    }
    
    public BigDecimal getTotalMinPayment() {
        return totalMinPayment;
    }
    
    public void setTotalMinPayment(BigDecimal totalMinPayment) {
        this.totalMinPayment = totalMinPayment;
    }
    
    public BigDecimal getTotalMonthlyInterest() {
        return totalMonthlyInterest;
    }
    
    public void setTotalMonthlyInterest(BigDecimal totalMonthlyInterest) {
        this.totalMonthlyInterest = totalMonthlyInterest;
    }
    
    public BigDecimal getAverageInterestRate() {
        return averageInterestRate;
    }
    
    public void setAverageInterestRate(BigDecimal averageInterestRate) {
        this.averageInterestRate = averageInterestRate;
    }
    
    public BigDecimal getHighestInterestRate() {
        return highestInterestRate;
    }
    
    public void setHighestInterestRate(BigDecimal highestInterestRate) {
        this.highestInterestRate = highestInterestRate;
    }
    
    public BigDecimal getLowestInterestRate() {
        return lowestInterestRate;
    }
    
    public void setLowestInterestRate(BigDecimal lowestInterestRate) {
        this.lowestInterestRate = lowestInterestRate;
    }
    
    public Integer getEstimatedPayoffMonths() {
        return estimatedPayoffMonths;
    }
    
    public void setEstimatedPayoffMonths(Integer estimatedPayoffMonths) {
        this.estimatedPayoffMonths = estimatedPayoffMonths;
    }
    
    public Integer getTotalDebts() {
        return totalDebts;
    }
    
    public void setTotalDebts(Integer totalDebts) {
        this.totalDebts = totalDebts;
    }
    
    public Integer getActiveDebts() {
        return activeDebts;
    }
    
    public void setActiveDebts(Integer activeDebts) {
        this.activeDebts = activeDebts;
    }
    
    public Integer getPaidOffDebts() {
        return paidOffDebts;
    }
    
    public void setPaidOffDebts(Integer paidOffDebts) {
        this.paidOffDebts = paidOffDebts;
    }
    
    public BigDecimal getTotalInterestPaid() {
        return totalInterestPaid;
    }
    
    public void setTotalInterestPaid(BigDecimal totalInterestPaid) {
        this.totalInterestPaid = totalInterestPaid;
    }
    
    public BigDecimal getTotalPrincipalPaid() {
        return totalPrincipalPaid;
    }
    
    public void setTotalPrincipalPaid(BigDecimal totalPrincipalPaid) {
        this.totalPrincipalPaid = totalPrincipalPaid;
    }
    
    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(BigDecimal progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public String getRecommendedStrategy() {
        return recommendedStrategy;
    }
    
    public void setRecommendedStrategy(String recommendedStrategy) {
        this.recommendedStrategy = recommendedStrategy;
    }
    
    public StrategyComparison getStrategyComparison() {
        return strategyComparison;
    }
    
    public void setStrategyComparison(StrategyComparison strategyComparison) {
        this.strategyComparison = strategyComparison;
    }
    
    public List<PayoffPlanResponse> getPayoffPlans() {
        return payoffPlans;
    }
    
    public void setPayoffPlans(List<PayoffPlanResponse> payoffPlans) {
        this.payoffPlans = payoffPlans;
    }
    
    public MilestoneInfo getNextMilestone() {
        return nextMilestone;
    }
    
    public void setNextMilestone(MilestoneInfo nextMilestone) {
        this.nextMilestone = nextMilestone;
    }
    
    public List<MilestoneInfo> getMilestones() {
        return milestones;
    }
    
    public void setMilestones(List<MilestoneInfo> milestones) {
        this.milestones = milestones;
    }
}

