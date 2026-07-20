import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BackendStatusBanner } from '../system/BackendStatusBanner';
import { useApexStore } from '../../store/useApexStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useApexStore();

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-900 text-slate-100'}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <BackendStatusBanner />
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
