import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Auth request types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  verified: boolean;
}

export interface AuthResponse extends User {
  token: string;
}

// JWT Token Management
const TOKEN_KEY = 'fincoach_jwt_token';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token && tokenManager.isTokenValid()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      const pathname = window.location.pathname;
      if (!['/', '/register', '/login', '/verify-otp'].includes(pathname)) {
        window.location.href = '/login';
      }
      console.log(`401 ignored on public route: ${pathname}`);
    }
    return Promise.reject(error);
  }
);

// API Methods

// Authentication APIs
export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<string> = await api.post('/auth/register', data);
    return { success: response.status === 200, message: response.data, data: response.data };
  },

  verifyOtp: async (data: OtpVerificationRequest): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<string> = await api.post('/auth/verify-email-otp', data);
    return { success: response.status === 200, message: response.data, data: response.data };
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    if (response.status === 200 && response.data) {
      tokenManager.setToken(response.data.token);
      return { success: true, message: 'Login successful', data: response.data };
    }
    return { success: false, message: 'Login failed', data: undefined };
  },

  resendOtp: async (email: string): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/me');
    return response.data;
  },

  logout: (): void => {
    tokenManager.removeToken();
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<boolean> => {
    try {
      await api.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};

// ML Services
export const mlApi = {
  getNearbyDeals: async (latitude: number, longitude: number, radius: number = 5): Promise<any> => {
    const response = await api.post('/ml/nearby/deals', {
      latitude,
      longitude,
      radius_km: radius
    });
    return response.data;
  },

  simulatePurchase: async (data: { currentBalance: number; monthlyIncome: number; monthlyExpenses: number; purchaseAmount: number }) => {
    const response = await api.post('/ml/scenario/purchase', data);
    return response.data;
  },

  forecastExpenses: async (data: {
    userId?: number;
    monthlyIncome: number;
    currentExpenses: number;
    category?: string;
    months?: number;
  }) => {
    const response = await api.post('/ml/expense/forecast', data);
    return response.data;
  },

  analyzePortfolio: async (data: {
    items: {
      symbol: string;
      quantity: number;
      purchase_price: number;
    }[]
  }) => {
    const response = await api.post('/ml/market/portfolio', data);
    return response.data;
  },

  assessRisk: async (data: { [key: string]: any }) => {
    const response = await api.post('/ml/risk/assess', { data });
    return response.data;
  },

  simulateScenario: async (data: {
    currentBalance: number;
    monthlyIncome: number;
    targetSavings: number;
    months: number;
  }) => {
    const response = await api.post('/ml/scenario/simulate', data);
    return response.data;
  },

  // OCR Services
  analyzeBankStatement: async (formData: FormData) => {
    const response = await api.post('/ml/bank/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as BankAnalysisResponse;
  },

  // Existing OCR
  scanBill: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ml/ocr/scan-bill', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  scanBillBase64: async (imageBase64: string) => {
    const response = await api.post('/ml/ocr/scan-bill-base64', imageBase64, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    return response.data;
  }
};

export default api;
