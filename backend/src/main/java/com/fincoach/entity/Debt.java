package com.fincoach.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Debt Entity - Represents a user's debt
 */
@Entity
@Table(name = "debts")
public class Debt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal balance;
    
    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;
    
    @Column(name = "min_payment", nullable = false, precision = 10, scale = 2)
    private BigDecimal minPayment;
    
    @Column(name = "type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DebtType type;
    
    @Column(name = "original_balance", precision = 15, scale = 2)
    private BigDecimal originalBalance;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "due_day")
    private Integer dueDay;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum DebtType {
        CREDIT("Credit Card"),
        LOAN("Personal Loan"),
        STUDENT("Student Loan"),
        MORTGAGE("Mortgage"),
        AUTO("Auto Loan"),
        MEDICAL("Medical Debt"),
        OTHER("Other");
        
        private final String displayName;
        
        DebtType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Constructors
    public Debt() {
    }
    
    public Debt(Long userId, String name, BigDecimal balance, BigDecimal interestRate, 
                BigDecimal minPayment, DebtType type) {
        this.userId = userId;
        this.name = name;
        this.balance = balance;
        this.interestRate = interestRate;
        this.minPayment = minPayment;
        this.type = type;
        this.originalBalance = balance;
        this.isActive = true;
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public DebtType getType() {
        return type;
    }
    
    public void setType(DebtType type) {
        this.type = type;
    }
    
    public BigDecimal getOriginalBalance() {
        return originalBalance;
    }
    
    public void setOriginalBalance(BigDecimal originalBalance) {
        this.originalBalance = originalBalance;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
    
    // Helper methods
    public BigDecimal getMonthlyInterest() {
        if (balance == null || interestRate == null) {
            return BigDecimal.ZERO;
        }
        return balance.multiply(interestRate)
                      .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP)
                      .divide(BigDecimal.valueOf(12), 2, java.math.RoundingMode.HALF_UP);
    }
    
    public BigDecimal getProgressPercentage() {
        if (originalBalance == null || originalBalance.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal paid = originalBalance.subtract(balance);
        return paid.multiply(BigDecimal.valueOf(100))
                   .divide(originalBalance, 2, java.math.RoundingMode.HALF_UP);
    }
    
    public boolean isPaidOff() {
        return balance != null && balance.compareTo(BigDecimal.ONE) <= 0;
    }
}

