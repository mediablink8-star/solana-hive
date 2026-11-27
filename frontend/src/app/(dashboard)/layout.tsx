'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTokens, useAgents, useDecisions, usePortfolio, useValidation, useWebSocket, usePerformance, useAnalysisCycle } from '@/hooks/useApi';

// Global error handler to catch useEffect errors
if (typeof window !== 'undefined') {
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', message, error);
    if (originalError) return originalError(message, source, lineno, colno, error);
    return false;
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
  });
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize all data hooks at the layout level so they're available to all pages
  useTokens();
  useAgents();
  useDecisions();
  usePortfolio();
  useValidation();
  useWebSocket();
  usePerformance();
  useAnalysisCycle();

  return (
    <ErrorBoundary>
      <MainLayout>{children}</MainLayout>
    </ErrorBoundary>
  );
}