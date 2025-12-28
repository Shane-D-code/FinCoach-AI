-- FinCoach-AI H2 Database Schema

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email OTP table
CREATE TABLE email_otp (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    source VARCHAR(20) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'OCR')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    monthly_limit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Stock', 'ETF', 'Mutual Fund', 'Bond', 'Crypto')),
    shares DECIMAL(10,4) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(10,2) NOT NULL,
    gain DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts table
CREATE TABLE debts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    min_payment DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'loan', 'student', 'mortgage')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings Goals table
CREATE TABLE savings_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target DECIMAL(10,2) NOT NULL,
    current DECIMAL(10,2) DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table (additional user data)
CREATE TABLE user_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    avatar VARCHAR(500),
    income_type VARCHAR(20) DEFAULT 'salary' CHECK (income_type IN ('salary', 'gig', 'business', 'investment')),
    monthly_income DECIMAL(10,2),
    current_balance DECIMAL(10,2),
    streak INT DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    risk_profile VARCHAR(10) DEFAULT 'medium' CHECK (risk_profile IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verified ON users(verified);

CREATE INDEX idx_email_otp_user_id ON email_otp(user_id);
CREATE INDEX idx_email_otp_expiry_time ON email_otp(expiry_time);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_type ON investments(type);

CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_type ON debts(type);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_income_type ON user_profiles(income_type);
CREATE INDEX idx_user_profiles_risk_profile ON user_profiles(risk_profile);

-- Sample data for testing (optional)
-- Uncomment the following lines to insert sample data

/*
-- Insert sample users
INSERT INTO users (name, email, password, verified) VALUES
('Alex Doe', 'alex.doe@example.com', '$2a$10$8hP2o3.4K4lJ3M2N1P4R5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2', TRUE),
('Jane Smith', 'jane.smith@example.com', '$2a$10$8hP2o3.4K4lJ3M2N1P4R5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U3', TRUE);

-- Insert sample user profiles
INSERT INTO user_profiles (user_id, avatar, income_type, monthly_income, current_balance, streak, language, risk_profile) VALUES
(1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'gig', 3000.00, 3200.00, 7, 'en', 'medium'),
(2, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', 'salary', 5000.00, 4500.00, 12, 'en', 'low');

-- Insert sample transactions
INSERT INTO transactions (user_id, date, category, amount, description, type, source) VALUES
(1, '2025-10-09', 'Groceries', -85.50, 'Whole Foods', 'EXPENSE', 'MANUAL'),
(1, '2025-10-08', 'Income', 450.00, 'Freelance Project', 'INCOME', 'MANUAL'),
(1, '2025-10-07', 'Transport', -25.00, 'Uber', 'EXPENSE', 'MANUAL'),
(1, '2025-10-06', 'Dining', -42.30, 'Restaurant', 'EXPENSE', 'MANUAL'),
(1, '2025-10-05', 'Rent', -1200.00, 'Monthly Rent', 'EXPENSE', 'MANUAL');

-- Insert sample budgets
INSERT INTO budgets (user_id, category, monthly_limit) VALUES
(1, 'Groceries', 400.00),
(1, 'Rent', 1200.00),
(1, 'Transport', 200.00),
(1, 'Dining', 300.00),
(1, 'Entertainment', 150.00),
(1, 'Utilities', 175.00),
(1, 'Healthcare', 150.00),
(1, 'Shopping', 225.00);

-- Insert sample investments
INSERT INTO investments (user_id, name, type, shares, current_price, total_value, gain) VALUES
(1, 'AAPL', 'Stock', 5.0000, 180.00, 900.00, 12.5),
(1, 'GOOGL', 'Stock', 2.0000, 140.00, 280.00, -3.2),
(1, 'VOO', 'ETF', 8.0000, 420.00, 3360.00, 8.7);

-- Insert sample debts
INSERT INTO debts (user_id, name, balance, interest_rate, min_payment, type) VALUES
(1, 'Credit Card', 1000.00, 18.00, 50.00, 'credit'),
(1, 'Personal Loan', 3500.00, 12.00, 150.00, 'loan'),
(1, 'Student Loan', 8000.00, 6.00, 100.00, 'student');

-- Insert sample savings goals
INSERT INTO savings_goals (user_id, name, target, current, progress) VALUES
(1, 'Emergency Fund', 5000.00, 2000.00, 40.0),
(1, 'Vacation Fund', 3000.00, 800.00, 26.7);
*/
