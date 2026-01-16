import api from './api';

// Storage keys
const STORAGE_KEY = 'fincoach_debts';
const PAYMENTS_KEY = 'fincoach_debt_payments';
const OFFLINE_QUEUE_KEY = 'fincoach_debt_offline_queue';

// Update interval for real-time features (milliseconds)
const UPDATE_INTERVAL = 30000;

// Types
export interface Debt {
  id: number;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
  type: 'credit' | 'loan' | 'student' | 'mortgage' | 'auto' | 'medical' | 'other';
  typeDisplayName?: string;
  originalBalance?: number;
  progressPercentage?: number;
  isActive?: boolean;
  isPaidOff?: boolean;
  notes?: string;
  dueDay?: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
  monthsToPayoff?: number;
  recommendedPayment?: number;
  totalInterest?: number;
  monthlyInterest?: number;
}

export interface DebtSummary {
  totalDebt: number;
  totalOriginalDebt: number;
  totalMinPayment: number;
  totalMonthlyInterest: number;
  averageInterestRate: number;
  highestInterestRate: number;
  lowestInterestRate: number;
  estimatedPayoffMonths: number;
  totalDebts: number;
  activeDebts: number;
  paidOffDebts: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  progressPercentage: number;
  recommendedStrategy: string;
  strategyComparison?: StrategyComparison;
  payoffPlans: PayoffPlan[];
  nextMilestone?: MilestoneInfo;
  milestones?: MilestoneInfo[];
}

export interface PayoffPlan {
  debtId: number;
  debtName: string;
  debtType: string;
  currentBalance: number;
  minPayment: number;
  recommendedPayment: number;
  extraPayment: number;
  totalPayment: number;
  monthsToPayoff: number;
  totalInterest: number;
  monthlyInterest: number;
  priority: number;
  isPriority: boolean;
  progressPercentage: number;
}

export interface StrategyComparison {
  snowball: StrategyInfo;
  avalanche: StrategyInfo;
  savings: SavingsInfo;
}

export interface StrategyInfo {
  payoffMonths: number;
  totalInterest: number;
  monthlyPayment: number;
}

export interface SavingsInfo {
  interestSaved: number;
  timeSavedMonths: number;
  recommendation: string;
}

export interface MilestoneInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  currentValue: number;
  percentage: number;
  isCompleted: boolean;
  completedDate?: string;
  estimatedCompletionDate?: string;
  daysRemaining?: number;
}

export interface DebtPayment {
  id: number;
  debtId: number;
  debtName: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  interestPaid: number;
  principalPaid: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
  isAutomatic?: boolean;
}

export interface DebtFormData {
  name: string;
  balance: string;
  interestRate: string;
  minPayment: string;
  type: 'credit' | 'loan' | 'student' | 'mortgage' | 'auto' | 'medical' | 'other';
  notes?: string;
  dueDay?: number;
}

interface OfflineOperation {
  id: string;
  type: 'add' | 'update' | 'delete' | 'payment';
  data: any;
  timestamp: string;
}

class DebtService {
  private debts: Debt[] = [];
  private payments: DebtPayment[] = [];
  private subscribers: ((debts: Debt[]) => void)[] = [];
  private paymentSubscribers: ((payments: DebtPayment[]) => void)[] = [];
  private nextId = 1;
  private updateInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
    this.setupSyncInterval();
  }

  // ==================== Subscription Pattern ====================

  subscribe(callback: (debts: Debt[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.debts); // Send current state immediately
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  subscribeToPayments(callback: (payments: DebtPayment[]) => void): () => void {
    this.paymentSubscribers.push(callback);
    callback(this.payments);
    return () => {
      this.paymentSubscribers = this.paymentSubscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.debts]));
  }

  private notifyPaymentSubscribers() {
    this.paymentSubscribers.forEach(callback => callback([...this.payments]));
  }

  // ==================== Online/Offline Handling ====================

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupSyncInterval() {
    // Sync every 30 seconds if online
    this.updateInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineOperations();
        this.refreshDebts();
      }
    }, UPDATE_INTERVAL);
  }

  // ==================== Storage ====================

  private loadFromStorage() {
    try {
      const storedDebts = localStorage.getItem(STORAGE_KEY);
      if (storedDebts) {
        this.debts = JSON.parse(storedDebts);
      }

      const storedPayments = localStorage.getItem(PAYMENTS_KEY);
      if (storedPayments) {
        this.payments = JSON.parse(storedPayments);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.debts = [];
      this.payments = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.debts));
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(this.payments));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // ==================== Offline Queue ====================

  private getOfflineQueue(): OfflineOperation[] {
    try {
      const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }

  private saveOfflineQueue(queue: OfflineOperation[]) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  private addToOfflineQueue(operation: OfflineOperation) {
    const queue = this.getOfflineQueue();
    queue.push(operation);
    this.saveOfflineQueue(queue);
  }

  async syncOfflineOperations() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline operations...`);

    const remainingQueue: OfflineOperation[] = [];

    for (const operation of queue) {
      try {
        switch (operation.type) {
          case 'add':
            await this.syncAddDebt(operation.data);
            break;
          case 'update':
            await this.syncUpdateDebt(operation.data);
            break;
          case 'delete':
            await this.syncDeleteDebt(operation.data);
            break;
          case 'payment':
            await this.syncPayment(operation.data);
            break;
          default:
            remainingQueue.push(operation);
        }
      } catch (error) {
        console.error('Failed to sync operation:', operation, error);
        remainingQueue.push(operation);
      }
    }

    this.saveOfflineQueue(remainingQueue);
    console.log(`Sync complete. ${remainingQueue.length} operations remaining.`);
  }

  // ==================== API Integration ====================

  private async syncAddDebt(data: DebtFormData) {
    const response = await api.post('/debts', data);
    if (response.data?.data) {
      const newDebt = this.mapApiDebtToDebt(response.data.data);
      const existingIndex = this.debts.findIndex(d => d.id === newDebt.id);
      if (existingIndex >= 0) {
        this.debts[existingIndex] = newDebt;
      } else {
        this.debts.push(newDebt);
      }
    }
  }

  private async syncUpdateDebt(data: { id: number; updates: DebtFormData }) {
    const response = await api.put(`/debts/${data.id}`, data.updates);
    if (response.data?.data) {
      const updatedDebt = this.mapApiDebtToDebt(response.data.data);
      const index = this.debts.findIndex(d => d.id === data.id);
      if (index >= 0) {
        this.debts[index] = updatedDebt;
      }
    }
  }

  private async syncDeleteDebt(data: { id: number }) {
    await api.delete(`/debts/${data.id}`);
    this.debts = this.debts.filter(d => d.id !== data.id);
  }

  private async syncPayment(data: { debtId: number; amount: number; paymentMethod?: string; notes?: string }) {
    const response = await api.post(`/debts/${data.debtId}/payment`, data);
    if (response.data?.data) {
      const payment = this.mapApiPaymentToPayment(response.data.data);
      this.payments.unshift(payment);
      this.notifyPaymentSubscribers();
    }
  }

  // ==================== CRUD Operations ====================

  async getDebts(): Promise<Debt[]> {
    if (this.isOnline) {
      try {
        const response = await api.get('/debts');
        if (response.data?.data) {
          this.debts = response.data.data.map((d: any) => this.mapApiDebtToDebt(d));
          this.saveToStorage();
          this.notifySubscribers();
          return this.debts;
        }
      } catch (error) {
        console.error('Error fetching debts from API:', error);
      }
    }
    
    // Return cached data if offline or API fails
    return this.debts;
  }

  async addDebt(debt: DebtFormData): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await api.post('/debts', debt);
        if (response.data?.data) {
          const newDebt = this.mapApiDebtToDebt(response.data.data);
          this.debts.push(newDebt);
          this.saveToStorage();
          this.notifySubscribers();
          return;
        }
      } catch (error) {
        console.error('Error adding debt via API:', error);
      }
    }

    // Offline: queue the operation
    const newDebt: Debt = {
      ...debt,
      id: this.nextId++,
      balance: parseFloat(debt.balance),
      interestRate: parseFloat(debt.interestRate),
      minPayment: parseFloat(debt.minPayment),
      lastUpdated: new Date().toISOString(),
      originalBalance: parseFloat(debt.balance),
      progressPercentage: 0,
      isActive: true,
      isPaidOff: false
    };

    this.debts.push(newDebt);
    this.saveToStorage();
    this.notifySubscribers();

    this.addToOfflineQueue({
      id: crypto.randomUUID(),
      type: 'add',
      data: debt,
      timestamp: new Date().toISOString()
    });
  }

  async updateDebt(id: number, updates: Partial<DebtFormData>): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await api.put(`/debts/${id}`, updates);
        if (response.data?.data) {
          const updatedDebt = this.mapApiDebtToDebt(response.data.data);
          const index = this.debts.findIndex(d => d.id === id);
          if (index >= 0) {
            this.debts[index] = updatedDebt;
            this.saveToStorage();
            this.notifySubscribers();
            return;
          }
        }
      } catch (error) {
        console.error('Error updating debt via API:', error);
      }
    }

    // Offline
    const index = this.debts.findIndex(d => d.id === id);
    if (index >= 0) {
      this.debts[index] = {
        ...this.debts[index],
        ...updates,
        balance: updates.balance ? parseFloat(updates.balance) : this.debts[index].balance,
        interestRate: updates.interestRate ? parseFloat(updates.interestRate) : this.debts[index].interestRate,
        minPayment: updates.minPayment ? parseFloat(updates.minPayment) : this.debts[index].minPayment,
        lastUpdated: new Date().toISOString()
      };
      this.saveToStorage();
      this.notifySubscribers();

      this.addToOfflineQueue({
        id: crypto.randomUUID(),
        type: 'update',
        data: { id, updates },
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteDebt(id: number): Promise<void> {
    if (this.isOnline) {
      try {
        await api.delete(`/debts/${id}`);
        this.debts = this.debts.filter(d => d.id !== id);
        this.saveToStorage();
        this.notifySubscribers();
        return;
      } catch (error) {
        console.error('Error deleting debt via API:', error);
      }
    }

    // Offline
    this.debts = this.debts.filter(d => d.id !== id);
    this.saveToStorage();
    this.notifySubscribers();

    this.addToOfflineQueue({
      id: crypto.randomUUID(),
      type: 'delete',
      data: { id },
      timestamp: new Date().toISOString()
    });
  }

  // ==================== Payment Operations ====================

  async makePayment(debtId: number, amount: number, paymentMethod?: string, notes?: string): Promise<boolean> {
    const debt = this.debts.find(d => d.id === debtId);
    if (!debt || amount <= 0 || amount > debt.balance) {
      return false;
    }

    if (this.isOnline) {
      try {
        const response = await api.post(`/debts/${debtId}/payment`, {
          amount,
          paymentMethod,
          notes
        });

        if (response.data?.data) {
          const payment = this.mapApiPaymentToPayment(response.data.data);
          this.payments.unshift(payment);
          
          // Update debt balance
          const debtIndex = this.debts.findIndex(d => d.id === debtId);
          if (debtIndex >= 0) {
            this.debts[debtIndex].balance -= amount;
            this.debts[debtIndex].lastUpdated = new Date().toISOString();
            
            // Remove if paid off
            if (this.debts[debtIndex].balance <= 0.01) {
              this.debts[debtIndex].isPaidOff = true;
              this.debts[debtIndex].isActive = false;
              this.debts = this.debts.filter(d => d.id !== debtId);
            }
          }
          
          this.saveToStorage();
          this.notifySubscribers();
          this.notifyPaymentSubscribers();
          return true;
        }
      } catch (error) {
        console.error('Error making payment via API:', error);
      }
    }

    // Offline payment
    const balanceBefore = debt.balance;
    const balanceAfter = Math.max(0, debt.balance - amount);
    const monthlyRate = debt.interestRate / 100 / 12;
    const interestPortion = balanceBefore * monthlyRate;
    const principalPortion = amount - interestPortion;

    const payment: DebtPayment = {
      id: this.nextId++,
      debtId,
      debtName: debt.name,
      amount,
      balanceBefore,
      balanceAfter,
      interestPaid: interestPortion,
      principalPaid: principalPortion,
      paymentDate: new Date().toISOString(),
      paymentMethod,
      notes,
      isAutomatic: false
    };

    this.payments.unshift(payment);
    
    // Update debt
    const debtIndex = this.debts.findIndex(d => d.id === debtId);
    if (debtIndex >= 0) {
      this.debts[debtIndex].balance = balanceAfter;
      this.debts[debtIndex].lastUpdated = new Date().toISOString();

      if (balanceAfter <= 0.01) {
        this.debts[debtIndex].isPaidOff = true;
        this.debts[debtIndex].isActive = false;
        this.debts = this.debts.filter(d => d.id !== debtId);
      }
    }

    this.saveToStorage();
    this.notifySubscribers();
    this.notifyPaymentSubscribers();

    // Queue for sync
    this.addToOfflineQueue({
      id: crypto.randomUUID(),
      type: 'payment',
      data: { debtId, amount, paymentMethod, notes },
      timestamp: new Date().toISOString()
    });

    return true;
  }

  async getPaymentHistory(debtId?: number): Promise<DebtPayment[]> {
    if (this.isOnline) {
      try {
        const url = debtId 
          ? `/debts/${debtId}/payments` 
          : '/debts/payments/all';
        const response = await api.get(url);
        
        if (response.data?.data) {
          this.payments = response.data.data.map((p: any) => this.mapApiPaymentToPayment(p));
          this.saveToStorage();
          this.notifyPaymentSubscribers();
          return this.payments;
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
      }
    }

    // Return cached
    if (debtId) {
      return this.payments.filter(p => p.debtId === debtId);
    }
    return this.payments;
  }

  // ==================== Summary & Analysis ====================

  async getDebtSummary(extraPayment: number = 200): Promise<DebtSummary | null> {
    if (this.isOnline) {
      try {
        const response = await api.get('/debts/summary', {
          params: { extraPayment }
        });
        
        if (response.data?.data) {
          return this.mapApiSummaryToSummary(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching debt summary:', error);
      }
    }

    // Calculate from local data
    return this.calculateLocalSummary(extraPayment);
  }

  async compareStrategies(extraPayment: number = 200): Promise<StrategyComparison | null> {
    if (this.isOnline) {
      try {
        const response = await api.get('/debts/compare', {
          params: { extraPayment }
        });
        
        if (response.data?.data) {
          return this.mapApiComparisonToComparison(response.data.data);
        }
      } catch (error) {
        console.error('Error comparing strategies:', error);
      }
    }

    return null;
  }

  // ==================== Local Calculations ====================

  calculateDebtSummary(strategy: 'snowball' | 'avalanche', extraPayment: number): DebtSummary {
    return this.calculateLocalSummary(extraPayment);
  }

  compareLocalStrategies(extraPayment: number): StrategyComparison {
    const avalanche = this.calculateLocalSummary(extraPayment, 'avalanche');
    const snowball = this.calculateLocalSummary(extraPayment, 'snowball');

    const avalancheInterest = avalanche.payoffPlans.reduce((sum, plan) => sum + plan.totalInterest, 0);
    const snowballInterest = snowball.payoffPlans.reduce((sum, plan) => sum + plan.totalInterest, 0);

    return {
      avalanche: {
        payoffMonths: avalanche.estimatedPayoffMonths,
        totalInterest: avalancheInterest,
        monthlyPayment: avalanche.totalMinPayment + extraPayment
      },
      snowball: {
        payoffMonths: snowball.estimatedPayoffMonths,
        totalInterest: snowballInterest,
        monthlyPayment: snowball.totalMinPayment + extraPayment
      },
      savings: {
        interestSaved: Math.max(0, snowballInterest - avalancheInterest),
        timeSaved: Math.max(0, snowball.estimatedPayoffMonths - avalanche.estimatedPayoffMonths),
        recommendation: ''
      }
    };
  }

  private calculateLocalSummary(extraPayment: number, strategy: 'snowball' | 'avalanche' = 'avalanche'): DebtSummary {
    if (this.debts.length === 0) {
      return {
        totalDebt: 0,
        totalOriginalDebt: 0,
        totalMinPayment: 0,
        totalMonthlyInterest: 0,
        averageInterestRate: 0,
        highestInterestRate: 0,
        lowestInterestRate: 0,
        estimatedPayoffMonths: 0,
        totalDebts: 0,
        activeDebts: 0,
        paidOffDebts: 0,
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
        progressPercentage: 0,
        recommendedStrategy: 'avalanche',
        payoffPlans: []
      };
    }

    const sortedDebts = [...this.debts].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.interestRate - a.interestRate;
      } else {
        return a.balance - b.balance;
      }
    });

    let totalDebt = 0;
    let totalOriginalDebt = 0;
    let totalMinPayment = 0;
    let totalMonthlyInterest = 0;
    let highestInterestRate = 0;
    let lowestInterestRate = Infinity;

    for (const debt of this.debts) {
      totalDebt += debt.balance;
      totalOriginalDebt += debt.originalBalance || debt.balance;
      totalMinPayment += debt.minPayment;
      
      const monthlyRate = debt.interestRate / 100 / 12;
      totalMonthlyInterest += debt.balance * monthlyRate;
      
      highestInterestRate = Math.max(highestInterestRate, debt.interestRate);
      lowestInterestRate = Math.min(lowestInterestRate, debt.interestRate);
    }

    // Calculate payoff plans
    const payoffPlans: PayoffPlan[] = [];
    let remainingExtraPayment = extraPayment;
    let maxPayoffMonths = 0;

    for (let i = 0; i < sortedDebts.length; i++) {
      const debt = sortedDebts[i];
      const isPriority = i === 0;
      const availableExtra = isPriority ? remainingExtraPayment : 0;

      const recommendedPayment = debt.minPayment + availableExtra;
      const monthlyRate = debt.interestRate / 100 / 12;
      const monthsToPayoff = this.calculatePayoffTime(debt.balance, recommendedPayment, monthlyRate);
      const totalInterest = this.calculateTotalInterest(debt.balance, recommendedPayment, monthlyRate);
      const progressPercentage = debt.originalBalance 
        ? ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100 
        : 0;

      payoffPlans.push({
        debtId: debt.id,
        debtName: debt.name,
        debtType: debt.type,
        currentBalance: debt.balance,
        minPayment: debt.minPayment,
        recommendedPayment,
        extraPayment: availableExtra,
        totalPayment: recommendedPayment,
        monthsToPayoff,
        totalInterest,
        monthlyInterest: debt.balance * monthlyRate,
        priority: i + 1,
        isPriority,
        progressPercentage
      });

      maxPayoffMonths = Math.max(maxPayoffMonths, monthsToPayoff);
      if (isPriority) {
        remainingExtraPayment -= availableExtra;
      }
    }

    // Calculate total paid
    const totalInterestPaid = this.payments.reduce((sum, p) => sum + p.interestPaid, 0);
    const totalPrincipalPaid = this.payments.reduce((sum, p) => sum + p.principalPaid, 0);

    // Progress
    const progressPercentage = totalOriginalDebt > 0 
      ? ((totalOriginalDebt - totalDebt) / totalOriginalDebt) * 100 
      : 0;

    // Average interest rate
    const averageInterestRate = this.debts.reduce((sum, d) => sum + d.interestRate, 0) / this.debts.length;

    return {
      totalDebt,
      totalOriginalDebt,
      totalMinPayment,
      totalMonthlyInterest,
      averageInterestRate,
      highestInterestRate,
      lowestInterestRate: lowestInterestRate === Infinity ? 0 : lowestInterestRate,
      estimatedPayoffMonths: maxPayoffMonths,
      totalDebts: this.debts.length,
      activeDebts: this.debts.filter(d => d.isActive !== false).length,
      paidOffDebts: this.debts.filter(d => d.isPaidOff).length,
      totalInterestPaid,
      totalPrincipalPaid,
      progressPercentage,
      recommendedStrategy: 'avalanche',
      payoffPlans: payoffPlans.sort((a, b) => {
        if (strategy === 'avalanche') {
          return b.monthlyInterest - a.monthlyInterest;
        } else {
          return a.currentBalance - b.currentBalance;
        }
      })
    };
  }

  private calculatePayoffTime(balance: number, monthlyPayment: number, monthlyRate: number): number {
    if (monthlyRate === 0) {
      return Math.ceil(balance / monthlyPayment);
    }

    if (monthlyPayment <= balance * monthlyRate) {
      return Infinity;
    }

    const numerator = -Math.log(1 - (balance * monthlyRate) / monthlyPayment);
    const denominator = Math.log(1 + monthlyRate);
    return Math.ceil(numerator / denominator);
  }

  private calculateTotalInterest(balance: number, monthlyPayment: number, monthlyRate: number): number {
    let totalInterest = 0;
    let remainingBalance = balance;
    let months = 0;

    while (remainingBalance > 0.01 && months < 600) {
      const interest = remainingBalance * monthlyRate;
      totalInterest += interest;
      const principal = monthlyPayment - interest;
      remainingBalance -= principal;
      months++;
    }

    return totalInterest;
  }

  async refreshDebts() {
    await this.getDebts();
  }

  getConnectionStatus() {
    return this.isOnline;
  }

  // ==================== Mapping Helpers ====================

  private mapApiDebtToDebt(apiDebt: any): Debt {
    return {
      id: apiDebt.id,
      name: apiDebt.name,
      balance: parseFloat(apiDebt.balance),
      interestRate: parseFloat(apiDebt.interestRate),
      minPayment: parseFloat(apiDebt.minPayment),
      type: apiDebt.type,
      typeDisplayName: apiDebt.typeDisplayName,
      originalBalance: parseFloat(apiDebt.originalBalance),
      progressPercentage: parseFloat(apiDebt.progressPercentage),
      isActive: apiDebt.isActive,
      isPaidOff: apiDebt.isPaidOff,
      notes: apiDebt.notes,
      dueDay: apiDebt.dueDay,
      lastUpdated: apiDebt.updatedAt,
      createdAt: apiDebt.createdAt,
      updatedAt: apiDebt.updatedAt,
      monthsToPayoff: apiDebt.monthsToPayoff,
      recommendedPayment: parseFloat(apiDebt.recommendedPayment),
      totalInterest: parseFloat(apiDebt.totalInterest),
      monthlyInterest: parseFloat(apiDebt.monthlyInterest)
    };
  }

  private mapApiPaymentToPayment(apiPayment: any): DebtPayment {
    return {
      id: apiPayment.id,
      debtId: apiPayment.debtId,
      debtName: apiPayment.debtName,
      amount: parseFloat(apiPayment.amount),
      balanceBefore: parseFloat(apiPayment.balanceBefore),
      balanceAfter: parseFloat(apiPayment.balanceAfter),
      interestPaid: parseFloat(apiPayment.interestPaid || 0),
      principalPaid: parseFloat(apiPayment.principalPaid || 0),
      paymentDate: apiPayment.paymentDate,
      paymentMethod: apiPayment.paymentMethod,
      notes: apiPayment.notes,
      isAutomatic: apiPayment.isAutomatic
    };
  }

  private mapApiSummaryToSummary(apiSummary: any): DebtSummary {
    return {
      totalDebt: parseFloat(apiSummary.totalDebt),
      totalOriginalDebt: parseFloat(apiSummary.totalOriginalDebt),
      totalMinPayment: parseFloat(apiSummary.totalMinPayment),
      totalMonthlyInterest: parseFloat(apiSummary.totalMonthlyInterest),
      averageInterestRate: parseFloat(apiSummary.averageInterestRate),
      highestInterestRate: parseFloat(apiSummary.highestInterestRate),
      lowestInterestRate: parseFloat(apiSummary.lowestInterestRate),
      estimatedPayoffMonths: apiSummary.estimatedPayoffMonths,
      totalDebts: apiSummary.totalDebts,
      activeDebts: apiSummary.activeDebts,
      paidOffDebts: apiSummary.paidOffDebts,
      totalInterestPaid: parseFloat(apiSummary.totalInterestPaid),
      totalPrincipalPaid: parseFloat(apiSummary.totalPrincipalPaid),
      progressPercentage: parseFloat(apiSummary.progressPercentage),
      recommendedStrategy: apiSummary.recommendedStrategy,
      strategyComparison: apiSummary.strategyComparison ? this.mapApiComparisonToComparison(apiSummary.strategyComparison) : undefined,
      payoffPlans: (apiSummary.payoffPlans || []).map((plan: any) => ({
        debtId: plan.debtId,
        debtName: plan.debtName,
        debtType: plan.debtType,
        currentBalance: parseFloat(plan.currentBalance),
        minPayment: parseFloat(plan.minPayment),
        recommendedPayment: parseFloat(plan.recommendedPayment),
        extraPayment: parseFloat(plan.extraPayment),
        totalPayment: parseFloat(plan.totalPayment),
        monthsToPayoff: plan.monthsToPayoff,
        totalInterest: parseFloat(plan.totalInterest),
        monthlyInterest: parseFloat(plan.monthlyInterest),
        priority: plan.priority,
        isPriority: plan.isPriority,
        progressPercentage: parseFloat(plan.progressPercentage)
      })),
      nextMilestone: apiSummary.nextMilestone,
      milestones: apiSummary.milestones
    };
  }

  private mapApiComparisonToComparison(apiComparison: any): StrategyComparison {
    return {
      snowball: {
        payoffMonths: apiComparison.snowball?.payoffMonths || 0,
        totalInterest: parseFloat(apiComparison.snowball?.totalInterest || 0),
        monthlyPayment: parseFloat(apiComparison.snowball?.monthlyPayment || 0)
      },
      avalanche: {
        payoffMonths: apiComparison.avalanche?.payoffMonths || 0,
        totalInterest: parseFloat(apiComparison.avalanche?.totalInterest || 0),
        monthlyPayment: parseFloat(apiComparison.avalanche?.monthlyPayment || 0)
      },
      savings: {
        interestSaved: parseFloat(apiComparison.savings?.interestSaved || 0),
        timeSavedMonths: apiComparison.savings?.timeSavedMonths || 0,
        recommendation: apiComparison.savings?.recommendation || ''
      }
    };
  }

  // Cleanup
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const debtService = new DebtService();
export default debtService;

