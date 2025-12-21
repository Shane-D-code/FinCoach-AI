package com.fincoach.service;

import com.fincoach.dto.Dtos.*;
import com.fincoach.entity.Transaction;
import com.fincoach.entity.User;
import com.fincoach.repository.TransactionRepository;
import com.fincoach.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    UserRepository userRepository;

    public Transaction addTransaction(TransactionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .date(request.getDate())
                .category(request.getCategory())
                .amount(request.getAmount())
                .type(Transaction.TransactionType.valueOf(request.getType()))
                .source(Transaction.TransactionSource.valueOf(request.getSource()))
                .createdAt(LocalDateTime.now())
                .build();

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByDate(LocalDate date, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByUserAndDate(user, date);
    }

    public List<Transaction> getTransactionsByMonth(LocalDate outputDateInMonth, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate startDate = outputDateInMonth.withDayOfMonth(1);
        LocalDate endDate = outputDateInMonth.withDayOfMonth(outputDateInMonth.lengthOfMonth());
        return transactionRepository.findByUserAndMonth(user, startDate, endDate);
    }

    public DailySpendResponse getDailySpendSummary(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> todayTransactions = transactionRepository.findByUserAndDate(user, LocalDate.now());

        Double totalSpent = todayTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        Map<String, Double> categoryBreakdown = new HashMap<>();
        for (Transaction t : todayTransactions) {
            if (t.getType() == Transaction.TransactionType.EXPENSE) {
                categoryBreakdown.put(t.getCategory(),
                        categoryBreakdown.getOrDefault(t.getCategory(), 0.0) + t.getAmount());
            }
        }

        // Mock limit check - hardcoded generic limit for now as no per-user daily limit
        // in requirements
        boolean limitExceeded = totalSpent > 1000.0;

        return DailySpendResponse.builder()
                .totalSpent(totalSpent)
                .categoryBreakdown(categoryBreakdown)
                .limitExceeded(limitExceeded)
                .build();
    }
}
