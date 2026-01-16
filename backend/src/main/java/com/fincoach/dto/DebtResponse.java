package com.fincoach.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for debt response data sent to frontend
 */
public class DebtResponse {
    
    private Long id;
    private String name;
    private BigDecimal balance;
    private BigDecimal interestRate;
    private BigDecimal minPayment;
    private String type;
    private String typeDisplayName;
    private BigDecimal originalBalance;
    private BigDecimal progressPercentage;
    private Boolean isActive;
    private Boolean isPaidOff;
    private String notes;
    private Integer dueDay;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Payoff calculation fields (computed on demand)
    private Integer monthsToPayoff;
    private BigDecimal recommendedPayment;
    private BigDecimal totalInterest;
    private BigDecimal monthlyInterest;
    
    // Constructors
    public DebtResponse() {
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
    
    public BigDecimal getInterestRate() {
        return interestRate;
    }
    
    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }
    
    public BigDecimal getMinPayment() {
        return minPayment;
    }
    
    public void setMinPayment(BigDecimal minPayment) {
        this.minPayment = minPayment;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTypeDisplayName() {
        return typeDisplayName;
    }
    
    public void setTypeDisplayName(String typeDisplayName) {
        this.typeDisplayName = typeDisplayName;
    }
    
    public BigDecimal getOriginalBalance() {
        return originalBalance;
    }
    
    public void setOriginalBalance(BigDecimal originalBalance) {
        this.originalBalance = originalBalance;
    }
    
    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(BigDecimal progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsPaidOff() {
        return isPaidOff;
    }
    
    public void setIsPaidOff(Boolean isPaidOff) {
        this.isPaidOff = isPaidOff;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Integer getDueDay() {
        return dueDay;
    }
    
    public void setDueDay(Integer dueDay) {
        this.dueDay = dueDay;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Integer getMonthsToPayoff() {
        return monthsToPayoff;
    }
    
    public void setMonthsToPayoff(Integer monthsToPayoff) {
        this.monthsToPayoff = monthsToPayoff;
    }
    
    public BigDecimal getRecommendedPayment() {
        return recommendedPayment;
    }
    
    public void setRecommendedPayment(BigDecimal recommendedPayment) {
        this.recommendedPayment = recommendedPayment;
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
}

