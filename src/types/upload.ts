export interface BankStatementUpload {
  file: File;
  type: 'csv' | 'pdf';
  status: 'pending' | 'parsing' | 'success' | 'error';
  progress: number;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  selected: boolean;
}

export interface UploadResult {
  success: boolean;
  message: string;
  transactions: ParsedTransaction[];
  summary: {
    total: number;
    income: number;
    expenses: number;
  };
}

export interface OCRResult {
  merchant: string;
  total: number;
  date: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
  confidence: number;
  rawText: string;
}
