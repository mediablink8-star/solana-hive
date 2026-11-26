'use client';

import React from 'react';

export default function OpenPositionsPage() {
  return (
      <div className="space-y-6 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Open Positions</h1>
            <p className="text-hive-textDim mt-1">Current paper trading positions and P&L</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono text-green">LIVE</span>
            </div>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-hive-textDim mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="1.5" />
            <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" />
          </svg>
          <h3 className="text-hive-text text-lg mb-2">No Open Positions</h3>
          <p className="text-hive-textDim">Execute a paper trade from the Token Scanner to open a position</p>
        </div>
      </div>
  );
}