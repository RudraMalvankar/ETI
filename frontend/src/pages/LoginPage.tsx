import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useApexStore } from '../store/useApexStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setActiveTab } = useApexStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for hackathon demo
    setActiveTab('dashboard'); // sync legacy state
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access the APEX platform.">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="technician@enterprise.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <a href="#" className="text-xs font-medium text-brand-400 hover:text-brand-300">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] mt-6 group"
        >
          Sign In
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-white hover:text-brand-400 transition-colors"
        >
          Request access
        </Link>
      </p>
    </AuthLayout>
  );
};
