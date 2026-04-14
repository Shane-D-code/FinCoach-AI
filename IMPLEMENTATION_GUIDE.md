# FinCoach-AI Production Refactoring - Implementation Guide

## 🎉 What's Been Done

### ✅ Phase 1: Data Layer Foundation (COMPLETED)

#### New Type Definitions Created
- `src/types/transaction.ts` - Transaction data structures
- `src/types/user.ts` - User profile types
- `src/types/insights.ts` - AI insights and health score types
- `src/types/upload.ts` - Bank statement upload types

#### New Services Created
- `src/services/transactionService.ts` - Transaction CRUD operations
- `src/services/userService.ts` - User profile management
- `src/services/insightsService.ts` - AI insights and health score
- `src/services/uploadService.ts` - Bank statement and OCR uploads

#### Custom Hooks Created
- `src/hooks/useTransactions.ts` - Transaction data fetching
- `src/hooks/useUserProfile.ts` - User profile management
- `src/hooks/useInsights.ts` - Insights and health score

#### Utility Functions Created
- `src/utils/formatters.ts` - Currency, date, percentage formatting
- `src/utils/calculations.ts` - Financial calculations

### ✅ Phase 2: UI Components (COMPLETED)

#### New Components Created
- `src/components/HealthScoreRing.tsx` - Animated health score display
- `src/components/InsightsPanel.tsx` - AI insights with storytelling
- `src/components/ActionableCard.tsx` - CTA cards for user actions
- `src/components/BankUpload.tsx` - Bank statement upload with preview
- `src/components/FinancialAdvisorChat.tsx` - AI chat interface
- `src/components/AnimatedCounter.tsx` - Smooth number animations
- `src/components/SkeletonLoader.tsx` - Loading states

#### Updated Components
- `src/context/AppContext.tsx` - Removed mockData dependency

#### New Pages Created
- `src/pages/DashboardNew.tsx` - Storytelling-driven dashboard

## 🚀 Next Steps - Backend Implementation

### Required Backend Endpoints

You need to implement these endpoints in your Spring Boot backend:

#### 1. User Profile Endpoints

```java
// GET /api/user/profile
// Returns: UserProfile with basic info

// GET /api/user/financial-profile
// Returns: UserFinancialProfile with stats, streak, badges

// PUT /api/user/profile
// Body: { name, avatar, incomeType, monthlyIncome, riskProfile }
// Returns: Updated UserProfile

// PUT /api/user/financial-settings
// Body: { monthlyIncome, incomeType, riskProfile }
// Returns: Success boolean
```

#### 2. Transaction Endpoints

```java
// GET /api/transactions
// Query params: startDate, endDate, category, type
// Returns: List<Transaction>

// GET /api/transactions/summary
// Query params: months (default 6)
// Returns: TransactionSummary with breakdown and trends

// POST /api/transactions
// Body: Transaction (without id, userId)
// Returns: Created Transaction

// POST /api/transactions/bulk
// Body: { transactions: Transaction[] }
// Returns: List<Transaction>

// PUT /api/transactions/{id}
// Body: Partial<Transaction>
// Returns: Updated Transaction

// DELETE /api/transactions/{id}
// Returns: Success boolean
```

#### 3. Upload Endpoints

```java
// POST /api/upload/bank-statement
// Body: MultipartFile (CSV or PDF)
// Returns: UploadResult with parsed transactions

// POST /api/upload/parse-csv
// Body: { content: string }
// Returns: List<ParsedTransaction>
```

#### 4. Insights Endpoints

```java
// GET /api/insights
// Returns: List<Insight> - AI-generated insights

// GET /api/insights/health-score
// Returns: FinancialHealthScore

// PUT /api/insights/{id}/read
// Returns: Success boolean

// POST /api/insights/generate
// Returns: List<Insight> - Newly generated insights

// POST /api/insights/advice
// Body: { question: string }
// Returns: AIAdvice
```

### Backend Implementation Priority

1. **HIGH PRIORITY** (Core functionality)
   - Transaction CRUD endpoints
   - Transaction summary endpoint
   - User profile endpoints
   - Health score calculation

2. **MEDIUM PRIORITY** (Enhanced UX)
   - Insights generation
   - Bank statement upload
   - CSV parsing

3. **LOW PRIORITY** (Nice to have)
   - AI advice endpoint
   - Insight read status
   - Advanced analytics

## 📝 Backend Implementation Examples

### Example: Transaction Summary Endpoint

```java
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<TransactionSummary>> getSummary(
        @RequestParam(defaultValue = "6") int months,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.findByEmail(userDetails.getUsername());
        TransactionSummary summary = transactionService.calculateSummary(user.getId(), months);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}

@Service
public class TransactionService {
    
    public TransactionSummary calculateSummary(Long userId, int months) {
        LocalDate startDate = LocalDate.now().minusMonths(months);
        List<Transaction> transactions = transactionRepository
            .findByUserIdAndDateAfter(userId, startDate);
        
        double totalIncome = transactions.stream()
            .filter(t -> t.getType() == TransactionType.INCOME)
            .mapToDouble(Transaction::getAmount)
            .sum();
        
        double totalExpenses = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> Math.abs(t.getAmount()))
            .sum();
        
        List<CategoryBreakdown> breakdown = calculateCategoryBreakdown(transactions);
        List<MonthlyTrend> trend = calculateMonthlyTrend(transactions, months);
        
        return TransactionSummary.builder()
            .totalIncome(totalIncome)
            .totalExpenses(totalExpenses)
            .netSavings(totalIncome - totalExpenses)
            .categoryBreakdown(breakdown)
            .monthlyTrend(trend)
            .build();
    }
}
```

### Example: Health Score Calculation

```java
@Service
public class InsightsService {
    
    public FinancialHealthScore calculateHealthScore(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        TransactionSummary summary = transactionService.calculateSummary(userId, 3);
        
        // Calculate components
        double savingsRatio = calculateSavingsRatio(summary);
        double debtRatio = calculateDebtRatio(user);
        double spendingBehavior = calculateSpendingConsistency(userId);
        double emergencyFund = calculateEmergencyFundScore(user, summary);
        
        // Weighted score
        int overall = (int) Math.round(
            savingsRatio * 0.3 +
            (100 - debtRatio) * 0.25 +
            emergencyFund * 0.25 +
            spendingBehavior * 0.2
        );
        
        return FinancialHealthScore.builder()
            .overall(overall)
            .breakdown(Map.of(
                "savingsRatio", savingsRatio,
                "debtRatio", 100 - debtRatio,
                "spendingBehavior", spendingBehavior,
                "emergencyFund", emergencyFund
            ))
            .grade(getGrade(overall))
            .color(getColor(overall))
            .recommendations(generateRecommendations(overall, summary))
            .build();
    }
}
```

## 🔄 Migration Steps

### Step 1: Test New Components (Frontend Only)

1. Replace Dashboard import in App.tsx:
```typescript
// Change from:
import Dashboard from './pages/Dashboard';

// To:
import Dashboard from './pages/DashboardNew';
```

2. Run frontend: `npm run dev`
3. You'll see the new UI with skeleton loaders (backend not connected yet)

### Step 2: Implement Backend Endpoints

1. Start with Transaction endpoints
2. Add User Profile endpoints
3. Implement Health Score calculation
4. Add Insights generation

### Step 3: Connect Frontend to Backend

Once backend endpoints are ready:
1. Test each service individually
2. Verify data flow
3. Check error handling

### Step 4: Remove Mock Data

Once everything works:
```bash
# Delete mock data files
rm src/data/mockData.ts
rm src/data/mockData-fixed.ts
```

### Step 5: Update Existing Pages

Update these pages to use new services:
- `src/pages/Budget.tsx`
- `src/pages/Goals.tsx`
- `src/pages/Lifestyle.tsx`
- `src/pages/Engagement.tsx`

## 🎨 Design System

### Colors
- Background: `#0F172A` (slate-900)
- Primary: `#6366F1` (indigo-600)
- Success: `#22C55E` (green-500)
- Danger: `#EF4444` (red-500)
- Warning: `#F59E0B` (yellow-500)

### Typography
- Headings: Bold, white
- Body: Regular, gray-300
- Labels: Small, gray-400

### Spacing
- Cards: `p-6` (24px)
- Sections: `gap-6` (24px)
- Elements: `gap-3` (12px)

## 🧪 Testing Checklist

### Frontend Testing
- [ ] Health score ring animates correctly
- [ ] Insights panel displays and updates
- [ ] Bank upload modal works
- [ ] Animated counters smooth
- [ ] Charts render with data
- [ ] Skeleton loaders show during loading
- [ ] Error states handled gracefully

### Backend Testing
- [ ] All endpoints return correct data structure
- [ ] Authentication works on protected routes
- [ ] Transactions CRUD operations work
- [ ] Health score calculation accurate
- [ ] CSV parsing handles various formats
- [ ] Error responses are consistent

### Integration Testing
- [ ] Upload bank statement end-to-end
- [ ] View health score with real data
- [ ] Generate and view insights
- [ ] Chat with AI advisor
- [ ] Filter and search transactions

## 📊 Success Metrics

- ✅ Zero hardcoded financial data
- ✅ All data from API/Upload/ML
- ✅ Every number has context
- ✅ Smooth animations and transitions
- ✅ Professional fintech aesthetic
- ✅ Storytelling-driven UX

## 🚨 Common Issues & Solutions

### Issue: CORS errors
**Solution**: Add CORS configuration in Spring Boot:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("*");
    }
}
```

### Issue: 401 Unauthorized on protected routes
**Solution**: Ensure JWT token is being sent in Authorization header (already handled in api.ts interceptor)

### Issue: Data not refreshing
**Solution**: Call the `refresh()` function from hooks after mutations

## 📚 Additional Resources

- [React Query](https://tanstack.com/query/latest) - Consider for better data fetching
- [Zustand](https://github.com/pmndrs/zustand) - Alternative to Context API
- [Recharts Docs](https://recharts.org/) - Chart customization
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 🎯 Next Features to Add

1. **Real-time Updates** - WebSocket for live data
2. **Notifications** - Push notifications for insights
3. **Goals Tracking** - Visual progress towards financial goals
4. **Budget Alerts** - Warnings when approaching limits
5. **Export Reports** - PDF/CSV export of financial data
6. **Multi-currency** - Support for multiple currencies
7. **Recurring Transactions** - Auto-add recurring expenses
8. **Bill Reminders** - Notifications for upcoming bills

## 💡 Pro Tips

1. **Start Small**: Implement one endpoint at a time
2. **Test Early**: Test each component as you build
3. **Use TypeScript**: Leverage type safety
4. **Error Handling**: Always handle errors gracefully
5. **Loading States**: Show skeletons during data fetch
6. **Optimistic Updates**: Update UI before API response
7. **Cache Data**: Use React Query or similar for caching
8. **Mobile First**: Ensure responsive design

---

**Need Help?** Check the existing code examples in the new components and services!
