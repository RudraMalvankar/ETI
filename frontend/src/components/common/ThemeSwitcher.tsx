import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { motion } from 'framer-motion';

export const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useApexStore();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] transition-all shadow-sm"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? <Sun className="w-4 h-4 text-accent-amber" /> : <Moon className="w-4 h-4 text-accent-purple" />}
    </motion.button>
  );
};
