package com.fincoach.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * DTO for processing debt payments
 */
public class DebtPaymentRequest {
    
    @NotNull(message = "Debt ID is required")
    private Long debtId;
    
    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0")
    private BigDecimal amount;
    
    private String paymentMethod;
    
    private String notes;
    
    private Boolean isAutomatic = false;
    
    // Constructors
    public DebtPaymentRequest() {
    }
    
    public DebtPaymentRequest(Long debtId, BigDecimal amount) {
        this.debtId = debtId;
        this.amount = amount;
    }
    
    // Getters and Setters
    public Long getDebtId() {
        return debtId;
    }
    
    public void setDebtId(Long debtId) {
        this.debtId = debtId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Boolean getIsAutomatic() {
        return isAutomatic;
    }
    
    public void setIsAutomatic(Boolean isAutomatic) {
        this.isAutomatic = isAutomatic;
    }
}

