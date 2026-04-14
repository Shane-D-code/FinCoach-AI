# Backend Implementation TODO

## Priority 1: Core Endpoints (MUST HAVE)

### 1. Transaction Endpoints
- [ ] `GET /api/transactions` - Get all transactions with filters
- [ ] `GET /api/transactions/summary` - Get transaction summary with analytics
- [ ] `POST /api/transactions` - Create single transaction
- [ ] `POST /api/transactions/bulk` - Bulk create transactions
- [ ] `PUT /api/transactions/{id}` - Update transaction
- [ ] `DELETE /api/transactions/{id}` - Delete transaction

### 2. User Profile Endpoints
- [ ] `GET /api/user/profile` - Get user profile
- [ ] `GET /api/user/financial-profile` - Get complete financial profile with stats
- [ ] `PUT /api/user/profile` - Update user profile
- [ ] `PUT /api/user/financial-settings` - Update financial settings

### 3. Health Score Endpoint
- [ ] `GET /api/insights/health-score` - Calculate and return financial health score

## Priority 2: Enhanced Features (SHOULD HAVE)

### 4. Insights Endpoints
- [ ] `GET /api/insights` - Get AI-generated insights
- [ ] `POST /api/insights/generate` - Generate new insights
- [ ] `PUT /api/insights/{id}/read` - Mark insight as read

### 5. Upload Endpoints
- [ ] `POST /api/upload/bank-statement` - Upload and parse CSV/PDF
- [ ] `POST /api/upload/parse-csv` - Parse CSV content

## Priority 3: Nice to Have (COULD HAVE)

### 6. AI Advice Endpoint
- [ ] `POST /api/insights/advice` - Get AI financial advice

## Database Schema Updates Needed

### Transaction Table
```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    type VARCHAR(10) NOT NULL, -- 'income' or 'expense'
    source VARCHAR(20), -- 'manual', 'upload', 'ocr'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### User Profile Updates
```sql
ALTER TABLE users ADD COLUMN income_type VARCHAR(20);
ALTER TABLE users ADD COLUMN monthly_income DECIMAL(10, 2);
ALTER TABLE users ADD COLUMN current_balance DECIMAL(10, 2);
ALTER TABLE users ADD COLUMN risk_profile VARCHAR(10);
ALTER TABLE users ADD COLUMN streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN badges TEXT; -- JSON array
```

### Insights Table (Optional)
```sql
CREATE TABLE insights (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    priority INT DEFAULT 0,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```
