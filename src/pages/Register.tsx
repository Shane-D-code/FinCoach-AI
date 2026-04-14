import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FieldName = keyof FormFields;

// ─── Validators ──────────────────────────────────────────────────────────────

const validators: Record<FieldName, (v: string, extra?: string) => string> = {
  name: (v) => {
    if (!v.trim()) return 'Full name is required';
    if (v.trim().length < 2) return 'Must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(v.trim())) return 'Name contains invalid characters';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter';
    if (!/[0-9]/.test(v)) return 'Must contain at least one number';
    return '';
  },
  confirmPassword: (v, password) => {
    if (!v) return 'Please confirm your password';
    if (v !== password) return 'Passwords do not match';
    return '';
  },
};

// ─── Password Strength ───────────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── EyeIcon ─────────────────────────────────────────────────────────────────

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ─── InputField ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  name: FieldName;
  value: string;
  error: string;
  touched: boolean;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  rightElement?: React.ReactNode;
}

function InputField({
  id, label, type, name, value, error, touched, placeholder,
  onChange, onBlur, autoComplete, rightElement,
}: InputFieldProps) {
  const hasError = touched && !!error;
  const isValid = touched && !error && !!value;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError}
          className={`
            w-full px-4 py-3 pr-11 rounded-xl border text-white placeholder-slate-500
            bg-slate-800/60 backdrop-blur-sm text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${hasError
              ? 'border-red-500 focus:ring-red-500/40'
              : isValid
              ? 'border-green-500 focus:ring-green-500/40'
              : 'border-slate-700 focus:ring-indigo-500/40 focus:border-indigo-500'
            }
          `}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
        {!rightElement && isValid && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormFields>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

// Render diagnostics removed (was causing log spam)

  // Memoized password strength
  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const isFormValid =
    !errors.name && !errors.email && !errors.password && !errors.confirmPassword &&
    form.name && form.email && form.password && form.confirmPassword;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const field = name as FieldName;

      setForm(prev => ({
        ...prev,
        [field]: value
      }));
      setServerError('');
    },
    []
  );

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors: FormErrors = {
        name: validators.name(form.name),
        email: validators.email(form.email),
        password: validators.password(form.password),
        confirmPassword: validators.confirmPassword(form.confirmPassword, form.password),
      };
      setErrors(newErrors);
    }, 300);

    return () => clearTimeout(timer);
  }, [form]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const field = name as FieldName;
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      // Immediate validation on blur
      const error = validators[field as keyof typeof validators](
        value,
        field === 'confirmPassword' ? form.password : undefined
      ) as string;
      
      setErrors(prev => ({ ...prev, [field]: error }));
    },
    [form.password] // Only password affects confirmPassword blur
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Touch all fields to show any remaining errors
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    const finalErrors: FormErrors = {
      name: validators.name(form.name),
      email: validators.email(form.email),
      password: validators.password(form.password),
      confirmPassword: validators.confirmPassword(form.confirmPassword, form.password),
    };
    setErrors(finalErrors);

    if (Object.values(finalErrors).some(Boolean)) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (response.success) {
        localStorage.setItem('pendingUserEmail', form.email.trim());
        // Navigate immediately — no artificial delay
        navigate('/verify-otp', { state: { email: form.email.trim() }, replace: true });
      } else {
        setServerError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
          <p className="mt-1 text-slate-400 text-sm">Start your financial coaching journey</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Server error banner */}
            {serverError && (
              <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {serverError}
              </div>
            )}

            <InputField
              id="register-name"
              label="Full Name"
              type="text"
              name="name"
              value={form.name}
              error={errors.name}
              touched={touched.name}
              placeholder="Jane Smith"
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
            />

            <InputField
              id="register-email"
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              error={errors.email}
              touched={touched.email}
              placeholder="jane@example.com"
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />

            {/* Password with show/hide */}
            <div className="space-y-1">
              <InputField
                id="register-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                error={errors.password}
                touched={touched.password}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                }
              />
              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.label && (
                    <p className="text-xs text-slate-400">
                      Strength: <span className={`font-semibold ${
                        passwordStrength.label === 'Weak' ? 'text-red-400' :
                        passwordStrength.label === 'Fair' ? 'text-yellow-400' :
                        passwordStrength.label === 'Good' ? 'text-blue-400' : 'text-green-400'
                      }`}>{passwordStrength.label}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <InputField
              id="register-confirm-password"
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              placeholder="Re-enter your password"
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              }
            />

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isSubmitting}
              className={`
                relative w-full flex items-center justify-center gap-2
                py-3 px-6 rounded-xl font-semibold text-sm
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
                ${isSubmitting || !isFormValid
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <span>Creating account…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
