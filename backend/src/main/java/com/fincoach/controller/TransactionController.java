package com.fincoach.controller;

import com.fincoach.dto.Dtos.*;
import com.fincoach.entity.Transaction;
import com.fincoach.security.JwtUtils;
import com.fincoach.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    TransactionService transactionService;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/add")
    public ResponseEntity<?> addTransaction(@RequestBody TransactionRequest request,
            @RequestHeader("Authorization") String token) {
        String email = parseEmail(token);
        Transaction transaction = transactionService.addTransaction(request, email);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/today")
    public ResponseEntity<?> getDailySummary(@RequestHeader("Authorization") String token) {
        String email = parseEmail(token);
        DailySpendResponse response = transactionService.getDailySpendSummary(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyTransactions(@RequestParam(required = false) LocalDate date,
            @RequestHeader("Authorization") String token) {
        String email = parseEmail(token);
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<Transaction> transactions = transactionService.getTransactionsByMonth(targetDate, email);
        return ResponseEntity.ok(transactions);
    }

    private String parseEmail(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtils.getUserNameFromJwtToken(token);
    }
}
