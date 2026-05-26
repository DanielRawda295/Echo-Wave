/**
 * Signup Page Component
 *
 * Updated password requirements:
 * - 8 to 32 characters
 * - Must include uppercase letters
 * - Must include lowercase letters
 * - Must include numbers
 * - Must include special characters
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Signup.module.css';

/**
 * Password validation function for strong password requirements
 */
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password.length > 32) {
    return 'Password must not exceed 32 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z)';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z)';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9)';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&* etc.)';
  }
  return null;
};

/**
 * Password strength indicator component
 */
const PasswordStrength = ({ password }: { password: string }) => {
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
    <div className={styles.passwordStrength}>
      <div className={styles.strengthBar}>
        <div
          className={styles.strengthFill}
          style={{
            width: isStrong ? '100%' : '30%',
            backgroundColor: strengthColor,
          }}
        />
      </div>
      <span
        className={styles.strengthText}
        style={{ color: strengthColor }}
      >
        Strength: {strengthLabel}
      </span>
    </div>
  );
};

/**
 * Password requirements checklist component
 */
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    {
      label: '8 to 32 characters',
      met: password.length >= 8 && password.length <= 32,
    },
    {
      label: 'Uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Number (0-9)',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  return (
    <div className={styles.requirementsList}>
      {requirements.map((req, index) => (
        <div
          key={index}
          className={`${styles.requirementItem} ${
            req.met ? styles.requirementMet : ''
          }`}
        >
          <span className={styles.requirementMarker}>
            {req.met ? '✓' : '✗'}
          </span>
          {req.label}
        </div>
      ))}
    </div>
  );
};

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nextParam = new URLSearchParams(location.search).get('next') || '/';

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (value.length > 0) {
      if (value.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
      } else {
        setPasswordError(validatePassword(value));
      }
    } else {
      setPasswordError(null);
    }
  };

  const isPasswordValid = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      pwd.length <= 32 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    );
  };

  const getErrorMessage = (err: any): string => {
    const normalize = (value: any): string => {
      if (!value) return 'Signup failed. Please try again.';
      if (typeof value === 'string') return value;
      if (Array.isArray(value)) return value.map(normalize).join('\n');
      if (typeof value === 'object') {
        if (value.message) return normalize(value.message);
        if (value.error) return normalize(value.error);
        try {
          return JSON.stringify(value);
        } catch {
          return 'Signup failed. Please try again.';
        }
      }
      return String(value);
    };

    console.error('Registration error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    if (err.response?.data) {
      const errorData = err.response.data;

      if (typeof errorData === 'string') return errorData;
      if (errorData.message) return normalize(errorData.message);
      if (errorData.error) return normalize(errorData.error);

      if (Array.isArray(errorData) && errorData.length > 0) {
        return errorData
          .map((item: any) =>
            normalize(
              item.constraints
                ? Object.values(item.constraints).join(', ')
                : item.message || item,
            ),
          )
          .join('\n');
      }

      return normalize(errorData);
    }

    if (err.response?.status === 409) {
      return 'An account with this email already exists';
    }
    if (err.response?.status === 400) {
      return 'Invalid registration data. Please check your input.';
    }
    if (err.message === 'Network Error') {
      return 'Unable to connect to server. Please check your connection.';
    }

    return err.message || 'Signup failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (!username.trim()) {
      setFormError('Please enter a username');
      return;
    }

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (username.trim().length < 2 || username.trim().length > 30) {
      setFormError('Username must be between 2 and 30 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setFormError('Please accept the Terms and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);

    console.log('📤 Sending registration request:', {
      email,
      username: username.trim(),
      passwordLength: password.length,
      passwordSample: password.substring(0, 2) + '...',
    });

    try {
      const response = await api.post('/auth/register', {
        email,
        username: username.trim(),
        password,
      });

      console.log('✅ Registration successful:', response.data);

      navigate(`/login?next=${encodeURIComponent(nextParam)}`, { replace: true });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);

      setFormError(errorMessage);

      console.error('Registration error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        requestData: {
          email,
          username: username.trim(),
          passwordLength: password.length,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      email &&
      email.includes('@') &&
      username.trim().length >= 2 &&
      username.trim().length <= 30 &&
      isPasswordValid(password) &&
      password === confirmPassword &&
      acceptedTerms &&
      !isSubmitting
    );
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
          <h2 className="font-bold">Sign Up</h2>

          {formError && (
            <div className={styles.errorBox}>
              {formError}
            </div>
          )}

          <input
            type="text"
            placeholder="Username (2-30 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
            maxLength={30}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className={styles.passwordField}>
            <div className={styles.fieldRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password (8-32 characters)"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                minLength={8}
                maxLength={32}
                className={
                  passwordError && password.length >= 8
                    ? styles.inputError
                    : ''
                }
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword((v) => !v)}
                disabled={isSubmitting}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className={styles.fieldRow}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                maxLength={32}
                className={
                  confirmPassword && confirmPassword !== password
                    ? styles.inputError
                    : ''
                }
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowConfirmPassword((v) => !v)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <PasswordStrength password={password} />

            {password.length > 0 && (
              <PasswordRequirements password={password} />
            )}

            {passwordError && (
              <div className={styles.errorMessage}>{passwordError}</div>
            )}

            <div className={styles.passwordHint}>
              Password must be 8-32 characters and include uppercase,
              lowercase, numbers, and special characters
            </div>
          </div>

          <label className={styles.termsRow}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={isSubmitting}
            />
            <span>
              I agree to the{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Terms
              </a>{' '}
              and{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={!isFormValid()}
            className={`${isSubmitting ? styles.submitting : ''} ${
              !isFormValid() ? styles.disabledButton : ''
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>

          <p className={styles.toggleText}>
            Already have an account?{' '}
            <span
              className={styles.link}
              onClick={() => navigate('/login')}
            >
              Login
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
        >
          Need help with design?
        </button>
      </footer>
    </div>
  );
}
