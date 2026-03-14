import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Lock, Mail, Building2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Card from '../components/Card/Card';
import './Login.css';

export default function Login() {
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password, slug);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          <h2>Efficiency in every movement.</h2>
          <p>The enterprise-grade inventory management system for high-growth warehouse operations.</p>
        </div>
      </div>
      
      <div className="login-main">
        <Card className="login-card">
          <div className="login-header">
            <h3>Welcome back</h3>
            <p>Login to your operator dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <Input 
              label="Company Slug"
              icon={Building2}
              placeholder="e.g. acme-logistics"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            
            <Input 
              label="Email"
              icon={Mail}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to={`/forgot-password${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`} className="forgot-link">Forgot password?</Link>
            </div>

            {errorMessage && (
              <p className="auth-inline-error" role="alert">{errorMessage}</p>
            )}
            
            <Button type="submit" variant="primary" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Get started</Link></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
