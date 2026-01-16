package com.fincoach.controller;

import com.fincoach.dto.*;
import com.fincoach.dto.DebtSummaryResponse.StrategyComparison;
import com.fincoach.service.DebtService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Debt Management operations
 */
@RestController
@RequestMapping("/api/debts")
@CrossOrigin(origins = "*")
public class DebtController {
    
    private static final Logger logger = LoggerFactory.getLogger(DebtController.class);
    
    private final DebtService debtService;
    
    // In a real app, get user ID from JWT token
    private Long getCurrentUserId() {
        // TODO: Replace with actual user authentication
        return 1L;
    }
    
    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }
    
    // ==================== CRUD Endpoints ====================
    
    /**
     * Create a new debt
     * POST /api/debts
     */
    @PostMapping
    public ResponseEntity<?> createDebt(@Valid @RequestBody DebtRequest request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Creating debt for user {}: {}", userId, request.getName());
            
            DebtResponse response = debtService.createDebt(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Debt created successfully", response));
            
        } catch (Exception e) {
            logger.error("Error creating debt", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get all debts for current user
     * GET /api/debts
     */
    @GetMapping
    public ResponseEntity<?> getDebts() {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Fetching debts for user {}", userId);
            
            List<DebtResponse> debts = debtService.getUserDebts(userId);
            return ResponseEntity.ok(ApiResponse.success("Debts fetched successfully", debts));
            
        } catch (Exception e) {
            logger.error("Error fetching debts", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get a specific debt by ID
     * GET /api/debts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDebtById(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Fetching debt {} for user {}", id, userId);
            
            DebtResponse debt = debtService.getDebtById(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Debt fetched successfully", debt));
            
        } catch (RuntimeException e) {
            logger.warn("Debt not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching debt", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Update an existing debt
     * PUT /api/debts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDebt(
            @PathVariable Long id,
            @Valid @RequestBody DebtRequest request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Updating debt {} for user {}", id, userId);
            
            DebtResponse response = debtService.updateDebt(id, userId, request);
            return ResponseEntity.ok(ApiResponse.success("Debt updated successfully", response));
            
        } catch (RuntimeException e) {
            logger.warn("Debt not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating debt", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Delete a debt (soft delete)
     * DELETE /api/debts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDebt(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Deleting debt {} for user {}", id, userId);
            
            debtService.deleteDebt(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Debt deleted successfully", null));
            
        } catch (RuntimeException e) {
            logger.warn("Debt not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting debt", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ==================== Payment Endpoints ====================
    
    /**
     * Make a debt payment
     * POST /api/debts/{id}/payment
     */
    @PostMapping("/{id}/payment")
    public ResponseEntity<?> makePayment(
            @PathVariable Long id,
            @Valid @RequestBody DebtPaymentRequest request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Processing payment for debt {}: ₹{}", id, request.getAmount());
            
            // Ensure debt ID matches path
            request.setDebtId(id);
            
            DebtPaymentResponse response = debtService.makePayment(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
            
        } catch (RuntimeException e) {
            logger.warn("Payment failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error processing payment", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get payment history for a debt
     * GET /api/debts/{id}/payments
     */
    @GetMapping("/{id}/payments")
    public ResponseEntity<?> getPaymentHistory(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Fetching payment history for debt {}", id);
            
            List<DebtPaymentResponse> payments = debtService.getPaymentHistory(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Payment history fetched successfully", payments));
            
        } catch (RuntimeException e) {
            logger.warn("Debt not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching payment history", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get all payment history for current user
     * GET /api/debts/payments/all
     */
    @GetMapping("/payments/all")
    public ResponseEntity<?> getAllPaymentHistory() {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Fetching all payment history for user {}", userId);
            
            List<DebtPaymentResponse> payments = debtService.getUserPaymentHistory(userId);
            return ResponseEntity.ok(ApiResponse.success("All payments fetched successfully", payments));
            
        } catch (Exception e) {
            logger.error("Error fetching payment history", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ==================== Summary Endpoints ====================
    
    /**
     * Get debt summary for current user
     * GET /api/debts/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getDebtSummary(
            @RequestParam(required = false, defaultValue = "200") BigDecimal extraPayment) {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Calculating debt summary for user {}", userId);
            
            DebtSummaryResponse summary = debtService.getDebtSummary(userId, extraPayment);
            return ResponseEntity.ok(ApiResponse.success("Debt summary fetched successfully", summary));
            
        } catch (Exception e) {
            logger.error("Error calculating debt summary", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Compare Snowball vs Avalanche strategies
     * GET /api/debts/compare
     */
    @GetMapping("/compare")
    public ResponseEntity<?> compareStrategies(
            @RequestParam(required = false, defaultValue = "200") BigDecimal extraPayment) {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Comparing strategies for user {}", userId);
            
            StrategyComparison comparison = debtService.compareStrategies(userId, extraPayment);
            return ResponseEntity.ok(ApiResponse.success("Strategy comparison fetched successfully", comparison));
            
        } catch (Exception e) {
            logger.error("Error comparing strategies", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Quick payoff calculation
     * POST /api/debts/calculate
     */
    @PostMapping("/calculate")
    public ResponseEntity<?> calculatePayoff(@RequestBody PayoffCalculationRequest request) {
        try {
            Long userId = getCurrentUserId();
            logger.debug("Calculating payoff for user {} with extra payment: ₹{}", 
                    userId, request.getExtraPayment());
            
            DebtSummaryResponse summary = debtService.getDebtSummary(userId, request.getExtraPayment());
            return ResponseEntity.ok(ApiResponse.success("Payoff calculation completed", summary));
            
        } catch (Exception e) {
            logger.error("Error calculating payoff", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Health check endpoint
     * GET /api/debts/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Debt API is running", Map.of("status", "healthy")));
    }
    
    // Inner class for payoff calculation request
    public static class PayoffCalculationRequest {
        private BigDecimal extraPayment;
        private String strategy;
        
        public BigDecimal getExtraPayment() {
            return extraPayment;
        }
        
        public void setExtraPayment(BigDecimal extraPayment) {
            this.extraPayment = extraPayment;
        }
        
        public String getStrategy() {
            return strategy;
        }
        
        public void setStrategy(String strategy) {
            this.strategy = strategy;
        }
    }
}

