import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useApexStore } from '../store/useApexStore';
import { loginUser, registerUser } from '../services/authServices';
import { getStoredAccessToken, getStoredRefreshToken } from '../services/authStorage';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setActiveTab, setAuthSession } = useApexStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({ username: email, password });
      const profile = await loginUser({ username: email, password });
      const accessToken = getStoredAccessToken();
      const refreshToken = getStoredRefreshToken();

      if (!accessToken || !refreshToken) {
        throw new Error('Session tokens were not stored correctly.');
      }

      setAuthSession({ user: profile, accessToken, refreshToken });
      setActiveTab('dashboard');
      toast.success('Workspace created and signed in.');
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to create workspace.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Workspace"
      subtitle="Set up your organization's industrial intelligence hub."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="jane@acme.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] mt-4 group text-sm"
        >
          {isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}
          {!isSubmitting && (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-white hover:text-brand-400 transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};
