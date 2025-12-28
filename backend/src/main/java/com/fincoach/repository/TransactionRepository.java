package com.fincoach.repository;

import com.fincoach.entity.Transaction;
import com.fincoach.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserAndDate(User user, LocalDate date);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserAndMonth(@Param("user") User user, @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
