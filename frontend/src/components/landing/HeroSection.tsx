import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-[var(--bg-primary)] pt-[140px] pb-[100px] min-h-screen flex items-center justify-center premium-grid-bg border-b border-[var(--glass-border)]">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-brand-500/15 rounded-full blur-[150px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[150px] opacity-60 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-medium text-sm mb-8 backdrop-blur-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
          APEX Enterprise OS is now available
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
        >
          The <span className="bg-gradient-to-r from-brand-400 via-accent-purple to-accent-emerald text-transparent bg-clip-text">Decision Intelligence</span> <br />
          Platform for Industry
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto font-medium"
        >
          APEX combines causal shadow simulation, live knowledge graphs, and executable runbooks to keep mission-critical assets running. Predict failures before they happen.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] group w-full sm:w-auto"
          >
            Start Mission
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--glass-border)] border border-[var(--glass-border)] text-white font-bold text-lg transition-all w-full sm:w-auto"
          >
            View Demo
          </button>
        </motion.div>
      </div>
    </div>
  );
};
