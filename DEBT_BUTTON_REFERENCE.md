# Debt Management - Button Reference Guide

## 📍 Quick Button Location & Function Reference

### Header Section

| Button | Icon | Location | Function | Handler |
|--------|------|----------|----------|---------|
| **Refresh** | 🔄 | Top right | Syncs data from backend | `handleRefresh()` |
| **Add Debt** | ➕ | Top right | Opens debt onboarding flow | `setShowOnboarding(true)` |

### Navigation Tabs

| Tab | Icon | Function | Handler |
|-----|------|----------|---------|
| **Dashboard** | 📊 | Shows overview, insights, debts | `setViewMode('dashboard')` |
| **Charts** | 📈 | Displays 5 interactive charts | `setViewMode('charts')` |
| **Payments** | 📜 | Shows payment history | `setViewMode('payments')` |
| **Calculators** | 🧮 | Opens financial calculators | `setViewMode('calculators')` |
| **Strategies** | 💡 | Compares Snowball vs Avalanche | `setViewMode('strategies')` |

### Dashboard View - AI Insights

| Button Text | Insight Type | Function | Handler |
|-------------|--------------|----------|---------|
| **Explore Options** | High Interest Alert | Opens Interest Savings calculator | `handleInsightAction('Explore Options')` |
| **Increase Payment** | Great Progress | Increases extra payment by $50 | `handleInsightAction('Increase Payment')` |
| **Calculate Savings** | Consolidation Opportunity | Opens calculators view | `handleInsightAction('Calculate Savings')` |
| **View Milestones** | Milestone Approaching | Scrolls to milestones section | `handleInsightAction('View Milestones')` |

### Dashboard View - Strategy Selection

| Button | Function | Handler |
|--------|----------|---------|
| **Snowball** | Selects Snowball strategy (smallest balance first) | `setStrategy('snowball')` |
| **Avalanche** | Selects Avalanche strategy (highest interest first) | `setStrategy('avalanche')` |

### Dashboard View - Extra Payment

| Button | Function | Handler |
|--------|----------|---------|
| **+$50** | Sets extra payment to $50 | `setExtraPayment(50)` |
| **+$100** | Sets extra payment to $100 | `setExtraPayment(100)` |
| **+$200** | Sets extra payment to $200 | `setExtraPayment(200)` |
| **+$500** | Sets extra payment to $500 | `setExtraPayment(500)` |
| **Slider** | Adjusts extra payment ($0-$2000) | `setExtraPayment(value)` |

### Dashboard View - Debt Cards

| Button | Icon | Function | Handler |
|--------|------|----------|---------|
| **Make Payment** | 💰 | Opens payment modal for this debt | `setShowPaymentModal(debtId)` |
| **Details** | ℹ️ | Expands to show debt details | `setExpandedDebt(debtId)` |
| **Delete** | 🗑️ | Deletes the debt (with confirmation) | `handleDeleteDebt(debtId)` |

### Payment Modal

| Button | Function | Handler |
|--------|----------|---------|
| **Minimum Payment** | Pays the minimum required amount | `handleQuickPayment(id, 'min')` |
| **Recommended** | Pays minimum + extra payment | `handleQuickPayment(id, 'recommended')` |
| **Pay** (Custom) | Pays custom entered amount | `handleQuickPayment(id, 'custom')` |
| **Cancel** | Closes modal without payment | `setShowPaymentModal(null)` |

### Charts View

| Chart | Interactive Elements | Function |
|-------|---------------------|----------|
| **Progress Donut** | Hover over segments | Shows paid vs remaining amounts |
| **Balance Projection** | Hover over line | Shows balance at each month |
| **Strategy Comparison** | Hover over bars | Shows exact values for each strategy |
| **Interest vs Principal** | Hover over lines | Shows monthly breakdown |
| **Debt Breakdown** | Hover over pie slices | Shows debt by type |

### Payments View

| Button | Icon | Function | Handler |
|--------|------|----------|---------|
| **Export CSV** | 📥 | Downloads payment history as CSV | `handleExport()` |
| **Search** | 🔍 | Filters payments by debt name/notes | `setSearchTerm(value)` |
| **Filter Dropdown** | 🔽 | Filters by date range | `setFilter(value)` |
| **Payment Row** | 👆 | Expands to show payment details | `setExpandedPayment(id)` |

### Calculators View

| Tab Button | Function | Handler |
|------------|----------|---------|
| **What-If Scenarios** | Opens scenario calculator | `setActiveCalculator('whatif')` |
| **Payoff Calculator** | Opens payoff date calculator | `setActiveCalculator('payoff')` |
| **Interest Savings** | Opens refinancing calculator | `setActiveCalculator('savings')` |

#### What-If Calculator

| Element | Function |
|---------|----------|
| **Debt Dropdown** | Selects which debt to analyze |
| **Extra Payment Slider** | Adjusts extra payment amount |

#### Payoff Calculator

| Element | Function |
|---------|----------|
| **Date Picker** | Sets target debt-free date |
| **Calculation** | Shows required monthly payment |

#### Interest Savings Calculator

| Element | Function |
|---------|----------|
| **Interest Rate Slider** | Sets new interest rate |
| **Calculation** | Shows potential savings |

### Strategies View

| Element | Function |
|---------|----------|
| **Snowball Card** | Displays Snowball method details |
| **Avalanche Card** | Displays Avalanche method details |
| **Savings Banner** | Shows comparison and recommendation |

## 🎯 Keyboard Shortcuts

| Key | Function |
|-----|----------|
| **Tab** | Navigate between interactive elements |
| **Enter** | Activate focused button |
| **Esc** | Close modals |
| **Arrow Keys** | Navigate within dropdowns |

## 🎨 Visual Indicators

### Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 **Live** (with Wifi icon) | Connected to backend |
| 🟠 **Offline** (with WifiOff icon) | Working offline, will sync later |
| ⚡ **Priority** badge | First debt to pay in selected strategy |
| 🤖 **Auto** badge | Automatic payment |

### Loading States

| State | Visual |
|-------|--------|
| **Initial Load** | Skeleton loaders |
| **Refreshing** | Spinning refresh icon |
| **Processing Payment** | Disabled buttons |
| **Syncing** | Toast notification |

### Color Coding

| Color | Meaning |
|-------|---------|
| 🔴 **Red** | Debt amounts, interest paid |
| 🟢 **Green** | Payments, progress, savings |
| 🔵 **Blue** | Information, current values |
| 🟣 **Purple** | Insights, AI recommendations |
| 🟡 **Yellow** | Warnings, milestones |

## 📱 Touch Gestures (Mobile)

| Gesture | Function |
|---------|----------|
| **Tap** | Select/activate button |
| **Swipe** | Scroll through tabs |
| **Long Press** | Show tooltip (where applicable) |

## ⚡ Quick Actions

### To Add a Debt
1. Click **Add Debt** button (top right)
2. Fill in form
3. Click **Add Debt** in modal

### To Make a Payment
1. Click **Make Payment** on debt card
2. Choose payment type
3. Click payment button

### To View Analytics
1. Click **Charts** tab
2. Hover over charts for details

### To Calculate Scenarios
1. Click **Calculators** tab
2. Select calculator type
3. Adjust sliders/inputs

### To Compare Strategies
1. Click **Strategies** tab
2. Review comparison
3. Click strategy card to select

### To Export Data
1. Click **Payments** tab
2. Click **Export CSV** button

## 🔧 Advanced Features

### Offline Queue
- All operations work offline
- Automatically sync when online
- View queue status in console

### Real-time Updates
- Auto-refresh every 30 seconds
- Instant UI updates via subscriptions
- Manual refresh available

### Smart Insights
- AI-powered recommendations
- Clickable action buttons
- Context-aware suggestions

## 📊 Data Flow

```
User Clicks Button
       ↓
Handler Function Called
       ↓
Service Layer (debtService)
       ↓
Check Online Status
       ↓
If Online: API Call → Backend
If Offline: localStorage → Queue
       ↓
Update Local State
       ↓
Notify Subscribers
       ↓
UI Updates Automatically
       ↓
Show Toast Notification
```

## 🎉 All Buttons Are Clickable!

Every button in the Debt Management system is **fully functional** and connected to:
- ✅ Backend API endpoints
- ✅ Local state management
- ✅ Real-time UI updates
- ✅ User feedback (toasts)
- ✅ Offline queue system

**No dummy buttons - everything works!** 🚀
