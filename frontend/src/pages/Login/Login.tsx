/**
 * Login Page Component with Google OAuth and Forgot Password
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed';
import styles from './Login.module.css';
import { saveGoogleAttempt } from '../../utils/googleOAuth';

/**
 * Forgot Password Modal
 */
const ForgotPasswordModal = ({
  isOpen,
  onClose,
  onSendOtp,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSendOtp: (email: string) => Promise<void>;
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await onSendOtp(email);

      // After successful OTP request, switch to reset password modal
      onClose();
    } catch (err: any) {
      const message =
        err.message ||
        err.response?.data?.message ||
        'Failed to send OTP. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Reset Password</h3>
        <p>Enter your email address to receive an OTP code</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.modalButtons}>
            <button
              type="submit"
              disabled={isLoading || !email}
              style={
                isLoading || !email
                  ? { opacity: 0.6, cursor: 'not-allowed' }
                  : {}
              }
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Password strength indicator for reset password
 */
const PasswordStrengthReset = ({ password }: { password: string }) => {
  const isPasswordStrong = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      pwd.length <= 32 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    );
  };

  const isStrong = isPasswordStrong(password);
  const strengthLabel = isStrong ? 'Strong' : 'Weak';
  const strengthColor = isStrong ? '#52c41a' : '#ff4d4f';

  if (!password) return null;

  return (
    <div style={{ marginTop: '5px', fontSize: '12px' }}>
      <span style={{ color: strengthColor, fontWeight: 'bold' }}>
        Strength: {strengthLabel}
      </span>
    </div>
  );
};

/**
 * Reset Password Modal
 */
const ResetPasswordModal = ({
  isOpen,
  onClose,
  onResetPassword,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => Promise<void>;
  email: string;
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const otp = otpDigits.join('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setOtpDigits(Array(6).fill(''));
    setNewPassword(''); setConfirmPassword(''); setMessage(''); setError('');
    setTimer(60); setCanResend(false); setResendCount(0);
  }, [isOpen, email]);

  // Countdown logic — FIXED
useEffect(() => {
  if (!isOpen) return;
  if (timer <= 0) {
    setCanResend(true);
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('OTP must be exactly 6 digits');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 32) {
      setError('Password must be 8 to 32 characters long');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter (A-Z)');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter (a-z)');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number (0-9)');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError(
        'Password must contain at least one special character (!@#$%^&* etc.)'
      );
      return;
    }

    setIsLoading(true);

    try {
      await onResetPassword({ email, otp, newPassword });
      setMessage('Password reset successful! You can now login with your new password.');

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {


      let raw = err.response?.data;

let errorMessage =
  typeof raw === "string"
    ? raw
    : raw?.message ||
      raw?.error ||
      err.message ||
      "Failed to reset password.";

setError(String(errorMessage));

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className= "ResetPasswordTextView" style={{ fontWeight: "bold"}}>Reset Password</h3>
        <p>
          Enter the OTP sent to <strong>{email}</strong> and your new
          password
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.otpContainer}>
  {[0, 1, 2, 3, 4, 5].map((index) => (
    <input
      key={index}
      id={`otp-${index}`}
      type="text"
      inputMode="numeric"
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      aria-label={`Reset code digit ${index + 1}`}
      maxLength={1}
      className={styles.otpBox}
      value={otpDigits[index]}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, '').slice(-1);
        setOtpDigits(digits => digits.map((digit, i) => i === index ? value : digit));
        if (value) document.getElementById(`otp-${Math.min(index + 1, 5)}`)?.focus();
      }}
      onPaste={event => {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
        if (!pasted) return;
        setOtpDigits(digits => digits.map((digit, i) => i >= index && i < index + pasted.length ? pasted[i - index] : digit));
        document.getElementById(`otp-${Math.min(index + pasted.length, 5)}`)?.focus();
      }}
      onKeyDown={(e) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          const target = otpDigits[index] ? index : Math.max(0, index - 1);
          setOtpDigits(digits => digits.map((digit, i) => i === target ? '' : digit));
          document.getElementById(`otp-${target}`)?.focus();
        }
      }}
    />
  ))}
</div>


         <div style={{ textAlign: "center", marginTop: "10px" }}>
  {!canResend ? (
    <p style={{ color: "#666" }}>
      Resend available in <strong>{timer}s</strong>
    </p>
  ) : (
    <button
      type="button"
      onClick={async () => {
        if (resendCount >= 3) {
          setError("You reached the resend limit. Try again later.");
          return;
        }

        try {
          await api.post("/auth/forgot-password", { email });

          setResendCount(resendCount + 1);
          setTimer(60);
          setCanResend(false);

        } catch {
          setError("Failed to resend OTP. Please try again.");
        }
      }}
      style={{
        background: "none",
        border: "none",
        color: "#4f46e5",
        fontWeight: "bold",
        textDecoration: "underline",
        cursor: "pointer",
        marginBottom: "25px"
      }}
    >
      Resend OTP
    </button>
  )}
</div>


          <input
            type="password"
            placeholder="New Password (8-32 chars with letters, numbers, symbols)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <PasswordStrengthReset password={newPassword} />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}

          <div className={styles.modalButtons}>
            <button
              type="submit"
              disabled={isLoading || !otp || !newPassword || !confirmPassword}
              style={
                isLoading ||
                !otp ||
                !newPassword ||
                !confirmPassword
                  ? { opacity: 0.6, cursor: 'not-allowed' }
                  : {}
              }
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token, login } = useAuth();
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const nextParam = new URLSearchParams(location.search).get('next') || '/';

  useEffect(() => {
    if (token) navigate(nextParam, { replace: true });
  }, [token, navigate, nextParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      // Clear any persisted favorites so each account starts clean
      try {
        useFavorites.getState().clearFavorites();
      } catch {
        // ignore storage errors
      }
      // Clear recently played so it doesn't bleed across accounts
      try {
        useRecentlyPlayed.getState().clear();
      } catch {
        // ignore storage errors
      }

      login(res.data.access_token, { persist: rememberMe });
      navigate(nextParam, { replace: true });
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials.';

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (status === 400) {
          errorMessage = data.message || 'Invalid request. Please check your input.';
        } else if (status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setFormError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isLoading) return;
    setFormError('');
    setIsLoading(true);
    setIsGuestLoading(true);

    try {
      const res = await api.post('/auth/guest');
      if (!res.data.access_token) throw new Error('Missing guest token');
      login(res.data.access_token, { persist: false });
      navigate(nextParam, { replace: true });
    } catch {
      setFormError('Guest login is unavailable right now. Please try again.');
    } finally {
      setIsLoading(false);
      setIsGuestLoading(false);
    }
  };

  /**
   * Google OAuth
   */
  const handleGoogleLogin = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    let redirectUri =
      import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;

    try {
      const url = new URL(redirectUri);
      if (url.pathname === '/' || url.pathname === '') {
        url.pathname = '/auth/google/callback';
      }
      redirectUri = url.toString().replace(/\/$/, '');
    } catch {
      // ignore
    }

    if (!clientId) {
      setFormError('Google sign-in is being configured. You can continue as a guest or use email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: challenge } = await api.post('/auth/google-challenge');
      saveGoogleAttempt({ ...challenge, persist: rememberMe, next: nextParam });
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token&` +
        `scope=openid%20email%20profile&` +
        `nonce=${encodeURIComponent(challenge.nonce)}&` +
        `state=${encodeURIComponent(challenge.state)}`;

      window.location.href = authUrl;
    } catch {
      setFormError('Google sign-in could not start. Please try again.');
      setIsLoading(false);
    }
  };

  /**
   * Forgot password: request OTP
   */
  const handleForgotPassword = async (email: string) => {
  try {
    const res = await api.post('/auth/forgot-password', { email });

    const serverMessage =
      res?.data?.message ||
      'If an account exists with this email, you will receive an OTP.';

    alert(serverMessage);

    setResetEmail(email);
    setShowForgotPassword(false);
    setShowResetPassword(true);
  } catch {
    throw new Error('Password-reset email is temporarily unavailable. Please try again later.');
  }
};


  /**
   * Reset password: submit OTP + new password
   */
  const handleResetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  try {
    const response = await api.post('/auth/reset-password', data);

    const message =
      typeof response.data?.message === "string"
        ? response.data.message
        : "Password reset successful! You can now login with your new password.";

    alert(`✅ ${message}`);

    setShowResetPassword(false);
    setResetEmail('');
  } catch (err: any) {


    let errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Failed to reset password. Please check your OTP and try again.';

    // 🔥 Ensure errorMessage is always a string
    if (typeof errorMessage !== "string") {
      try {
        errorMessage = JSON.stringify(errorMessage);
      } catch {
        errorMessage = "Unexpected error occurred.";
      }
    }

    // Do NOT throw a raw object — throw a string
    throw new Error(errorMessage);
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Echo Wave</h1>
          <p className={styles.tagline}>Stream. Discover. Connect.</p>
          <p className={styles.description}>
            Echo Wave is your gateway to the underground music scene. Upload
            tracks, explore top charts, and connect with artists around you —
            all in one place.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 style= {{fontWeight: "bold"}}>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <div className={styles.fieldRow}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {capsLockOn && <div className={styles.hint}>Caps Lock is on</div>}

          <div className={styles.inlineRow}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              Remember me
            </label>
            {nextParam !== '/' && (
              <div className={styles.hint}>
                After login: {nextParam}
              </div>
            )}
          </div>

          {location.state?.passwordChanged === true && (
            <div className={styles.success} role="status">Password changed. Please sign in again with your new password.</div>
          )}
          {formError && <div className={styles.error} role="alert">{formError}</div>}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            style={
              isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}
            }
          >
            {isLoading && !isGuestLoading ? 'Logging in...' : 'Log In'}
          </button>

          <button
            type="button"
            className={styles.guestButton}
            onClick={handleGuestLogin}
            disabled={isLoading}
            aria-busy={isGuestLoading}
            aria-describedby="guest-login-hint"
          >
            {isGuestLoading ? 'Starting guest session...' : 'Continue as Guest'}
          </button>
          <p id="guest-login-hint" className={styles.guestHint}>
            Try Echo Wave without signing up. Your guest session stays in this browser tab.
          </p>

          {/* Divider */}
          <div
            style={{
              textAlign: 'center',
              margin: '1rem 0',
              color: '#666',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#ddd',
                zIndex: 1,
              }}
            ></div>
            <span
              style={{
                backgroundColor: '#f9f9f9',
                padding: '0 10px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              OR
            </span>
          </div>

          {/* Google Login Button */}
          <div className={styles.googleLogin}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={styles.googleButton}
              disabled={isLoading}
              style={
                isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}
              }
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p
            className={styles.forgotPassword}
            onClick={() => !isLoading && setShowForgotPassword(true)}
            style={
              isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}
            }
          >
            Forgot Password?
          </p>

          <p className={styles.toggleText}>
            Don&apos;t have an account?{' '}
            <span
              className={styles.link}
              onClick={() => !isLoading && navigate('/signup')}
              style={
                isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}
              }
            >
              Sign up
            </span>
          </p>
        </form>
      </div>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Echo Wave. All rights reserved.</p>
        <button
          className={styles.helpButton}
          onClick={() =>
            (window.location.href =
              'mailto:danielrawda321@gmail.com?subject=Echo Wave Design Help')
          }
          disabled={isLoading}
          style={
            isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}
          }
        >
          Need help with design?
        </button>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSendOtp={handleForgotPassword}
      />

      {/* Reset Password Modal */}
      {showResetPassword && (
        <ResetPasswordModal
          isOpen={showResetPassword}
          onClose={() => {
            setShowResetPassword(false);
            setResetEmail('');
          }}
          onResetPassword={handleResetPassword}
          email={resetEmail}
        />
      )}
    </div>
  );
}
