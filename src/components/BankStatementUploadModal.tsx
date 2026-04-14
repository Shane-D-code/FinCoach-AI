import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, DollarSign, PieChart, TrendingUp, Save, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { mlApi } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant?: string;
}

interface BankAnalysisResponse {
  success: boolean;
  total_spend: number;
  categories: { name: string; amount: number; percentage: number }[];
  top_merchants: { name: string; amount: number; count: number }[];
  transactions: Transaction[];
  monthly_trend: { month: string; spend: number }[];
  message: string;
}

interface BankStatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransactions: (transactions: Transaction[]) => void;
}

export default function BankStatementUploadModal({ isOpen, onClose, onSaveTransactions }: BankStatementUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BankAnalysisResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0]);
    setAnalysisResult(null);
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const analyzeBankStatement = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(30);
    const result = await (mlApi as any).analyzeBankStatement(formData);
      
      setUploadProgress(80);
      setAnalysisResult(result);
      
      setUploadProgress(100);
    } catch (error: any) {
      setAnalysisResult({
        success: false,
        total_spend: 0,
        categories: [],
        top_merchants: [],
        transactions: [],
        monthly_trend: [],
        message: error.message || 'Analysis failed'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleSave = () => {
    if (analysisResult && analysisResult.success && analysisResult.transactions.length > 0) {
      onSaveTransactions(analysisResult.transactions);
      onClose();
    }
  };

  const categoryChartData = analysisResult && analysisResult.success ? {
    labels: analysisResult.categories.map(c => c.name),
    datasets: [{
      data: analysisResult.categories.map(c => c.amount),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF'
      ],
    }]
  } : null;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-4xl max-h-[90vh] w-full max-w-6xl overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText size={36} className="text-blue-600" />
            Bank Statement Analyzer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <div {...getRootProps()} className={`
              border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : selectedFile 
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }
            `}>
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                    <FileText size={32} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(selectedFile.size / 1024)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => analyzeBankStatement(selectedFile)}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={20} />
                        Analyze Statement
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud size={64} className="mx-auto mb-6 text-gray-400" />
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Drag & drop your bank statement
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      or click to browse. Supports PDF, PNG, JPG (max 10MB)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded-full">PDF</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs rounded-full">PNG</span>
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-xs rounded-full">JPG</span>
                  </div>
                </>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Processing: {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="space-y-6">
            {analysisResult ? (
              analysisResult.success ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign size={24} />
                        <span className="text-sm opacity-90">Total Spend</span>
                      </div>
                      <div className="text-3xl font-bold">
                        ₹{analysisResult.total_spend.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <PieChart size={24} />
                        <span className="text-sm opacity-90">Categories</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {analysisResult.categories.length}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={24} />
                        <span className="text-sm opacity-90">Transactions</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {analysisResult.transactions.length}
                      </div>
                    </div>
                  </div>

                  {/* Category Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <PieChart size={24} />
                      Spending by Category
                    </h3>
                    <div className="h-80">
                      <Doughnut data={categoryChartData!} options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }} />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      <Save size={20} />
                      Save {analysisResult.transactions.length} Transactions
                    </button>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:shadow-md transition-all"
                    >
                      Analyze Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <X size={64} className="text-red-500 mb-6 opacity-50" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Analysis Failed
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    {analysisResult.message}
                  </p>
                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:shadow-md transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <FileText size={64} className="text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Spending Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  Upload your bank statement to automatically categorize spending, 
                  identify trends, and get merchant insights powered by OCR + ML
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <PieChart size={24} className="mb-2 text-blue-600" />
                    <span>Auto Categories</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <DollarSign size={24} className="mb-2 text-green-600" />
                    <span>Total Spend</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <TrendingUp size={24} className="mb-2 text-purple-600" />
                    <span>Trends</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
