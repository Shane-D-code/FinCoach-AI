package com.fincoach.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for debt payment response
 */
public class DebtPaymentResponse {
    
    private Long id;
    private Long debtId;
    private String debtName;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private BigDecimal interestPaid;
    private BigDecimal principalPaid;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private String notes;
    private Boolean isAutomatic;
    
    // Constructors
    public DebtPaymentResponse() {
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public BigDecimal getBalanceBefore() {
        return balanceBefore;
    }
    
    public void setBalanceBefore(BigDecimal balanceBefore) {
        this.balanceBefore = balanceBefore;
    }
    
    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }
    
    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
    
    public BigDecimal getInterestPaid() {
        return interestPaid;
    }
    
    public void setInterestPaid(BigDecimal interestPaid) {
        this.interestPaid = interestPaid;
    }
    
    public BigDecimal getPrincipalPaid() {
        return principalPaid;
    }
    
    public void setPrincipalPaid(BigDecimal principalPaid) {
        this.principalPaid = principalPaid;
    }
    
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
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

