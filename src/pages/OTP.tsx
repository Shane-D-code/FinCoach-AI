import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function OTP() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage (set during registration)
    const pendingEmail = localStorage.getItem('pendingUserEmail');
    if (!pendingEmail) {
      setMessage('No email found. Please register first.');
      setTimeout(() => {
        navigate('/register');
      }, 2000);
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({
        email: email,
        otp: otp
      });

      if (response.success) {
        setMessage('OTP verified successfully! You can now login.');
        // Clear pending email
        localStorage.removeItem('pendingUserEmail');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('OTP verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      const response = await authApi.resendOtp(email);
      if (response.success) {
        setMessage('OTP has been resent to your email.');
      } else {
        setMessage(response.message || 'Failed to resend OTP.');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setMessage('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">OTP Verification</h2>
        
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit OTP to:
          </p>
          <p className="font-medium text-gray-900 dark:text-white">{email}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleChange}
              maxLength={6}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest"
              placeholder="000000"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              otp.length === 6 && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || !email}
            className={`text-sm ${
              !resending && email
                ? 'text-blue-600 hover:text-blue-500 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center ${
            message.includes('successfully') || message.includes('resent') 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
