'use client';

import React, { useState } from 'react';
import { SpiderHive } from '@/components/SpiderHive';
import { useAgents, useDecisions, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { SpiderNode } from '@/types';

const AGENT_ROLES: Record<string, string> = {
  'Token Scout': 'Market Discovery',
  'Rug Detector': 'Security Analysis',
  'Technical Analyst': 'Price Action',
  'Social Intelligence': 'Narrative Detection',
  'Strategy Analyst': 'Trade Strategy',
  'Risk Manager': 'Risk Authority',
  'Execution Trader': 'Trade Execution',
  'Portfolio Manager': 'Portfolio Ops',
};

const AGENT_COLORS: Record<string, string> = {
  'Token Scout': 'hive-green',
  'Rug Detector': 'hive-red',
  'Technical Analyst': 'hive-purple',
  'Social Intelligence': 'hive-orange',
  'Strategy Analyst': 'hive-cyan',
  'Risk Manager': 'hive-red',
  'Execution Trader': 'hive-green',
  'Portfolio Manager': 'hive-purple',
};

function AgentDetailPanel({ node, agents, decisions, onClose }: {
  node: SpiderNode | null;
  agents: any[];
  decisions: any[];
  onClose: () => void;
}) {
  if (!node) return null;

  const agent = agents.find(a => a.id === node.id);
  const agentDecisions = decisions.filter(d => d.agent === node.name).slice(0, 20);
  
  const stateColors: Record<string, string> = {
    idle: 'hive-textDim',
    analyzing: 'hive-purple',
    communicating: 'hive-green',
    approving: 'hive-green',
    rejecting: 'hive-red',
    executing: 'hive-orange',
  };
  
  const stateLabels: Record<string, string> = {
    idle: 'IDLE',
    analyzing: 'ANALYZING',
    communicating: 'COMMUNICATING',
    approving: 'APPROVING',
    rejecting: 'REJECTING',
    executing: 'EXECUTING',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end bg-black/50 backdrop-blur-sm p-4 md:p-0"
         onClick={onClose}
         role="dialog"
         aria-modal="true"
         aria-label={`${node.name} details`}>
      <div className="w-full md:w-96 lg:w-[400px] glass-strong border-l border-cyan/30 rounded-xl md:rounded-l-xl overflow-hidden animate-slide-in"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-hive-border/50">
          <div className="flex items-center gap-3">
            <div className={clsx('w-3 h-3 rounded-full', AGENT_COLORS[node.name] || 'hive-cyan', agent?.status !== 'idle' && 'animate-pulse')} />
            <div>
              <p className="font-semibold text-hive-text">{node.name}</p>
              <p className="text-hive-textDim text-xs">{AGENT_ROLES[node.name] || node.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-hive-textMuted hover:text-red transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Current Status */}
          <div className="glass rounded-xl p-4 border border-hive-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Current State</span>
              <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full border', stateColors[agent?.status || 'idle'], 'border-current/50')}>
                {stateLabels[agent?.status || 'idle']}
              </span>
            </div>
            {agent?.currentTask && (
              <p className="text-hive-textDim text-sm font-mono">{agent.currentTask}</p>
            )}
            {!agent?.currentTask && agent?.status === 'idle' && (
              <p className="text-hive-textDim text-sm">Waiting for task assignment...</p>
            )}
          </div>

          {/* Latest Findings */}
          {agent?.latestFindings && (
            <div className="glass rounded-xl p-4 border border-hive-border/50">
              <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-2 block">Latest Findings</span>
              <p className="text-hive-text text-sm">{agent.latestFindings}</p>
            </div>
          )}

          {/* Recent Decisions */}
          <div className="glass rounded-xl p-4 border border-hive-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Recent Decisions</span>
              <span className="text-hive-textDim text-xs">{agentDecisions.length} total</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {agentDecisions.length > 0 ? (
                agentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-hive-bg/50 rounded-lg border border-hive-border/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={clsx(
                        'w-1.5 h-1.5 rounded-full',
                        decision.recommendation === 'BUY' ? 'bg-green' :
                        decision.recommendation === 'REJECT' ? 'bg-red' : 'bg-yellow'
                      )} />
                      <span className="text-xs font-mono truncate max-w-[120px]">{decision.mint.slice(0, 10)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                        decision.recommendation === 'BUY' ? 'bg-green/20 text-green' :
                        decision.recommendation === 'REJECT' ? 'bg-red/20 text-red' : 'bg-yellow/20 text-yellow'
                      )}>
                        {decision.recommendation}
                      </span>
                      <span className="text-hive-textDim text-[10px] font-mono">
                        {(decision.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-hive-textDim text-sm text-center py-4">No decisions yet</p>
              )}
            </div>
          </div>

          {/* Performance */}
          <div className="glass rounded-xl p-4 border border-hive-border/50">
            <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider mb-3 block">Performance</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="glass rounded-lg p-3">
                <p className="text-2xl font-bold font-mono text-green">0</p>
                <p className="text-hive-textDim text-xs">Successful</p>
              </div>
              <div className="glass rounded-lg p-3">
                <p className="text-2xl font-bold font-mono text-red">0</p>
                <p className="text-hive-textDim text-xs">Failed</p>
              </div>
              <div className="glass rounded-lg p-3">
                <p className="text-2xl font-bold font-mono text-cyan">0%</p>
                <p className="text-hive-textDim text-xs">Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HiveNetworkPage() {
  const { agents } = useAgents();
  const { decisions } = useDecisions();
  const { wsConnected } = useWebSocket();
  const [selectedNode, setSelectedNode] = useState<SpiderNode | null>(null);

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Hive Network</h1>
            <p className="text-hive-textDim mt-1">Real-time agent collaboration visualization</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-hive-border/50">
              <span className={clsx('w-2 h-2 rounded-full', wsConnected ? 'bg-green animate-pulse' : 'bg-red')} />
              <span className={clsx('text-xs font-mono', wsConnected ? 'text-green' : 'text-red')}>
                {wsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Network View */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="glass px-3 py-1.5 rounded-full border border-hive-border/50 flex items-center gap-2">
              <span className="text-hive-textDim text-xs font-mono">8 Agents Active</span>
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            </div>
          </div>
          <div className="h-[70vh] lg:h-[80vh] p-4">
            <SpiderHive 
              onNodeClick={(node) => setSelectedNode(node)} 
            />
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 px-4 glass px-4 py-3 rounded-xl border-hive-border/50">
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="text-hive-text font-semibold text-sm">AGENTS</span>
              {[
                { name: 'JARVIS', color: 'hive-cyan', role: 'Central Intelligence' },
                { name: 'Token Scout', color: 'hive-green', role: 'Market Discovery' },
                { name: 'Rug Detector', color: 'hive-red', role: 'Security' },
                { name: 'Technical Analyst', color: 'hive-purple', role: 'Price Action' },
                { name: 'Social Intelligence', color: 'hive-orange', role: 'Narrative' },
                { name: 'Strategy Analyst', color: 'hive-cyan', role: 'Strategy' },
                { name: 'Risk Manager', color: 'hive-red', role: 'Risk Authority' },
                { name: 'Execution Trader', color: 'hive-green', role: 'Execution' },
                { name: 'Portfolio Manager', color: 'hive-purple', role: 'Portfolio' },
              ].map((agent) => (
                <span key={agent.name} className="flex items-center gap-1.5 text-sm">
                  <span className={clsx('w-2 h-2 rounded-full', agent.color)} />
                  <span className="font-medium">{agent.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Detail Panel */}
        <AgentDetailPanel
          node={selectedNode}
          agents={agents}
          decisions={decisions}
          onClose={() => setSelectedNode(null)}
        />

        {/* Network Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Total Agents</p>
                <p className="text-2xl font-bold font-mono text-gradient-cyan mt-1">8</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
                  <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Active Connections</p>
                <p className="text-2xl font-bold font-mono text-gradient-green mt-1">15</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                  <path d="M12 1v4M12 19v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Messages Today</p>
                <p className="text-2xl font-bold font-mono text-gradient-purple mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-hive-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Analysis Cycles</p>
                <p className="text-2xl font-bold font-mono text-gradient-orange mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}