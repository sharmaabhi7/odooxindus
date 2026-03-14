import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Mail, Building2, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Card from '../components/Card/Card';
import './Login.css';
import './ForgotPassword.css';

const getPasswordScore = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const getStrengthLabel = (score) => {
  if (score <= 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  return 'Strong';
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState(searchParams.get('slug') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordScore = useMemo(() => getPasswordScore(newPassword), [newPassword]);
  const passwordStrength = useMemo(() => getStrengthLabel(passwordScore), [passwordScore]);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (step !== 'success') return;
    const timeout = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(timeout);
  }, [step, navigate]);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      const payload = { email };
      if (slug.trim()) payload.slug = slug.trim();
      const { data } = await api.post('/auth/forgot-password', payload);
      const resetData = data.data;
      setExpiresAt(resetData.expiresAt);
      setSecondsLeft(resetData.expiresInSeconds);
      setSuccessMessage('A 6-digit OTP has been sent to your email.');
      setStep('verify');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Unable to send OTP right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    clearMessages();
    setIsResending(true);
    try {
      const payload = { email };
      if (slug.trim()) payload.slug = slug.trim();
      const { data } = await api.post('/auth/resend-password-otp', payload);
      const resetData = data.data;
      setExpiresAt(resetData.expiresAt);
      setSecondsLeft(resetData.expiresInSeconds);
      setSuccessMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Unable to resend OTP right now.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (otp.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { email, otp: otp.trim() };
      if (slug.trim()) payload.slug = slug.trim();
      await api.post('/auth/verify-password-otp', payload);
      setSuccessMessage('OTP verified successfully.');
      setStep('reset');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { email, otp: otp.trim(), newPassword };
      if (slug.trim()) payload.slug = slug.trim();
      await api.post('/auth/reset-password', payload);
      setStep('success');
      setSuccessMessage('Password reset successful. Redirecting to login...');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-side-decoration">
        <div className="deco-content">
          <div className="brand-badge">
            <Box size={24} />
            <span>CoreInventory</span>
          </div>
          <h2>Secure password recovery.</h2>
          <p>Recover access with one-time verification and reset your credentials safely.</p>
        </div>
      </div>

      <div className="login-main">
        <Card className="login-card">
          <div className="login-header">
            <h3>Forgot Password</h3>
            <p>Follow the secure recovery flow to restore access.</p>
          </div>

          {errorMessage && <p className="auth-inline-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-inline-success" role="status" aria-live="polite">{successMessage}</p>}

          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="login-form" noValidate>
              <Input
                label="Registered Email"
                icon={Mail}
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Company Slug (Optional)"
                icon={Building2}
                placeholder="acme-logistics"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <Button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="login-form" noValidate>
              <Input
                label="Enter 6-digit OTP"
                icon={KeyRound}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
              <div className="otp-meta-row">
                <span className={`otp-timer ${secondsLeft === 0 ? 'expired' : ''}`}>
                  {secondsLeft > 0 ? `Expires in ${formatTime(secondsLeft)}` : 'OTP expired'}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={handleResendOtp} disabled={isResending}>
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </Button>
              </div>
              <Button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="login-form" noValidate>
              <Input
                label="New Password"
                icon={Lock}
                type="password"
                placeholder="Enter a strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="password-strength" aria-live="polite">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((item) => (
                    <span key={item} className={`strength-bar ${passwordScore >= item ? 'active' : ''}`}></span>
                  ))}
                </div>
                <span className="strength-label">Strength: {passwordStrength}</span>
              </div>
              <Input
                label="Confirm New Password"
                icon={ShieldCheck}
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="reset-success-box" role="status" aria-live="polite">
              <ShieldCheck size={24} />
              <p>Password reset complete. Redirecting to login in a few seconds.</p>
            </div>
          )}

          <div className="login-footer">
            <p><Link to="/login">Back to login</Link></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
