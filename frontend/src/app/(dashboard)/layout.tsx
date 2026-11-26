import { MainLayout } from '@/components/Layout';
import { useTokens, useAgents, useDecisions, usePortfolio, useValidation, useWebSocket, usePerformance, useAnalysisCycle } from '@/hooks/useApi';

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

  return <MainLayout>{children}</MainLayout>;
}