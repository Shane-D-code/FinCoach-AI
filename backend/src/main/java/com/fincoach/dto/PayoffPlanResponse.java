package com.fincoach.dto;

import java.math.BigDecimal;

/**
 * DTO for payoff plan response
 */
public class PayoffPlanResponse {
    
    private Long debtId;
    private String debtName;
    private String debtType;
    private BigDecimal currentBalance;
    private BigDecimal minPayment;
    private BigDecimal recommendedPayment;
    private BigDecimal extraPayment;
    private BigDecimal totalPayment;
    private Integer monthsToPayoff;
    private BigDecimal totalInterest;
    private BigDecimal monthlyInterest;
    private Integer priority;
    private Boolean isPriority;
    private BigDecimal progressPercentage;
    
    // Constructors
    public PayoffPlanResponse() {
    }
    
    // Getters and Setters
    public Long getDebtId() {
        return debtId;
    }
    
    public void setDebtId(Long debtId) {
        this.debtId = debtId;
    }
    
    public String getDebtName() {
        return debtName;
    }
    
    public void setDebtName(String debtName) {
        this.debtName = debtName;
    }
    
    public String getDebtType() {
        return debtType;
    }
    
    public void setDebtType(String debtType) {
        this.debtType = debtType;
    }
    
    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }
    
    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }
    
    public BigDecimal getMinPayment() {
        return minPayment;
    }
    
    public void setMinPayment(BigDecimal minPayment) {
        this.minPayment = minPayment;
    }
    
    public BigDecimal getRecommendedPayment() {
        return recommendedPayment;
    }
    
    public void setRecommendedPayment(BigDecimal recommendedPayment) {
        this.recommendedPayment = recommendedPayment;
    }
    
    public BigDecimal getExtraPayment() {
        return extraPayment;
    }
    
    public void setExtraPayment(BigDecimal extraPayment) {
        this.extraPayment = extraPayment;
    }
    
    public BigDecimal getTotalPayment() {
        return totalPayment;
    }
    
    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }
    
    public Integer getMonthsToPayoff() {
        return monthsToPayoff;
    }
    
    public void setMonthsToPayoff(Integer monthsToPayoff) {
        this.monthsToPayoff = monthsToPayoff;
    }
    
    public BigDecimal getTotalInterest() {
        return totalInterest;
    }
    
    public void setTotalInterest(BigDecimal totalInterest) {
        this.totalInterest = totalInterest;
    }
    
    public BigDecimal getMonthlyInterest() {
        return monthlyInterest;
    }
    
    public void setMonthlyInterest(BigDecimal monthlyInterest) {
        this.monthlyInterest = monthlyInterest;
    }
    
    public Integer getPriority() {
        return priority;
    }
    
    public void setPriority(Integer priority) {
        this.priority = priority;
    }
    
    public Boolean getIsPriority() {
        return isPriority;
    }
    
    public void setIsPriority(Boolean isPriority) {
        this.isPriority = isPriority;
    }
    
    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(BigDecimal progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}

