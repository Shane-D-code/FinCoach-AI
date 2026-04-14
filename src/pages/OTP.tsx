import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(initialSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [initialSeconds]);

  // Auto-start on mount
  useEffect(() => {
    start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [start]);

  return { seconds, start, canResend: seconds === 0 };
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ className = 'h-5 w-5 text-white' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── OTP digit boxes ─────────────────────────────────────────────────────────

interface OtpBoxesProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

function OtpBoxes({ value, onChange, disabled }: OtpBoxesProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1); // take last digit
    const arr = value.padEnd(6, ' ').split('');
    arr[index] = digit || ' ';
    const next = arr.join('').trimEnd(); // trim trailing spaces

    // Clamp to 6 chars
    onChange(next.replace(/\s/g, '').slice(0, 6));

    // Advance focus
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    // Focus last filled box or end
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => {
        const digit = value[i] ?? '';
        const isFilled = !!digit;
        return (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleInput(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${i + 1}`}
            className={`
              w-11 h-14 text-center text-xl font-bold rounded-xl border
              bg-slate-800/60 text-white caret-indigo-400
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isFilled
                ? 'border-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
                : 'border-slate-700'
              }
            `}
          />
        );
      })}
    </div>
  );
}

// ─── OTP Page ─────────────────────────────────────────────────────────────────

type Status = 'idle' | 'verifying' | 'success' | 'error';

export default function OTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve email: route state → URL params → localStorage
  const resolvedEmail = (() => {
    if (location.state?.email) return location.state.email as string;
    const urlEmail = new URLSearchParams(location.search).get('email');
    if (urlEmail) return urlEmail;
    return localStorage.getItem('pendingUserEmail') ?? '';
  })();

  const [email] = useState<string>(resolvedEmail);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { seconds, start: startCountdown, canResend } = useCountdown(60);

  const isVerifying = status === 'verifying';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setStatus('error');
      setServerMessage('Please enter all 6 digits of the OTP.');
      return;
    }
    if (!email) {
      setStatus('error');
      setServerMessage('No email found. Please register again.');
      return;
    }

    setStatus('verifying');
    setServerMessage('');

    try {
      const response = await authApi.verifyOtp({ email, otp });

      if (response.success) {
        localStorage.removeItem('pendingUserEmail');
        setStatus('success');
        setServerMessage('Email verified! Redirecting to sign in…');
        // Navigate after brief success feedback
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } else {
        setStatus('error');
        setServerMessage(response.message || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (err: any) {
      setStatus('error');
      setServerMessage(
        err?.response?.data?.message || 'OTP verification failed. Please try again.',
      );
      setOtp('');
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────────

  const handleResend = useCallback(async () => {
    if (!canResend || !email || isResending) return;

    setIsResending(true);
    setResendMessage('');
    setServerMessage('');

    try {
      const response = await authApi.resendOtp(email);
      if (response.success) {
        setResendMessage('A new OTP has been sent to your email.');
        startCountdown();
        setOtp('');
        setStatus('idle');
      } else {
        setResendMessage(response.message || 'Failed to resend OTP. Try again.');
      }
    } catch {
      setResendMessage('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  }, [canResend, email, isResending, startCountdown]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            {isSuccess ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isSuccess ? 'Verified!' : 'Check your email'}
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            {isSuccess
              ? 'Your account is ready to go.'
              : 'We sent a 6-digit code to'}
          </p>
          {!isSuccess && email && (
            <p className="mt-1 font-semibold text-indigo-300 text-sm tracking-wide">{email}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-8">
          {/* Missing email warning */}
          {!email && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-sm text-yellow-400">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              No email address found. Please{' '}
              <a href="/register" className="underline hover:no-underline">register again</a>.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-7">
            {/* OTP boxes */}
            <div className="space-y-3">
              <p className="text-center text-sm text-slate-400">Enter the verification code</p>
              <OtpBoxes
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (status === 'error') setStatus('idle');
                  setServerMessage('');
                }}
                disabled={isVerifying || isSuccess}
              />
            </div>

            {/* Status messages */}
            {(serverMessage || resendMessage) && (
              <div
                role="alert"
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${
                  isSuccess || resendMessage.includes('sent')
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : isError
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-slate-700/50 border-slate-600/40 text-slate-300'
                }`}
              >
                {isSuccess ? (
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : isError ? (
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
                {serverMessage || resendMessage}
              </div>
            )}

            {/* Verify button */}
            <button
              id="otp-verify-submit"
              type="submit"
              disabled={otp.length !== 6 || isVerifying || isSuccess || !email}
              className={`
                relative w-full flex items-center justify-center gap-2
                py-3 px-6 rounded-xl font-semibold text-sm
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
                ${otp.length === 6 && !isVerifying && !isSuccess && email
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99]'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isVerifying ? (
                <>
                  <Spinner />
                  <span>Verifying…</span>
                </>
              ) : isSuccess ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Verified</span>
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-sm text-slate-400">Didn't receive the code?</p>
            {canResend ? (
              <button
                id="otp-resend-btn"
                type="button"
                onClick={handleResend}
                disabled={isResending || !email || isSuccess}
                className={`
                  inline-flex items-center gap-1.5 text-sm font-semibold transition-colors
                  focus:outline-none focus:underline
                  ${isResending || !email || isSuccess
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-indigo-400 hover:text-indigo-300'
                  }
                `}
              >
                {isResending ? (
                  <>
                    <Spinner className="h-4 w-4 text-indigo-400" />
                    Sending…
                  </>
                ) : (
                  'Resend OTP'
                )}
              </button>
            ) : (
              <p className="text-sm text-slate-500">
                Resend available in{' '}
                <span className="font-mono font-semibold text-indigo-400">
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                  {String(seconds % 60).padStart(2, '0')}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Wrong account?{' '}
          <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Register again
          </a>
        </p>
      </div>
    </div>
  );
}
