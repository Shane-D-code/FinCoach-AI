package com.fincoach.service;

import com.fincoach.dto.*;
import com.fincoach.dto.DebtSummaryResponse.*;
import com.fincoach.entity.Debt;
import com.fincoach.entity.Debt.DebtType;
import com.fincoach.entity.DebtPayment;
import com.fincoach.repository.DebtPaymentRepository;
import com.fincoach.repository.DebtRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for debt management operations
 */
@Service
@Transactional
public class DebtService {
    
    private static final Logger logger = LoggerFactory.getLogger(DebtService.class);
    
    private final DebtRepository debtRepository;
    private final DebtPaymentRepository paymentRepository;
    
    public DebtService(DebtRepository debtRepository, DebtPaymentRepository paymentRepository) {
        this.debtRepository = debtRepository;
        this.paymentRepository = paymentRepository;
    }
    
    // ==================== CRUD Operations ====================
    
    /**
     * Create a new debt for a user
     */
    public DebtResponse createDebt(Long userId, DebtRequest request) {
        logger.info("Creating debt for user {}: {}", userId, request.getName());
        
        Debt debt = new Debt();
        debt.setUserId(userId);
        debt.setName(request.getName());
        debt.setBalance(request.getBalance());
        debt.setInterestRate(request.getInterestRate());
        debt.setMinPayment(request.getMinPayment());
        debt.setType(convertToDebtType(request.getType()));
        debt.setOriginalBalance(request.getBalance());
        debt.setIsActive(true);
        debt.setNotes(request.getNotes());
        debt.setDueDay(request.getDueDay());
        
        debt = debtRepository.save(debt);
        logger.info("Debt created with ID: {}", debt.getId());
        
        return mapToResponse(debt, null, BigDecimal.ZERO, null);
    }
    
    /**
     * Get all active debts for a user
     */
    @Transactional(readOnly = true)
    public List<DebtResponse> getUserDebts(Long userId) {
        logger.debug("Fetching debts for user {}", userId);
        
        List<Debt> debts = debtRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        return debts.stream()
                .map(debt -> {
                    BigDecimal totalInterest = calculateTotalInterestForDebt(debt);
                    return mapToResponse(debt, null, totalInterest, null);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific debt by ID
     */
    @Transactional(readOnly = true)
    public DebtResponse getDebtById(Long debtId, Long userId) {
        Debt debt = debtRepository.findActiveDebtByIdAndUserId(debtId, userId);
        if (debt == null) {
            throw new RuntimeException("Debt not found with ID: " + debtId);
        }
        
        BigDecimal totalInterest = calculateTotalInterestForDebt(debt);
        return mapToResponse(debt, null, totalInterest, null);
    }
    
    /**
     * Update an existing debt
     */
    public DebtResponse updateDebt(Long debtId, Long userId, DebtRequest request) {
        Debt debt = debtRepository.findActiveDebtByIdAndUserId(debtId, userId);
        if (debt == null) {
            throw new RuntimeException("Debt not found with ID: " + debtId);
        }
        
        debt.setName(request.getName());
        debt.setBalance(request.getBalance());
        debt.setInterestRate(request.getInterestRate());
        debt.setMinPayment(request.getMinPayment());
        debt.setType(convertToDebtType(request.getType()));
        debt.setNotes(request.getNotes());
        debt.setDueDay(request.getDueDay());
        
        debt = debtRepository.save(debt);
        logger.info("Debt updated: {}", debtId);
        
        BigDecimal totalInterest = calculateTotalInterestForDebt(debt);
        return mapToResponse(debt, null, totalInterest, null);
    }
    
    /**
     * Delete a debt (soft delete)
     */
    public void deleteDebt(Long debtId, Long userId) {
        Debt debt = debtRepository.findActiveDebtByIdAndUserId(debtId, userId);
        if (debt == null) {
            throw new RuntimeException("Debt not found with ID: " + debtId);
        }
        
        debt.setIsActive(false);
        debtRepository.save(debt);
        logger.info("Debt soft deleted: {}", debtId);
    }
    
    // ==================== Payment Processing ====================
    
    /**
     * Process a debt payment
     */
    public DebtPaymentResponse makePayment(Long userId, DebtPaymentRequest request) {
        logger.info("Processing payment for debt {}: ₹{}", request.getDebtId(), request.getAmount());
        
        Debt debt = debtRepository.findActiveDebtByIdAndUserId(request.getDebtId(), userId);
        if (debt == null) {
            throw new RuntimeException("Debt not found with ID: " + request.getDebtId());
        }
        
        if (request.getAmount().compareTo(debt.getBalance()) > 0) {
            throw new RuntimeException("Payment amount exceeds current balance");
        }
        
        BigDecimal balanceBefore = debt.getBalance();
        BigDecimal monthlyRate = debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        BigDecimal interestPortion = balanceBefore.multiply(monthlyRate).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal principalPortion = request.getAmount().subtract(interestPortion);
        
        // Ensure we don't overpay
        if (principalPortion.compareTo(balanceBefore) > 0) {
            principalPortion = balanceBefore;
        }
        
        BigDecimal balanceAfter = balanceBefore.subtract(principalPortion);
        
        // Update debt balance
        debt.setBalance(balanceAfter);
        if (balanceAfter.compareTo(BigDecimal.ONE) <= 0) {
            debt.setIsActive(false);
            logger.info("Debt {} has been paid off!", debt.getId());
        }
        debtRepository.save(debt);
        
        // Create payment record
        DebtPayment payment = new DebtPayment();
        payment.setDebtId(request.getDebtId());
        payment.setUserId(userId);
        payment.setAmount(request.getAmount());
        payment.setBalanceBefore(balanceBefore);
        payment.setBalanceAfter(balanceAfter);
        payment.setInterestPaid(interestPortion);
        payment.setPrincipalPaid(principalPortion);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setNotes(request.getNotes());
        payment.setIsAutomatic(request.getIsAutomatic() != null ? request.getIsAutomatic() : false);
        
        payment = paymentRepository.save(payment);
        logger.info("Payment recorded with ID: {}", payment.getId());
        
        return mapPaymentToResponse(payment, debt.getName());
    }
    
    /**
     * Get payment history for a debt
     */
    @Transactional(readOnly = true)
    public List<DebtPaymentResponse> getPaymentHistory(Long debtId, Long userId) {
        // Verify debt belongs to user
        Debt debt = debtRepository.findActiveDebtByIdAndUserId(debtId, userId);
        if (debt == null) {
            throw new RuntimeException("Debt not found with ID: " + debtId);
        }
        
        List<DebtPayment> payments = paymentRepository.findByDebtIdOrderByPaymentDateDesc(debtId);
        return payments.stream()
                .map(payment -> mapPaymentToResponse(payment, debt.getName()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all payments for a user
     */
    @Transactional(readOnly = true)
    public List<DebtPaymentResponse> getUserPaymentHistory(Long userId) {
        List<DebtPayment> payments = paymentRepository.findByUserIdOrderByPaymentDateDesc(userId);
        Map<Long, String> debtNames = new HashMap<>();
        
        return payments.stream()
                .map(payment -> {
                    String debtName = debtNames.computeIfAbsent(payment.getDebtId(), id -> {
                        Debt d = debtRepository.findById(id).orElse(null);
                        return d != null ? d.getName() : "Unknown Debt";
                    });
                    return mapPaymentToResponse(payment, debtName);
                })
                .collect(Collectors.toList());
    }
    
    // ==================== Summary & Analysis ====================
    
    /**
     * Get comprehensive debt summary for a user
     */
    @Transactional(readOnly = true)
    public DebtSummaryResponse getDebtSummary(Long userId, BigDecimal extraPayment) {
        logger.debug("Calculating debt summary for user {}", userId);
        
        List<Debt> debts = debtRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        
        if (debts.isEmpty()) {
            return createEmptySummary();
        }
        
        DebtSummaryResponse summary = new DebtSummaryResponse();
        
        // Basic metrics
        BigDecimal totalDebt = debts.stream()
                .map(Debt::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalDebt(totalDebt);
        
        BigDecimal totalOriginalDebt = debts.stream()
                .map(debt -> debt.getOriginalBalance() != null ? debt.getOriginalBalance() : debt.getBalance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalOriginalDebt(totalOriginalDebt);
        
        BigDecimal totalMinPayment = debts.stream()
                .map(Debt::getMinPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalMinPayment(totalMinPayment);
        
        summary.setTotalDebts(debts.size());
        summary.setActiveDebts(debts.size());
        summary.setPaidOffDebts(0);
        
        // Interest calculations
        BigDecimal totalMonthlyInterest = debts.stream()
                .map(debt -> debt.getBalance().multiply(debt.getInterestRate())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                        .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalMonthlyInterest(totalMonthlyInterest);
        
        // Interest rates
        BigDecimal highestRate = debts.stream()
                .map(Debt::getInterestRate)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        summary.setHighestInterestRate(highestRate);
        
        BigDecimal lowestRate = debts.stream()
                .map(Debt::getInterestRate)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        summary.setLowestInterestRate(lowestRate);
        
        BigDecimal avgRate = debts.stream()
                .map(Debt::getInterestRate)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(debts.size()), 2, RoundingMode.HALF_UP);
        summary.setAverageInterestRate(avgRate);
        
        // Progress
        if (totalOriginalDebt.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal paid = totalOriginalDebt.subtract(totalDebt);
            BigDecimal progress = paid.multiply(BigDecimal.valueOf(100))
                    .divide(totalOriginalDebt, 2, RoundingMode.HALF_UP);
            summary.setProgressPercentage(progress);
        }
        
        // Historical payments
        BigDecimal totalInterestPaid = paymentRepository.getTotalInterestPaidByUserId(userId);
        BigDecimal totalPrincipalPaid = paymentRepository.getTotalPrincipalPaidByUserId(userId);
        summary.setTotalInterestPaid(totalInterestPaid != null ? totalInterestPaid : BigDecimal.ZERO);
        summary.setTotalPrincipalPaid(totalPrincipalPaid != null ? totalPrincipalPaid : BigDecimal.ZERO);
        
        // Strategy comparison
        StrategyComparison comparison = calculateStrategyComparison(userId, debts, extraPayment, totalMinPayment);
        summary.setStrategyComparison(comparison);
        summary.setRecommendedStrategy(comparison.getSavings().getInterestSaved().compareTo(BigDecimal.ZERO) > 0 
                ? "avalanche" : "snowball");
        
        // Payoff plans
        List<PayoffPlanResponse> payoffPlans = calculatePayoffPlans(userId, "avalanche", extraPayment);
        summary.setPayoffPlans(payoffPlans);
        
        // Calculate payoff time from plans
        Integer maxMonths = payoffPlans.stream()
                .map(PayoffPlanResponse::getMonthsToPayoff)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0);
        summary.setEstimatedPayoffMonths(maxMonths);
        
        // Milestones
        List<MilestoneInfo> milestones = calculateMilestones(userId, debts, totalDebt, totalOriginalDebt, totalInterestPaid);
        summary.setMilestones(milestones);
        
        MilestoneInfo nextMilestone = milestones.stream()
                .filter(m -> !m.getIsCompleted())
                .findFirst()
                .orElse(null);
        summary.setNextMilestone(nextMilestone);
        
        return summary;
    }
    
    /**
     * Compare Snowball vs Avalanche strategies
     */
    @Transactional(readOnly = true)
    public StrategyComparison compareStrategies(Long userId, BigDecimal extraPayment) {
        List<Debt> debts = debtRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        BigDecimal totalMinPayment = debts.stream()
                .map(Debt::getMinPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return calculateStrategyComparison(userId, debts, extraPayment, totalMinPayment);
    }
    
    // ==================== Private Helper Methods ====================
    
    private DebtType convertToDebtType(String type) {
        if (type == null) return DebtType.OTHER;
        return switch (type.toLowerCase()) {
            case "credit", "credit card" -> DebtType.CREDIT;
            case "loan", "personal loan" -> DebtType.LOAN;
            case "student", "student loan" -> DebtType.STUDENT;
            case "mortgage" -> DebtType.MORTGAGE;
            case "auto", "car" -> DebtType.AUTO;
            case "medical" -> DebtType.MEDICAL;
            default -> DebtType.OTHER;
        };
    }
    
    private DebtResponse mapToResponse(Debt debt, Integer monthsToPayoff, BigDecimal totalInterest, BigDecimal extraPayment) {
        DebtResponse response = new DebtResponse();
        response.setId(debt.getId());
        response.setName(debt.getName());
        response.setBalance(debt.getBalance());
        response.setInterestRate(debt.getInterestRate());
        response.setMinPayment(debt.getMinPayment());
        response.setType(debt.getType().name().toLowerCase());
        response.setTypeDisplayName(debt.getType().getDisplayName());
        response.setOriginalBalance(debt.getOriginalBalance());
        response.setIsActive(debt.getIsActive());
        response.setIsPaidOff(debt.isPaidOff());
        response.setNotes(debt.getNotes());
        response.setDueDay(debt.getDueDay());
        response.setCreatedAt(debt.getCreatedAt());
        response.setUpdatedAt(debt.getUpdatedAt());
        
        // Calculate progress
        if (debt.getOriginalBalance() != null && debt.getOriginalBalance().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal paid = debt.getOriginalBalance().subtract(debt.getBalance());
            BigDecimal progress = paid.multiply(BigDecimal.valueOf(100))
                    .divide(debt.getOriginalBalance(), 2, RoundingMode.HALF_UP);
            response.setProgressPercentage(progress);
        }
        
        // Monthly interest
        BigDecimal monthlyRate = debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        BigDecimal monthlyInterest = debt.getBalance().multiply(monthlyRate)
                .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        response.setMonthlyInterest(monthlyInterest);
        
        // Payoff calculations
        if (monthsToPayoff != null) {
            response.setMonthsToPayoff(monthsToPayoff);
        }
        
        if (extraPayment != null) {
            BigDecimal recommended = debt.getMinPayment().add(extraPayment);
            response.setRecommendedPayment(recommended);
        }
        
        if (totalInterest != null) {
            response.setTotalInterest(totalInterest);
        }
        
        return response;
    }
    
    private DebtPaymentResponse mapPaymentToResponse(DebtPayment payment, String debtName) {
        DebtPaymentResponse response = new DebtPaymentResponse();
        response.setId(payment.getId());
        response.setDebtId(payment.getDebtId());
        response.setDebtName(debtName);
        response.setAmount(payment.getAmount());
        response.setBalanceBefore(payment.getBalanceBefore());
        response.setBalanceAfter(payment.getBalanceAfter());
        response.setInterestPaid(payment.getInterestPaid());
        response.setPrincipalPaid(payment.getPrincipalPaid());
        response.setPaymentDate(payment.getPaymentDate());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setNotes(payment.getNotes());
        response.setIsAutomatic(payment.getIsAutomatic());
        return response;
    }
    
    private BigDecimal calculateTotalInterestForDebt(Debt debt) {
        BigDecimal monthlyRate = debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        BigDecimal monthlyPayment = debt.getMinPayment();
        BigDecimal balance = debt.getBalance();
        
        if (monthlyPayment.compareTo(balance.multiply(monthlyRate).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)) <= 0) {
            return BigDecimal.valueOf(Integer.MAX_VALUE); // Will never pay off
        }
        
        BigDecimal totalInterest = BigDecimal.ZERO;
        int months = 0;
        while (balance.compareTo(BigDecimal.ONE) > 0 && months < 600) { // Max 50 years
            BigDecimal interest = balance.multiply(monthlyRate).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            totalInterest = totalInterest.add(interest);
            BigDecimal principal = monthlyPayment.subtract(interest);
            balance = balance.subtract(principal);
            months++;
        }
        
        return totalInterest;
    }
    
    private List<PayoffPlanResponse> calculatePayoffPlans(Long userId, String strategy, BigDecimal extraPayment) {
        List<Debt> debts;
        if ("avalanche".equalsIgnoreCase(strategy)) {
            debts = debtRepository.findDebtsForAvalancheByUserId(userId);
        } else {
            debts = debtRepository.findDebtsForSnowballByUserId(userId);
        }
        
        List<PayoffPlanResponse> plans = new ArrayList<>();
        BigDecimal remainingExtra = extraPayment != null ? extraPayment : BigDecimal.ZERO;
        int priority = 1;
        
        for (Debt debt : debts) {
            PayoffPlanResponse plan = new PayoffPlanResponse();
            plan.setDebtId(debt.getId());
            plan.setDebtName(debt.getName());
            plan.setDebtType(debt.getType().name().toLowerCase());
            plan.setCurrentBalance(debt.getBalance());
            plan.setMinPayment(debt.getMinPayment());
            plan.setPriority(priority);
            plan.setIsPriority(priority == 1);
            
            // Calculate recommended payment
            BigDecimal recommendedPayment = debt.getMinPayment().add(remainingExtra);
            plan.setRecommendedPayment(recommendedPayment);
            plan.setExtraPayment(remainingExtra);
            plan.setTotalPayment(recommendedPayment);
            
            // Calculate payoff time and interest
            BigDecimal monthlyRate = debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            int months = calculatePayoffMonths(debt.getBalance(), recommendedPayment, monthlyRate);
            plan.setMonthsToPayoff(months);
            
            BigDecimal totalInterest = calculateTotalInterestForAmount(debt.getBalance(), recommendedPayment, monthlyRate);
            plan.setTotalInterest(totalInterest);
            
            // Monthly interest
            BigDecimal monthlyInterest = debt.getBalance().multiply(monthlyRate)
                    .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            plan.setMonthlyInterest(monthlyInterest);
            
            // Progress
            if (debt.getOriginalBalance() != null && debt.getOriginalBalance().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal paid = debt.getOriginalBalance().subtract(debt.getBalance());
                BigDecimal progress = paid.multiply(BigDecimal.valueOf(100))
                        .divide(debt.getOriginalBalance(), 2, RoundingMode.HALF_UP);
                plan.setProgressPercentage(progress);
            }
            
            plans.add(plan);
            
            if (priority == 1 && remainingExtra.compareTo(BigDecimal.ZERO) > 0) {
                remainingExtra = BigDecimal.ZERO; // Apply extra to first debt only
            }
            priority++;
        }
        
        return plans;
    }
    
    private int calculatePayoffMonths(BigDecimal balance, BigDecimal monthlyPayment, BigDecimal monthlyRate) {
        if (monthlyPayment.compareTo(balance.multiply(monthlyRate).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)) <= 0) {
            return Integer.MAX_VALUE;
        }
        
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return (int) Math.ceil(balance.divide(monthlyPayment, 0, RoundingMode.CEILING).doubleValue());
        }
        
        double num = -Math.log(1 - (balance.multiply(monthlyRate).divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP))
                .divide(monthlyPayment).doubleValue());
        double denom = Math.log(1 + monthlyRate.divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP).doubleValue());
        return (int) Math.ceil(num / denom);
    }
    
    private BigDecimal calculateTotalInterestForAmount(BigDecimal balance, BigDecimal monthlyPayment, BigDecimal monthlyRate) {
        BigDecimal totalInterest = BigDecimal.ZERO;
        BigDecimal remaining = balance;
        int months = 0;
        
        while (remaining.compareTo(BigDecimal.ONE) > 0 && months < 600) {
            BigDecimal interest = remaining.multiply(monthlyRate)
                    .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            totalInterest = totalInterest.add(interest);
            BigDecimal principal = monthlyPayment.subtract(interest);
            remaining = remaining.subtract(principal);
            months++;
        }
        
        return totalInterest;
    }
    
    private StrategyComparison calculateStrategyComparison(Long userId, List<Debt> debts, 
            BigDecimal extraPayment, BigDecimal totalMinPayment) {
        StrategyComparison comparison = new StrategyComparison();
        
        // Avalanche (highest rate first)
        AvalancheInfo avalancheInfo = new AvalancheInfo();
        List<Debt> avalancheSorted = debtRepository.findDebtsForAvalancheByUserId(userId);
        int avalancheMonths = calculateTotalPayoffTime(avalancheSorted, totalMinPayment, extraPayment);
        avalancheInfo.setPayoffMonths(avalancheMonths);
        
        BigDecimal avalancheInterest = avalancheSorted.stream()
                .map(debt -> calculateTotalInterestForAmount(
                        debt.getBalance(), 
                        debt.getMinPayment().add(avalancheSorted.indexOf(debt) == 0 ? extraPayment : BigDecimal.ZERO),
                        debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        avalancheInfo.setTotalInterest(avalancheInterest);
        avalancheInfo.setMonthlyPayment(totalMinPayment.add(extraPayment));
        comparison.setAvalanche(avalancheInfo);
        
        // Snowball (lowest balance first)
        SnowballInfo snowballInfo = new SnowballInfo();
        List<Debt> snowballSorted = debtRepository.findDebtsForSnowballByUserId(userId);
        int snowballMonths = calculateTotalPayoffTime(snowballSorted, totalMinPayment, extraPayment);
        snowballInfo.setPayoffMonths(snowballMonths);
        
        BigDecimal snowballInterest = snowballSorted.stream()
                .map(debt -> calculateTotalInterestForAmount(
                        debt.getBalance(), 
                        debt.getMinPayment().add(snowballSorted.indexOf(debt) == 0 ? extraPayment : BigDecimal.ZERO),
                        debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        snowballInfo.setTotalInterest(snowballInterest);
        snowballInfo.setMonthlyPayment(totalMinPayment.add(extraPayment));
        comparison.setSnowball(snowballInfo);
        
        // Savings
        SavingsInfo savings = new SavingsInfo();
        BigDecimal interestSaved = snowballInterest.subtract(avalancheInterest);
        savings.setInterestSaved(interestSaved.compareTo(BigDecimal.ZERO) > 0 ? interestSaved : BigDecimal.ZERO);
        savings.setTimeSavedMonths(Math.max(0, snowballMonths - avalancheMonths));
        
        if (savings.getInterestSaved().compareTo(BigDecimal.ZERO) > 0) {
            savings.setRecommendation("Avalanche method saves you ₹" + 
                    savings.getInterestSaved().setScale(0, RoundingMode.HALF_UP) + 
                    " in interest over " + savings.getTimeSavedMonths() + " months");
        } else {
            savings.setRecommendation("Snowball method gives you psychological wins by paying off smaller debts first");
        }
        comparison.setSavings(savings);
        
        return comparison;
    }
    
    private int calculateTotalPayoffTime(List<Debt> debts, BigDecimal totalMinPayment, BigDecimal extraPayment) {
        BigDecimal remainingExtra = extraPayment;
        int maxMonths = 0;
        
        for (int i = 0; i < debts.size(); i++) {
            Debt debt = debts.get(i);
            BigDecimal payment = debt.getMinPayment().add(i == 0 ? remainingExtra : BigDecimal.ZERO);
            BigDecimal monthlyRate = debt.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            int months = calculatePayoffMonths(debt.getBalance(), payment, monthlyRate);
            maxMonths = Math.max(maxMonths, months);
        }
        
        return maxMonths;
    }
    
    private List<MilestoneInfo> calculateMilestones(Long userId, List<Debt> debts, 
            BigDecimal currentDebt, BigDecimal originalDebt, BigDecimal totalInterestPaid) {
        List<MilestoneInfo> milestones = new ArrayList<>();
        
        // First payment milestone
        Integer paymentCount = paymentRepository.getPaymentCountByUserId(userId);
        MilestoneInfo firstPayment = new MilestoneInfo();
        firstPayment.setId("first-payment");
        firstPayment.setName("First Payment Made");
        firstPayment.setType(MilestoneInfo.MilestoneType.FIRST_PAYMENT);
        firstPayment.setTargetValue(BigDecimal.ONE);
        firstPayment.setCurrentValue(BigDecimal.valueOf(paymentCount != null ? paymentCount : 0));
        firstPayment.setIsCompleted(paymentCount != null && paymentCount > 0);
        firstPayment.setDescription("Make your first debt payment");
        milestones.add(firstPayment);
        
        // 50% paid off milestone
        MilestoneInfo halfPaid = new MilestoneInfo();
        halfPaid.setId("half-paid");
        halfPaid.setName("50% Debt Paid Off");
        halfPaid.setType(MilestoneInfo.MilestoneType.DEBT_HALFPAID);
        halfPaid.setTargetValue(originalDebt);
        halfPaid.setCurrentValue(originalDebt.subtract(currentDebt));
        halfPaid.setDescription("Pay off half of your original debt");
        milestones.add(halfPaid);
        
        // Interest saved milestone (target: 10% of original debt)
        MilestoneInfo interestSaved = new MilestoneInfo();
        BigDecimal interestTarget = originalDebt.multiply(BigDecimal.valueOf(0.1));
        interestSaved.setId("interest-saved");
        interestSaved.setName("₹" + interestTarget.setScale(0, RoundingMode.HALF_UP) + " Interest Saved");
        interestSaved.setType(MilestoneInfo.MilestoneType.INTEREST_MILESTONE);
        interestSaved.setTargetValue(interestTarget);
        interestSaved.setCurrentValue(totalInterestPaid != null ? totalInterestPaid : BigDecimal.ZERO);
        interestSaved.setDescription("Save money on interest payments");
        milestones.add(interestSaved);
        
        // Debt-free milestone
        MilestoneInfo debtFree = new MilestoneInfo();
        debtFree.setId("debt-free");
        debtFree.setName("Debt Free!");
        debtFree.setType(MilestoneInfo.MilestoneType.ALL_DEBTS_PAID);
        debtFree.setTargetValue(originalDebt);
        debtFree.setCurrentValue(originalDebt.subtract(currentDebt));
        debtFree.setIsCompleted(currentDebt.compareTo(BigDecimal.ONE) <= 0);
        debtFree.setDescription("Pay off all your debts");
        milestones.add(debtFree);
        
        return milestones;
    }
    
    private DebtSummaryResponse createEmptySummary() {
        DebtSummaryResponse summary = new DebtSummaryResponse();
        summary.setTotalDebt(BigDecimal.ZERO);
        summary.setTotalOriginalDebt(BigDecimal.ZERO);
        summary.setTotalMinPayment(BigDecimal.ZERO);
        summary.setTotalMonthlyInterest(BigDecimal.ZERO);
        summary.setAverageInterestRate(BigDecimal.ZERO);
        summary.setHighestInterestRate(BigDecimal.ZERO);
        summary.setLowestInterestRate(BigDecimal.ZERO);
        summary.setEstimatedPayoffMonths(0);
        summary.setTotalDebts(0);
        summary.setActiveDebts(0);
        summary.setPaidOffDebts(0);
        summary.setTotalInterestPaid(BigDecimal.ZERO);
        summary.setTotalPrincipalPaid(BigDecimal.ZERO);
        summary.setProgressPercentage(BigDecimal.ZERO);
        summary.setPayoffPlans(new ArrayList<>());
        summary.setMilestones(new ArrayList<>());
        return summary;
    }
}

