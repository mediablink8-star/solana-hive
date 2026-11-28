'use client';

import React from 'react';
import { useAgents, useDecisions } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { Brain, Shield, Zap, Search, Target, Users, TrendingUp, BarChart } from 'lucide-react';

const AGENT_SPECS = [
  { id: 'jarvis', name: 'JARVIS', role: 'Central Intelligence', icon: Brain, color: 'hive-cyan', description: 'Orchestrates all hive operations and coordinates agent communication' },
  { id: 'token-scout', name: 'Token Scout', role: 'Market Discovery', icon: Search, color: 'hive-green', description: 'Discovers new token launches and monitors liquidity pools' },
  { id: 'rug-detector', name: 'Rug Detector', role: 'Security Analysis', icon: Shield, color: 'hive-red', description: 'Analyzes contract risks, mint authorities, and liquidity locks' },
  { id: 'technical-analyst', name: 'Technical Analyst', role: 'Price Action', icon: TrendingUp, color: 'hive-purple', description: 'Computes technical indicators, chart patterns, and momentum signals' },
  { id: 'social-intelligence', name: 'Social Intelligence', role: 'Narrative Detection', icon: Users, color: 'hive-orange', description: 'Monitors social sentiment, influencer activity, and narrative formation' },
  { id: 'strategy-analyst', name: 'Strategy Analyst', role: 'Trade Strategy', icon: Target, color: 'hive-cyan', description: 'Evaluates risk/reward, position sizing, and entry/exit strategies' },
  { id: 'risk-manager', name: 'Risk Manager', role: 'Risk Authority', icon: Shield, color: 'hive-red', description: 'Enforces portfolio limits, stop-losses, and correlation controls' },
  { id: 'execution-trader', name: 'Execution Trader', role: 'Trade Execution', icon: Zap, color: 'hive-green', description: 'Optimizes order routing, slippage, and MEV protection' },
  { id: 'portfolio-manager', name: 'Portfolio Manager', role: 'Portfolio Ops', icon: BarChart, color: 'hive-purple', description: 'Manages rebalancing, yield optimization, and position lifecycle' },
];

export default function AgentHQPage() {
  const { agents } = useAgents();
  const { decisions } = useDecisions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Agent HQ</h1>
          <p className="text-hive-textDim mt-1">Individual agent profiles, performance, and decision history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENT_SPECS.map((spec, idx) => {
          const agent = agents.find(a => a.id === spec.id);
          const agentDecisions = decisions.filter(d => d.agent === spec.name);
          const successfulDecisions = agentDecisions.filter(d => d.recommendation === 'BUY').length;
          const totalDecisions = agentDecisions.length;
          const Icon = spec.icon;
          
          return (
            <div key={spec.id} className={clsx('glass rounded-2xl border p-5 transition-all', agent?.status !== 'idle' ? 'border-cyan/30 bg-cyan/5' : 'border-hive-border/50')}>
              <div className="flex items-start gap-4">
                <div className={clsx('w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0', `${spec.color}/10`)}>
                  <Icon className={clsx('w-7 h-7', spec.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-hive-text">{spec.name}</p>
                      <p className="text-hive-textDim text-xs font-mono">{spec.role}</p>
                    </div>
                    <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full border', agent?.status !== 'idle' ? 'text-green border-green/50 bg-green/10' : 'text-hive-textDim border-hive-border/50')}>
                      {agent?.status?.toUpperCase() || 'IDLE'}
                    </span>
                  </div>
                  <p className="text-hive-textDim text-sm mb-3 line-clamp-2">{spec.description}</p>
                  
                  {agent?.currentTask && (
                    <div className="glass rounded-lg p-2 mb-3 border border-hive-border/30">
                      <p className="text-hive-textDim text-[10px] font-mono uppercase tracking-wider mb-1">Current Task</p>
                      <p className="text-hive-text text-xs font-mono">{agent.currentTask}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t border-hive-border/50">
                    <div className="flex-1 glass rounded-lg p-2 border border-hive-border/30 text-center">
                      <p className="text-xl font-bold font-mono text-gradient-cyan">{totalDecisions}</p>
                      <p className="text-hive-textDim text-[10px]">Decisions</p>
                    </div>
                    <div className="flex-1 glass rounded-lg p-2 border border-hive-border/30 text-center">
                      <p className="text-xl font-bold font-mono text-green">{successfulDecisions}</p>
                      <p className="text-hive-textDim text-[10px]">Buy Signals</p>
                    </div>
                    <div className="flex-1 glass rounded-lg p-2 border border-hive-border/30 text-center">
                      <p className="text-xl font-bold font-mono text-purple">{agentDecisions.length > 0 ? Math.round((successfulDecisions / agentDecisions.length) * 100) : 0}%</p>
                      <p className="text-hive-textDim text-[10px]">Conviction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}