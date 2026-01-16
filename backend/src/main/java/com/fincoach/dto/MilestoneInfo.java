package com.fincoach.dto;

import java.math.BigDecimal;

/**
 * DTO for milestone tracking
 */
public class MilestoneInfo {
    
    private String id;
    private String name;
    private String description;
    private MilestoneType type;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private BigDecimal percentage;
    private Boolean isCompleted;
    private String completedDate;
    private String estimatedCompletionDate;
    private Integer daysRemaining;
    
    public enum MilestoneType {
        FIRST_PAYMENT("First Payment Made"),
        DEBT_HALFPAID("50% of Debt Paid Off"),
        DEBT_PAIDOFF("Debt Completely Paid Off"),
        ALL_DEBTS_PAID("All Debts Paid Off"),
        INTEREST_MILESTONE("Interest Saved"),
        STREAK_MILESTONE("Payment Streak"),
        CUSTOM("Custom Milestone");
        
        private final String displayName;
        
        MilestoneType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Constructors
    public MilestoneInfo() {
    }
    
    public MilestoneInfo(String name, MilestoneType type, BigDecimal targetValue, BigDecimal currentValue) {
        this.name = name;
        this.type = type;
        this.targetValue = targetValue;
        this.currentValue = currentValue;
        this.calculatePercentage();
    }
    
    private void calculatePercentage() {
        if (targetValue != null && targetValue.compareTo(BigDecimal.ZERO) > 0) {
            this.percentage = currentValue
                .multiply(BigDecimal.valueOf(100))
                .divide(targetValue, 2, java.math.RoundingMode.HALF_UP);
            this.isCompleted = percentage.compareTo(BigDecimal.valueOf(100)) >= 0;
        } else {
            this.percentage = BigDecimal.ZERO;
            this.isCompleted = false;
        }
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public MilestoneType getType() {
        return type;
    }
    
    public void setType(MilestoneType type) {
        this.type = type;
    }
    
    public BigDecimal getTargetValue() {
        return targetValue;
    }
    
    public void setTargetValue(BigDecimal targetValue) {
        this.targetValue = targetValue;
    }
    
    public BigDecimal getCurrentValue() {
        return currentValue;
    }
    
    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
        calculatePercentage();
    }
    
    public BigDecimal getPercentage() {
        return percentage;
    }
    
    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public String getCompletedDate() {
        return completedDate;
    }
    
    public void setCompletedDate(String completedDate) {
        this.completedDate = completedDate;
    }
    
    public String getEstimatedCompletionDate() {
        return estimatedCompletionDate;
    }
    
    public void setEstimatedCompletionDate(String estimatedCompletionDate) {
        this.estimatedCompletionDate = estimatedCompletionDate;
    }
    
    public Integer getDaysRemaining() {
        return daysRemaining;
    }
    
    public void setDaysRemaining(Integer daysRemaining) {
        this.daysRemaining = daysRemaining;
    }
}

