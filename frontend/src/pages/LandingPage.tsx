import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';
import { Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-brand-500/30">
      
      {/* Super Simple Navbar for Landing Page */}
      <nav className="absolute top-0 left-0 w-full z-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-emerald text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">APEX</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Sign In</a>
          <a href="/register" className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-md border border-white/10">
            Get Started
          </a>
        </div>
      </nav>

      <HeroSection />
      <FeatureSection />
      
      {/* Simple Footer */}
      <footer className="py-12 border-t border-[var(--glass-border)] text-center text-[var(--text-secondary)]">
        <p className="text-sm">© {new Date().getFullYear()} APEX Enterprise. Built for Industrial AI.</p>
      </footer>
    </div>
  );
};
