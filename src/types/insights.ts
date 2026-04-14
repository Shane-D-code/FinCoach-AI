export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  category: 'spending' | 'saving' | 'debt' | 'investment' | 'general';
  title: string;
  message: string;
  action?: InsightAction;
  priority: number;
  createdAt: string;
  read: boolean;
}

export interface InsightAction {
  label: string;
  route?: string;
  callback?: string;
}

export interface FinancialHealthScore {
  overall: number;
  breakdown: {
    savingsRatio: number;
    debtRatio: number;
    spendingBehavior: number;
    emergencyFund: number;
  };
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  recommendations: string[];
}

export interface AIAdvice {
  question: string;
  answer: string;
  confidence: number;
  relatedInsights: string[];
  actionItems: string[];
}
