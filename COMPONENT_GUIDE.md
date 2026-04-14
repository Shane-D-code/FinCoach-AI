# Component Guide - Visual Reference

## 🎨 Component Hierarchy

```
DashboardNew
├── HealthScoreRing (Financial Health Score)
│   ├── Animated SVG ring
│   ├── Score display (0-100)
│   └── Grade label
│
├── InsightsPanel (AI Insights)
│   ├── Insight cards
│   │   ├── Icon (warning/success/info/tip)
│   │   ├── Title & message
│   │   └── Action button
│   └── Empty state
│
├── ActionableCard (CTA Cards)
│   ├── Icon with gradient
│   ├── Title & description
│   └── Action button
│
├── Quick Stats (4 cards)
│   ├── AnimatedCounter
│   ├── Icon
│   └── Label
│
├── Charts
│   ├── Monthly Trend (LineChart)
│   └── Category Breakdown (BarChart)
│
└── BankUpload Modal
    ├── Drag & drop area
    ├── File preview
    ├── Transaction preview
    └── Import button
```

## 📦 Component Props Reference

### HealthScoreRing

```typescript
interface HealthScoreRingProps {
  score: number;           // 0-100
  size?: number;           // Default: 200px
  strokeWidth?: number;    // Default: 12px
  animated?: boolean;      // Default: true
}

// Usage
<HealthScoreRing score={85} size={180} animated={true} />
```

**Visual**: Circular progress ring with animated fill, center shows score and grade.

---

### InsightsPanel

```typescript
interface InsightsPanelProps {
  insights: Insight[];
  onMarkAsRead?: (id: string) => void;
  maxDisplay?: number;     // Default: 5
}

interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  category: 'spending' | 'saving' | 'debt' | 'investment' | 'general';
  title: string;
  message: string;
  action?: { label: string; route?: string };
  priority: number;
  createdAt: string;
  read: boolean;
}

// Usage
<InsightsPanel 
  insights={insights} 
  onMarkAsRead={handleRead}
  maxDisplay={5}
/>
```

**Visual**: Stacked cards with icons, each insight has color-coded background based on type.

---

### ActionableCard

```typescript
interface ActionableCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'yellow';
  gradient?: string;
}

// Usage
<ActionableCard
  title="Optimize Your Budget"
  description="Get AI-powered suggestions"
  icon={Target}
  action={{ label: 'Start', route: '/budget' }}
  color="indigo"
  gradient="from-indigo-500 to-purple-500"
/>
```

**Visual**: Card with gradient icon, hover effect scales up and shows gradient background.

---

### BankUpload

```typescript
interface BankUploadProps {
  onTransactionsImported?: (transactions: ParsedTransaction[]) => void;
  onClose?: () => void;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  selected: boolean;
}

// Usage
<BankUpload
  onClose={() => setShow(false)}
  onTransactionsImported={handleImport}
/>
```

**Visual**: Full-screen modal with 3 steps:
1. Upload (drag & drop area)
2. Preview (transaction list with checkboxes)
3. Success (checkmark animation)

---

### AnimatedCounter

```typescript
interface AnimatedCounterProps {
  value: number;
  duration?: number;       // Default: 1000ms
  prefix?: string;         // e.g., "₹"
  suffix?: string;         // e.g., "%"
  decimals?: number;       // Default: 0
  className?: string;
}

// Usage
<AnimatedCounter 
  value={50000} 
  prefix="₹" 
  duration={1500}
  decimals={0}
/>
```

**Visual**: Number that smoothly animates from 0 to target value with easing.

---

### SkeletonLoader

```typescript
interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'chart';
  count?: number;          // Default: 1
  className?: string;
}

// Usage
<SkeletonLoader variant="card" count={3} />
<SkeletonLoader variant="chart" />
```

**Visual**: Pulsing gray placeholders matching the shape of actual content.

---

### FinancialAdvisorChat

```typescript
interface FinancialAdvisorChatProps {
  className?: string;
}

// Usage
<FinancialAdvisorChat className="h-[600px]" />
```

**Visual**: Chat interface with:
- Header (AI icon + title)
- Message list (user/assistant bubbles)
- Suggested questions (chips)
- Input field with send button

---

## 🎨 Color Coding

### Health Score Colors
- **Excellent (80-100)**: `#22C55E` (green)
- **Good (60-79)**: `#3B82F6` (blue)
- **Fair (40-59)**: `#F59E0B` (yellow)
- **Poor (0-39)**: `#EF4444` (red)

### Insight Types
- **Warning**: Yellow (`#F59E0B`)
- **Success**: Green (`#22C55E`)
- **Info**: Blue (`#3B82F6`)
- **Tip**: Purple (`#A855F7`)

### Transaction Types
- **Income**: Green (`#22C55E`)
- **Expense**: Red (`#EF4444`)

## 📐 Layout Patterns

### Dashboard Grid
```
┌─────────────────────────────────────┐
│  Header + Upload Button             │
├─────────────────────────────────────┤
│  Health Score Section (2 columns)   │
│  ├─ Ring + Breakdown                │
│  └─ Recommendations                 │
├─────────────────────────────────────┤
│  Quick Stats (4 columns)            │
│  ├─ Income  ├─ Expenses             │
│  ├─ Savings └─ Rate                 │
├─────────────────────────────────────┤
│  AI Insights Panel                  │
├─────────────────────────────────────┤
│  Actionable Cards (3 columns)       │
│  ├─ Budget  ├─ Debt  └─ Deals      │
├─────────────────────────────────────┤
│  Charts (2 columns)                 │
│  ├─ Monthly Trend                   │
│  └─ Category Breakdown              │
└─────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────┐
│  Header      │
├──────────────┤
│  Upload Btn  │
├──────────────┤
│  Health      │
│  Score       │
├──────────────┤
│  Stats       │
│  (stacked)   │
├──────────────┤
│  Insights    │
├──────────────┤
│  Actions     │
│  (stacked)   │
├──────────────┤
│  Charts      │
│  (stacked)   │
└──────────────┘
```

## 🎭 Animation Patterns

### Entry Animations
```typescript
// Stagger children
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: index * 0.1 }
}
```

### Hover Effects
```typescript
// Scale up
whileHover={{ scale: 1.02, y: -4 }}
whileTap={{ scale: 0.98 }}
```

### Number Animations
```typescript
// Ease out cubic
const easeOut = 1 - Math.pow(1 - progress, 3);
```

### Progress Animations
```typescript
// SVG circle
strokeDashoffset={circumference - (score / 100) * circumference}
transition={{ duration: 1.5, ease: 'easeOut' }}
```

## 🔧 Customization Examples

### Change Health Score Thresholds

```typescript
// In src/utils/formatters.ts
export const getHealthScoreColor = (score: number): string => {
  if (score >= 85) return '#22C55E'; // Excellent (was 80)
  if (score >= 70) return '#3B82F6'; // Good (was 60)
  if (score >= 50) return '#F59E0B'; // Fair (was 40)
  return '#EF4444'; // Poor
};
```

### Add New Insight Type

```typescript
// In src/types/insights.ts
type: 'warning' | 'success' | 'info' | 'tip' | 'urgent'

// In InsightsPanel.tsx
case 'urgent':
  return 'text-red-500 bg-red-500/10 border-red-500/20';
```

### Customize Animation Duration

```typescript
// In HealthScoreRing.tsx
const duration = 2000; // Slower animation

// In AnimatedCounter.tsx
<AnimatedCounter value={100} duration={2000} />
```

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints used
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### Grid Responsiveness
```typescript
// 4 columns on desktop, 2 on tablet, 1 on mobile
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// 3 columns on desktop, 1 on mobile
className="grid grid-cols-1 md:grid-cols-3 gap-4"
```

## 🎯 Best Practices

### 1. Always Show Loading States
```typescript
{loading ? (
  <SkeletonLoader variant="card" />
) : (
  <ActualContent />
)}
```

### 2. Handle Empty States
```typescript
{data.length === 0 ? (
  <EmptyState message="No data available" />
) : (
  <DataDisplay data={data} />
)}
```

### 3. Use Proper Error Boundaries
```typescript
{error ? (
  <ErrorMessage error={error} />
) : (
  <Content />
)}
```

### 4. Optimize Animations
```typescript
// Use transform instead of position
transform: translateY(-4px) // Good
top: -4px // Bad (causes reflow)
```

### 5. Accessibility
```typescript
// Add ARIA labels
<button aria-label="Upload bank statement">
  <Upload />
</button>

// Keyboard navigation
onKeyPress={(e) => e.key === 'Enter' && handleAction()}
```

---

**This guide covers all new components. Mix and match to create your perfect fintech UI! 🎨**
