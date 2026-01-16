package com.fincoach.repository;

import com.fincoach.entity.DebtPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for DebtPayment entity operations
 */
@Repository
public interface DebtPaymentRepository extends JpaRepository<DebtPayment, Long> {
    
    /**
     * Find all payments for a specific debt
     */
    List<DebtPayment> findByDebtIdOrderByPaymentDateDesc(Long debtId);
    
    /**
     * Find all payments for a user
     */
    List<DebtPayment> findByUserIdOrderByPaymentDateDesc(Long userId);
    
    /**
     * Find payments for a debt within a date range
     */
    @Query("SELECT p FROM DebtPayment p WHERE p.debtId = :debtId " +
           "AND p.paymentDate BETWEEN :startDate AND :endDate " +
           "ORDER BY p.paymentDate DESC")
    List<DebtPayment> findByDebtIdAndDateRange(
            @Param("debtId") Long debtId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find payments for a user within a date range
     */
    @Query("SELECT p FROM DebtPayment p WHERE p.userId = :userId " +
           "AND p.paymentDate BETWEEN :startDate AND :endDate " +
           "ORDER BY p.paymentDate DESC")
    List<DebtPayment> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get total payments for a debt
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM DebtPayment p WHERE p.debtId = :debtId")
    BigDecimal getTotalPaymentsByDebtId(@Param("debtId") Long debtId);
    
    /**
     * Get total interest paid for a debt
     */
    @Query("SELECT COALESCE(SUM(p.interestPaid), 0) FROM DebtPayment p WHERE p.debtId = :debtId")
    BigDecimal getTotalInterestPaidByDebtId(@Param("debtId") Long debtId);
    
    /**
     * Get total principal paid for a debt
     */
    @Query("SELECT COALESCE(SUM(p.principalPaid), 0) FROM DebtPayment p WHERE p.debtId = :debtId")
    BigDecimal getTotalPrincipalPaidByDebtId(@Param("debtId") Long debtId);
    
    /**
     * Get total principal paid by user
     */
    @Query("SELECT COALESCE(SUM(p.principalPaid), 0) FROM DebtPayment p WHERE p.userId = :userId")
    BigDecimal getTotalPrincipalPaidByUserId(@Param("userId") Long userId);
    
    /**
     * Get total payments for a user
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM DebtPayment p WHERE p.userId = :userId")
    BigDecimal getTotalPaymentsByUserId(@Param("userId") Long userId);
    
    /**
     * Get total interest paid by user
     */
    @Query("SELECT COALESCE(SUM(p.interestPaid), 0) FROM DebtPayment p WHERE p.userId = :userId")
    BigDecimal getTotalInterestPaidByUserId(@Param("userId") Long userId);
    
    /**
     * Get count of payments for a debt
     */
    @Query("SELECT COUNT(p) FROM DebtPayment p WHERE p.debtId = :debtId")
    Integer getPaymentCountByDebtId(@Param("debtId") Long debtId);
    
    /**
     * Get most recent payment for a debt
     */
    @Query("SELECT p FROM DebtPayment p WHERE p.debtId = :debtId ORDER BY p.paymentDate DESC LIMIT 1")
    DebtPayment getMostRecentPaymentByDebtId(@Param("debtId") Long debtId);
    
    /**
     * Get payments by debt and user
     */
    @Query("SELECT p FROM DebtPayment p WHERE p.debtId = :debtId AND p.userId = :userId ORDER BY p.paymentDate DESC")
    List<DebtPayment> findByDebtIdAndUserId(
            @Param("debtId") Long debtId,
            @Param("userId") Long userId);
    
    /**
     * Get payment count by user
     */
    @Query("SELECT COUNT(p) FROM DebtPayment p WHERE p.userId = :userId")
    Integer getPaymentCountByUserId(@Param("userId") Long userId);
    
    /**
     * Get payments this month for user
     */
    @Query("SELECT p FROM DebtPayment p WHERE p.userId = :userId " +
           "AND p.paymentDate >= :monthStart ORDER BY p.paymentDate DESC")
    List<DebtPayment> findThisMonthPaymentsByUserId(
            @Param("userId") Long userId,
            @Param("monthStart") LocalDateTime monthStart);
}

