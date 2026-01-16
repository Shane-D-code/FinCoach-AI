# Debt Management System - Testing & Verification Guide

## 🎯 Quick Start

### 1. Start the Backend
```bash
cd backend
./mvnw spring-boot:run
```
**Expected Output:**
```
Started FinCoachApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

### 2. Start the Frontend
```bash
npm run dev
```
**Expected Output:**
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Verify Backend Health
```bash
curl http://localhost:8080/api/debts/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Debt API is running",
  "data": {
    "status": "healthy"
  }
}
```

## ✅ Feature Testing Checklist

### Dashboard View

#### Test 1: Add Your First Debt
- [ ] Click "Add Debt" button in header
- [ ] Fill in the form:
  - Name: "Credit Card"
  - Balance: 5000
  - Interest Rate: 18
  - Min Payment: 150
  - Type: Credit
- [ ] Click "Add Debt"
- [ ] **Verify:** Debt appears in the list
- [ ] **Verify:** Summary cards update
- [ ] **Verify:** Success toast appears

#### Test 2: View Debt Details
- [ ] Click "Details" button on a debt
- [ ] **Verify:** Expanded section shows:
  - Monthly Interest
  - Estimated Payoff
  - Recommended Payment

#### Test 3: Make a Payment
- [ ] Click "Make Payment" on a debt
- [ ] **Verify:** Payment modal opens
- [ ] Click "Minimum Payment"
- [ ] **Verify:** Success toast appears
- [ ] **Verify:** Balance decreases
- [ ] **Verify:** Payment appears in history

#### Test 4: Adjust Extra Payment
- [ ] Move the "Extra Monthly Payment" slider
- [ ] **Verify:** Summary updates in real-time
- [ ] **Verify:** Payoff time changes
- [ ] Click preset buttons ($50, $100, $200, $500)
- [ ] **Verify:** Slider updates

#### Test 5: Switch Strategies
- [ ] Click "Snowball" strategy card
- [ ] **Verify:** Debt list reorders (smallest first)
- [ ] Click "Avalanche" strategy card
- [ ] **Verify:** Debt list reorders (highest interest first)

#### Test 6: AI Insights
- [ ] **Verify:** Insights panel shows recommendations
- [ ] Click "Explore Options" on high interest alert
- [ ] **Verify:** Navigates to Calculators view
- [ ] Click "Increase Payment" on progress insight
- [ ] **Verify:** Extra payment increases by $50
- [ ] **Verify:** Success toast appears

#### Test 7: Milestones
- [ ] **Verify:** Milestone progress cards display
- [ ] **Verify:** Progress bars show correct percentage
- [ ] Click "View Milestones" in insights
- [ ] **Verify:** Scrolls to milestones section

#### Test 8: Debt-Free Countdown
- [ ] **Verify:** Countdown card shows target date
- [ ] **Verify:** Days remaining is calculated
- [ ] **Verify:** Progress percentage matches summary

### Charts View

#### Test 9: Progress Donut Chart
- [ ] Click "Charts" tab
- [ ] **Verify:** Donut chart displays
- [ ] **Verify:** Center shows percentage paid
- [ ] **Verify:** Paid vs Remaining amounts shown
- [ ] Hover over chart
- [ ] **Verify:** Tooltip appears with values

#### Test 10: Balance Projection Chart
- [ ] **Verify:** 24-month projection displays
- [ ] **Verify:** Line chart shows decreasing balance
- [ ] Hover over data points
- [ ] **Verify:** Tooltip shows month and balance

#### Test 11: Strategy Comparison Chart
- [ ] **Verify:** Bar chart compares Snowball vs Avalanche
- [ ] **Verify:** Shows interest and months for each
- [ ] **Verify:** Savings recommendation displays
- [ ] **Verify:** Interest saved and time saved shown

#### Test 12: Interest vs Principal Chart
- [ ] **Verify:** Line chart shows both metrics
- [ ] **Verify:** Two lines (green for principal, red for interest)
- [ ] Hover over lines
- [ ] **Verify:** Tooltip shows values

#### Test 13: Debt Breakdown Pie Chart
- [ ] **Verify:** Pie chart shows debts by type
- [ ] **Verify:** Labels show percentages
- [ ] **Verify:** Legend shows amounts
- [ ] Hover over slices
- [ ] **Verify:** Tooltip displays

### Payments View

#### Test 14: Payment History
- [ ] Click "Payments" tab
- [ ] **Verify:** All payments listed
- [ ] **Verify:** Statistics cards show totals
- [ ] Click on a payment
- [ ] **Verify:** Expands to show details:
  - Interest Paid
  - Balance Before/After
  - Reduction
  - Notes (if any)

#### Test 15: Search Payments
- [ ] Type debt name in search box
- [ ] **Verify:** List filters in real-time
- [ ] Clear search
- [ ] **Verify:** All payments return

#### Test 16: Filter by Date
- [ ] Select "Last 7 Days" filter
- [ ] **Verify:** Only recent payments show
- [ ] Select "Last Month"
- [ ] **Verify:** Filter updates
- [ ] Select "All Time"
- [ ] **Verify:** All payments return

#### Test 17: Export to CSV
- [ ] Click "Export CSV" button
- [ ] **Verify:** File downloads
- [ ] Open CSV file
- [ ] **Verify:** Contains all payment data:
  - Date, Debt, Amount, Principal, Interest, etc.

### Calculators View

#### Test 18: What-If Calculator
- [ ] Click "Calculators" tab
- [ ] **Verify:** What-If calculator is active
- [ ] Select a debt from dropdown
- [ ] Move extra payment slider
- [ ] **Verify:** Current vs With Extra comparison updates
- [ ] **Verify:** Savings summary shows:
  - Time Saved (months)
  - Interest Saved ($)

#### Test 19: Payoff Calculator
- [ ] Click "Payoff Calculator" tab
- [ ] Select a future date (e.g., 2 years from now)
- [ ] **Verify:** Required monthly payment calculates
- [ ] **Verify:** Shows current payment vs extra needed
- [ ] Select an unrealistic date (e.g., 1 month)
- [ ] **Verify:** Shows "not achievable" message

#### Test 20: Interest Savings Calculator
- [ ] Click "Interest Savings" tab
- [ ] Move interest rate slider
- [ ] **Verify:** Shows:
  - Current Interest
  - New Interest
  - Savings
- [ ] **Verify:** Recommendation message updates
- [ ] Set rate lower than current
- [ ] **Verify:** Shows positive savings

### Strategies View

#### Test 21: Strategy Comparison
- [ ] Click "Strategies" tab
- [ ] **Verify:** Two cards display:
  - Snowball Method
  - Avalanche Method
- [ ] **Verify:** Each shows:
  - Payoff Time
  - Total Interest
  - Monthly Payment
- [ ] **Verify:** Savings banner shows difference

### Offline Mode

#### Test 22: Offline Operations
- [ ] Open browser DevTools → Network tab
- [ ] Set to "Offline" mode
- [ ] **Verify:** Status shows "Offline" indicator
- [ ] Add a new debt
- [ ] **Verify:** Debt appears in list
- [ ] Make a payment
- [ ] **Verify:** Payment processes
- [ ] Go back online
- [ ] **Verify:** "Back online - syncing data..." toast
- [ ] **Verify:** Data syncs to backend
- [ ] Refresh page
- [ ] **Verify:** Data persists

### Refresh & Sync

#### Test 23: Manual Refresh
- [ ] Click refresh button in header
- [ ] **Verify:** Loading spinner appears
- [ ] **Verify:** Data reloads from backend
- [ ] **Verify:** "Data refreshed" toast appears

#### Test 24: Auto-Sync
- [ ] Wait 30 seconds (auto-sync interval)
- [ ] **Verify:** Data automatically syncs
- [ ] Check browser console
- [ ] **Verify:** No errors

### Delete Operations

#### Test 25: Delete Debt
- [ ] Click delete (trash) icon on a debt
- [ ] **Verify:** Confirmation dialog appears
- [ ] Click "Cancel"
- [ ] **Verify:** Debt remains
- [ ] Click delete again
- [ ] Click "OK"
- [ ] **Verify:** Debt removed
- [ ] **Verify:** Summary updates
- [ ] **Verify:** Charts update

### Responsive Design

#### Test 26: Mobile View
- [ ] Resize browser to mobile width (< 768px)
- [ ] **Verify:** Layout adapts
- [ ] **Verify:** Navigation tabs scroll horizontally
- [ ] **Verify:** Cards stack vertically
- [ ] **Verify:** All buttons remain accessible

#### Test 27: Tablet View
- [ ] Resize to tablet width (768px - 1024px)
- [ ] **Verify:** Grid layouts adjust
- [ ] **Verify:** Charts remain readable
- [ ] **Verify:** Modals center properly

### Dark Mode

#### Test 28: Dark Mode Toggle
- [ ] Toggle system dark mode
- [ ] **Verify:** UI switches to dark theme
- [ ] **Verify:** All text remains readable
- [ ] **Verify:** Charts update colors
- [ ] **Verify:** Modals use dark background

### Error Handling

#### Test 29: Invalid Payment
- [ ] Try to pay more than debt balance
- [ ] **Verify:** Error message appears
- [ ] Try to pay $0
- [ ] **Verify:** Button disabled or error shown
- [ ] Try to pay negative amount
- [ ] **Verify:** Input validation prevents it

#### Test 30: Backend Offline
- [ ] Stop backend server
- [ ] Try to add a debt
- [ ] **Verify:** Works offline (queued)
- [ ] Try to view summary
- [ ] **Verify:** Shows cached data
- [ ] Start backend
- [ ] **Verify:** Auto-syncs queued operations

## 🎨 Visual Verification

### Animations
- [ ] **Verify:** Smooth transitions between views
- [ ] **Verify:** Cards animate in on load
- [ ] **Verify:** Modals slide in/out smoothly
- [ ] **Verify:** Progress bars animate
- [ ] **Verify:** Toast notifications fade in/out

### Loading States
- [ ] **Verify:** Skeleton loaders during initial load
- [ ] **Verify:** Spinner on refresh button when loading
- [ ] **Verify:** Disabled buttons during operations

### Accessibility
- [ ] Tab through all interactive elements
- [ ] **Verify:** Focus indicators visible
- [ ] **Verify:** Logical tab order
- [ ] **Verify:** All buttons keyboard accessible
- [ ] Use screen reader
- [ ] **Verify:** Labels are descriptive

## 📊 Performance Checks

### Load Time
- [ ] Clear cache and reload
- [ ] **Verify:** Page loads in < 3 seconds
- [ ] **Verify:** Charts render smoothly
- [ ] **Verify:** No layout shifts

### Memory
- [ ] Open browser DevTools → Performance
- [ ] Record session
- [ ] Navigate through all views
- [ ] **Verify:** No memory leaks
- [ ] **Verify:** Smooth 60fps animations

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
```bash
# Check if backend is running
curl http://localhost:8080/api/debts/health

# If not, start it
cd backend && ./mvnw spring-boot:run
```

### Issue: "Charts not displaying"
**Solution:**
```bash
# Ensure recharts is installed
npm list recharts

# If missing, install it
npm install recharts
```

### Issue: "Data not persisting"
**Solution:**
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check backend logs for database errors

### Issue: "Payments not updating balance"
**Solution:**
1. Check payment amount is valid
2. Verify debt exists in database
3. Check backend logs for errors

## ✅ Final Checklist

- [ ] All 30 tests pass
- [ ] No console errors
- [ ] No lint warnings
- [ ] Responsive on all screen sizes
- [ ] Dark mode works correctly
- [ ] Offline mode functions properly
- [ ] All buttons are clickable
- [ ] All features connect to backend
- [ ] Data persists across refreshes
- [ ] Animations are smooth
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

## 🎉 Success Criteria

Your Debt Management System is **fully functional** when:

1. ✅ You can add, update, and delete debts
2. ✅ Payments process and update balances
3. ✅ All 5 charts display correctly
4. ✅ All 3 calculators work
5. ✅ Strategies comparison shows accurate data
6. ✅ Payment history tracks all transactions
7. ✅ Offline mode queues and syncs operations
8. ✅ AI insights provide actionable recommendations
9. ✅ Milestones track progress
10. ✅ Export to CSV works
11. ✅ All buttons trigger appropriate actions
12. ✅ Backend integration is seamless

**Congratulations! Your Debt-Free Journey system is ready to help users achieve financial freedom! 🚀**
