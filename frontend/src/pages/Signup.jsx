import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Lock, Mail, Building2, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Card from '../components/Card/Card';
import './Login.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    password: ''
  });

  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      alert('Signup failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="login-container">
      <div className="login-side-decoration">
        <div className="deco-content">
          <div className="brand-badge">
            <Box size={24} />
            <span>CoreInventory</span>
          </div>
          <h2>Scale your operations with confidence.</h2>
          <p>Join hundreds of enterprise warehouses optimizing their supply chain with CoreInventory.</p>
        </div>
      </div>

      <div className="login-main">
        <Card className="login-card">
          <div className="login-header">
            <h3>Create your account</h3>

          </div>

          <form onSubmit={handleSignup} className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                name="companyName"
                label="Company Name"
                icon={Building2}
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
              <Input
                name="slug"
                label="Company Slug"
                placeholder="acme-corp"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              name="adminName"
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              value={formData.adminName}
              onChange={handleChange}
              required
            />

            <Input
              name="adminEmail"
              label="Admin Email"
              icon={Mail}
              type="email"
              placeholder="admin@company.com"
              value={formData.adminEmail}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="primary" className="login-submit">
              Create Account
            </Button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
