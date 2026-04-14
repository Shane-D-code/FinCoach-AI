import api from './api';
import { UploadResult, ParsedTransaction, OCRResult } from '../types/upload';

export const uploadService = {
  /**
   * Upload and parse bank statement (CSV or PDF)
   */
  uploadBankStatement: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/bank-statement', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(progress);
          }
        }
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to upload bank statement:', error);
      return {
        success: false,
        message: 'Failed to upload and parse bank statement',
        transactions: [],
        summary: {
          total: 0,
          income: 0,
          expenses: 0
        }
      };
    }
  },

  /**
   * Parse CSV content directly
   */
  parseCSV: async (csvContent: string): Promise<ParsedTransaction[]> => {
    try {
      const response = await api.post('/upload/parse-csv', { content: csvContent });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      return [];
    }
  },

  /**
   * OCR scan bill/receipt
   */
  scanBill: async (file: File): Promise<OCRResult | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/ml/ocr/scan-bill', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to scan bill:', error);
      return null;
    }
  },

  /**
   * OCR scan bill from base64 image
   */
  scanBillBase64: async (imageBase64: string): Promise<OCRResult | null> => {
    try {
      const response = await api.post('/ml/ocr/scan-bill-base64', imageBase64, {
        headers: {
          'Content-Type': 'text/plain',
        }
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to scan bill from base64:', error);
      return null;
    }
  }
};
