import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { useApexStore } from '../store/useApexStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTab } = useApexStore();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('dashboard');
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="Create Workspace"
      subtitle="Set up your organization's industrial intelligence hub."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="Jane Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Organization
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Building className="h-4 w-4" />
            </div>
            <input
              type="text"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="Acme Industrial Corp"
              required
            />
          </div>
        </div>

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
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] mt-4 group text-sm"
        >
          Create Workspace
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
