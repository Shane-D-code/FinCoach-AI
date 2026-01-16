package com.fincoach.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * DTO for creating or updating a debt
 */
public class DebtRequest {
    
    @NotBlank(message = "Debt name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;
    
    @NotNull(message = "Balance is required")
    @DecimalMin(value = "0.01", message = "Balance must be greater than 0")
    private BigDecimal balance;
    
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0", message = "Interest rate cannot be negative")
    @DecimalMax(value = "100", message = "Interest rate cannot exceed 100%")
    private BigDecimal interestRate;
    
    @NotNull(message = "Minimum payment is required")
    @DecimalMin(value = "0.01", message = "Minimum payment must be greater than 0")
    private BigDecimal minPayment;
    
    @NotNull(message = "Debt type is required")
    private String type;
    
    private String notes;
    
    private Integer dueDay;
    
    private BigDecimal originalBalance;
    
    // Constructors
    public DebtRequest() {
    }
    
    public DebtRequest(String name, BigDecimal balance, BigDecimal interestRate, 
                       BigDecimal minPayment, String type) {
        this.name = name;
        this.balance = balance;
        this.interestRate = interestRate;
        this.minPayment = minPayment;
        this.type = type;
    }
    
    // Getters and Setters
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
    
    public BigDecimal getOriginalBalance() {
        return originalBalance;
    }
    
    public void setOriginalBalance(BigDecimal originalBalance) {
        this.originalBalance = originalBalance;
    }
    
    // Validation helper
    public boolean isValidType() {
        if (type == null) return false;
        return type.equalsIgnoreCase("credit") || 
               type.equalsIgnoreCase("loan") || 
               type.equalsIgnoreCase("student") ||
               type.equalsIgnoreCase("mortgage") ||
               type.equalsIgnoreCase("auto") ||
               type.equalsIgnoreCase("medical") ||
               type.equalsIgnoreCase("other");
    }
}

