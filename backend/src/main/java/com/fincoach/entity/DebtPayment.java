package com.fincoach.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DebtPayment Entity - Tracks payment history for debts
 */
@Entity
@Table(name = "debt_payments")
public class DebtPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "debt_id", nullable = false)
    private Long debtId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "balance_before", precision = 15, scale = 2)
    private BigDecimal balanceBefore;
    
    @Column(name = "balance_after", precision = 15, scale = 2)
    private BigDecimal balanceAfter;
    
    @Column(name = "interest_paid", precision = 10, scale = 2)
    private BigDecimal interestPaid;
    
    @Column(name = "principal_paid", precision = 10, scale = 2)
    private BigDecimal principalPaid;
    
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "is_automatic", nullable = false)
    private Boolean isAutomatic = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public DebtPayment() {
    }
    
    public DebtPayment(Long debtId, Long userId, BigDecimal amount, BigDecimal balanceBefore, 
                       BigDecimal balanceAfter) {
        this.debtId = debtId;
        this.userId = userId;
        this.amount = amount;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.paymentDate = LocalDateTime.now();
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
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
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // Helper methods
    public BigDecimal getPrincipalPortion() {
        if (balanceBefore == null || balanceAfter == null) {
            return amount;
        }
        return balanceBefore.subtract(balanceAfter);
    }
    
    public BigDecimal getInterestPortion() {
        if (amount == null || getPrincipalPortion() == null) {
            return BigDecimal.ZERO;
        }
        return amount.subtract(getPrincipalPortion());
    }
    
    public boolean hasDebtReduction() {
        return balanceAfter != null && balanceAfter.compareTo(balanceBefore) < 0;
    }
}

