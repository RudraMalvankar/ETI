import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BackendStatusBanner } from '../system/BackendStatusBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300 relative text-[var(--text-primary)]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden relative z-10">
        <BackendStatusBanner />
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};
