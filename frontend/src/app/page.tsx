'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/command-center');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-hive-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-cyan/50 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-hive-textMuted">Loading SOLANA HIVE...</p>
      </div>
    </div>
  );
}