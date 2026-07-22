import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden text-[var(--text-primary)]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-emerald text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] mb-6 hover:scale-105 transition-transform"
          >
            <Hexagon className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">{title}</h1>
          <p className="text-[var(--text-secondary)]">{subtitle}</p>
        </div>

        <div className="bg-[var(--bg-elevated)] p-8 shadow-soft border border-[var(--border-strong)] rounded-lg">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
