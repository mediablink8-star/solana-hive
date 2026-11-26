'use client';

import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-hive-bg p-8">
      <main>
        <div className="p-4 lg:p-6 xl:p-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}