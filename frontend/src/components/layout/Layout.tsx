import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { BackendStatusBanner } from '../system/BackendStatusBanner';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-base)] relative text-[var(--text-primary)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden relative z-10 pb-16 md:pb-0">
        <BackendStatusBanner />
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6 md:space-y-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};
