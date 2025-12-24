import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, FileText, CheckCircle, XCircle, Loader, DollarSign, Calendar, Store } from 'lucide-react';
import { mlApi } from '../services/api';

interface ExtractedItem {
  description: string;
  amount: number;
  quantity: number;
}

interface BillData {
  merchant_name: string | null;
  date: string | null;
  total_amount: number;
  items: ExtractedItem[];
  tax: number | null;
  currency: string;
  confidence: number;
}

interface OCRResult {
  success: boolean;
  bill_data: BillData | null;
  raw_text: string;
  message: string;
}

export default function BillScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOcrResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanBill = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    try {
      const result = await mlApi.scanBill(selectedFile);
      setOcrResult(result);
    } catch (error: any) {
      setOcrResult({
        success: false,
        bill_data: null,
        raw_text: '',
        message: error.message || 'Failed to scan bill'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveTransactions = () => {
    if (!ocrResult?.bill_data) return;

    // Save to localStorage for now (in production, save to backend)
    const existingTransactions = JSON.parse(localStorage.getItem('dailySpends') || '[]');
    
    const newTransactions = ocrResult.bill_data.items.map(item => ({
      date: ocrResult.bill_data!.date || new Date().toISOString().split('T')[0],
      amount: item.amount,
      category: 'Shopping', // Could be enhanced with category detection
      merchant: ocrResult.bill_data!.merchant_name || 'Unknown'
    }));

    localStorage.setItem('dailySpends', JSON.stringify([...existingTransactions, ...newTransactions]));
    
    alert('Transactions saved successfully!');
    resetScanner();
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setShowRawText(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bill Scanner
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload or capture a bill to automatically extract transaction details using HelloOCR AI model
        </p>
        <div className="mt-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ <strong>ML OCR Active:</strong> Using HelloOCR model for intelligent bill scanning
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Upload Bill
          </h2>

          {!previewUrl ? (
            <div className="space-y-4">
              {/* File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Camera Capture */}
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors"
              >
                <Camera className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="text-gray-600 dark:text-gray-400">
                  Take a photo with camera
                </p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img
                  src={previewUrl}
                  alt="Bill preview"
                  className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleScanBill}
                  disabled={isScanning}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      Scan Bill
                    </>
                  )}
                </button>
                <button
                  onClick={resetScanner}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Extracted Data
          </h2>

          {!ocrResult ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText size={64} className="mb-4 opacity-50" />
              <p>Upload and scan a bill to see results</p>
            </div>
          ) : ocrResult.success && ocrResult.bill_data ? (
            <div className="space-y-6">
              {/* Success Indicator */}
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Bill Scanned Successfully
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Confidence: {(ocrResult.bill_data.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-4">
                {ocrResult.bill_data.merchant_name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Store className="text-blue-600 dark:text-blue-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Merchant</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {ocrResult.bill_data.merchant_name}
                      </p>
                    </div>
                  </div>
                )}

                {ocrResult.bill_data.date && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {ocrResult.bill_data.date}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{ocrResult.bill_data.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {ocrResult.bill_data.tax && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">Tax</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{ocrResult.bill_data.tax.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveTransactions}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Save Transactions
                </button>
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showRawText ? 'Hide' : 'Show'} Raw Text
                </button>
              </div>

              {/* Raw Text */}
              {showRawText && (
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {ocrResult.raw_text}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <XCircle className="text-red-500 mb-4" size={64} />
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                Scan Failed
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {ocrResult.message}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Tips for Better Results
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <CheckCircle className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={16} />
            <span>Ensure good lighting when capturing bills</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={16} />
            <span>Keep the bill flat and avoid shadows</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={16} />
            <span>Capture the entire bill in the frame</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={16} />
            <span>Use high-resolution images for better accuracy</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
