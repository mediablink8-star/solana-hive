'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-hive-bg">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16" style={{ marginLeft: sidebarOpen ? '18rem' : '5rem' }}>
        <div className="p-4 lg:p-6 xl:p-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}