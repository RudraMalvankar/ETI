import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { motion } from 'framer-motion';

export const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useApexStore();

  const handleToggle = () => {
    toggleTheme();
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleToggle}
      className="p-2 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-strong)] transition-all shadow-sm flex items-center justify-center"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-purple-400" />
      )}
    </motion.button>
  );
};
