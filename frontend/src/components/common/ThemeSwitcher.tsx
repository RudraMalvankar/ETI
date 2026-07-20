import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';

export const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useApexStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
    </button>
  );
};
