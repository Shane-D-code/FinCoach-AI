-- Delete all users except adwikavishal@gmail.com and their data
DELETE FROM debt_payments WHERE user_id IN (SELECT id FROM users WHERE email != 'adwikavishal@gmail.com');
DELETE FROM debts WHERE user_id IN (SELECT id FROM users WHERE email != 'adwikavishal@gmail.com');
DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email != 'adwikavishal@gmail.com');
DELETE FROM email_otp WHERE user_id IN (SELECT id FROM users WHERE email != 'adwikavishal@gmail.com');
DELETE FROM users WHERE email != 'adwikavishal@gmail.com';

-- Verify
SELECT COUNT(*) as total_users, COUNT(CASE WHEN email = 'adwikavishal@gmail.com' THEN 1 END) as protected_user FROM users;
