# Bank Statement Upload + ML Analysis Feature Plan

## Status
**Phase 1 Complete:** Infrastructure ready (OCR/ML pipeline live, backend active)

## Current Stack
```
Frontend: React/Vite ✓
Backend: Spring Boot (8081) ✓ - Debt queries working
ML/OCR: FastAPI (8000) ✓ - /risk, /expense, /ocr/scan-bill working
BillScanner.tsx: Single bill OCR → merchant/date/total ✓
```

## Phase 2: Bank Statement Popup in Dashboard

### 1. New Component: `src/components/BankStatementUploadModal.tsx`
```
Features:
- Drag-drop PDF/PNG/JPG upload (react-dropzone)
- Progress bar during OCR/ML processing
- Results:
  * Pie chart: Spending by category (Food 35%, Transport 20%)
  * Table: Top merchants/transactions
  * Trends: Monthly spend growth
  * Save to DB button
```

### 2. API Extensions
```
Backend MLController.java:
POST /api/ml/bank/analyze (MultipartFile)
→ MLService → localhost:8000/bank/analyze

ML ocr_service_fixed.py:
POST /bank/analyze → OCR pages → Parse:
  Date | Description | Amount | Category (ML)
→ AnalysisResponse:
  { totalSpend, categories[], topMerchants[], monthlyTrend[] }
```

### 3. Integration Flow
```
Dashboard "Upload Bank Statement" → Modal
1. User uploads PDF/image
2. POST /api/ml/bank/analyze
3. Backend → ML service
4. OCR → Extract transactions
5. ML categorize (expense model)
6. Frontend: Charts + "Save Transactions"
7. Save → Backend /transactions/bulk-create
```

## Next Steps (Await Confirmation)
```
[ ] Create BankStatementUploadModal.tsx
[ ] Add Dashboard button/modal trigger  
[ ] Backend: MLController /bank/analyze endpoint
[ ] ML: ocr_service_fixed.py /bank/analyze
[ ] Frontend api.ts: analyzeBankStatement(file)
[ ] Test: Upload sample statement → see analysis/charts
[ ] Save transactions to H2 DB
```

**Ready to implement?** Reply "proceed" to start coding.
