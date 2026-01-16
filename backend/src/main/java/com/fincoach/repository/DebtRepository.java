package com.fincoach.repository;

import com.fincoach.entity.Debt;
import com.fincoach.entity.Debt.DebtType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository for Debt entity operations
 */
@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    
    /**
     * Find all debts for a specific user
     */
    List<Debt> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find all debts (including inactive) for a user
     */
    List<Debt> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find debts by user and type
     */
    List<Debt> findByUserIdAndTypeAndIsActiveTrue(Long userId, DebtType type);
    
    /**
     * Find active debt by ID and user ID
     */
    @Query("SELECT d FROM Debt d WHERE d.id = :id AND d.userId = :userId AND d.isActive = true")
    Debt findActiveDebtByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    
    /**
     * Get total debt balance for user
     */
    @Query("SELECT COALESCE(SUM(d.balance), 0) FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    BigDecimal getTotalDebtByUserId(@Param("userId") Long userId);
    
    /**
     * Get total minimum payments for user
     */
    @Query("SELECT COALESCE(SUM(d.minPayment), 0) FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    BigDecimal getTotalMinPaymentByUserId(@Param("userId") Long userId);
    
    /**
     * Get highest interest rate for user
     */
    @Query("SELECT COALESCE(MAX(d.interestRate), 0) FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    BigDecimal getHighestInterestRateByUserId(@Param("userId") Long userId);
    
    /**
     * Get average interest rate for user
     */
    @Query("SELECT COALESCE(AVG(d.interestRate), 0) FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    BigDecimal getAverageInterestRateByUserId(@Param("userId") Long userId);
    
    /**
     * Get count of active debts for user
     */
    @Query("SELECT COUNT(d) FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    Integer getActiveDebtCountByUserId(@Param("userId") Long userId);
    
    /**
     * Find debts sorted by interest rate (for Avalanche method)
     */
    @Query("SELECT d FROM Debt d WHERE d.userId = :userId AND d.isActive = true ORDER BY d.interestRate DESC")
    List<Debt> findDebtsForAvalancheByUserId(@Param("userId") Long userId);
    
    /**
     * Find debts sorted by balance (for Snowball method)
     */
    @Query("SELECT d FROM Debt d WHERE d.userId = :userId AND d.isActive = true ORDER BY d.balance ASC")
    List<Debt> findDebtsForSnowballByUserId(@Param("userId") Long userId);
    
    /**
     * Check if user has any active debts
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    boolean hasActiveDebtsByUserId(@Param("userId") Long userId);
    
    /**
     * Get debt by name for user (for duplicate checking)
     */
    @Query("SELECT d FROM Debt d WHERE d.userId = :userId AND LOWER(d.name) = LOWER(:name) AND d.isActive = true")
    List<Debt> findByUserIdAndNameIgnoreCase(@Param("userId") Long userId, @Param("name") String name);
    
    /**
     * Calculate total original debt for user
     */
    @Query("SELECT COALESCE(SUM(d.originalBalance), 0) FROM Debt d WHERE d.userId = :userId AND d.isActive = true")
    BigDecimal getTotalOriginalDebtByUserId(@Param("userId") Long userId);
}

