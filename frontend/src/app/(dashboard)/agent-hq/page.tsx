'use client';

import React from 'react';
import { useAgents, useDecisions, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { Agent, AgentDecision } from '@/types';

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

function AgentCard({ agent, decisions }: { agent: Agent; decisions: AgentDecision[] }) {
  const agentDecisions = decisions.filter(d => d.agent === agent.name);
  const buyCount = agentDecisions.filter(d => d.recommendation === 'BUY').length;
  const rejectCount = agentDecisions.filter(d => d.recommendation === 'REJECT').length;
  const holdCount = agentDecisions.filter(d => d.recommendation === 'HOLD').length;
  const avgConfidence = agentDecisions.length > 0
    ? agentDecisions.reduce((sum, d) => sum + d.confidence, 0) / agentDecisions.length
    : 0;
  const color = AGENT_COLORS[agent.name] || 'hive-cyan';
  const role = AGENT_ROLES[agent.name] || agent.role;

  return (
    <div className="glass rounded-2xl border border-hive-border/50 hover:border-current/30 transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-5 border-b border-hive-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative">
              <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center', color + '/20')}>
                <div className={clsx('w-8 h-8 rounded-xl', color)} />
              </div>
              <div className={clsx('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-hive-bg', color, agent.status !== 'idle' && 'animate-pulse')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-hive-text text-lg truncate">{agent.name}</h3>
                <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full border', stateColors[agent.status], 'border-current/50')}>
                  {stateLabels[agent.status]}
                </span>
              </div>
              <p className="text-hive-textDim text-sm truncate">{role}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold font-mono text-gradient-cyan">{agentDecisions.length}</p>
            <p className="text-hive-textDim text-xs">Total Decisions</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 border-b border-hive-border/50">
        <div className="grid grid-cols-4 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold font-mono text-green">{buyCount}</p>
            <p className="text-hive-textDim text-xs">BUY</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold font-mono text-yellow">{holdCount}</p>
            <p className="text-hive-textDim text-xs">HOLD</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold font-mono text-red">{rejectCount}</p>
            <p className="text-hive-textDim text-xs">REJECT</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold font-mono text-cyan">{(avgConfidence * 100).toFixed(0)}%</p>
            <p className="text-hive-textDim text-xs">Avg Confidence</p>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {(agent.currentTask || agent.latestFindings) && (
        <div className="px-5 pb-5">
          {agent.currentTask && (
            <div className="glass rounded-xl p-3 mb-3 border border-hive-border/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
                <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Current Task</span>
              </div>
              <p className="text-hive-text text-sm font-mono">{agent.currentTask}</p>
            </div>
          )}
          {agent.latestFindings && (
            <div className="glass rounded-xl p-3 border border-hive-border/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Latest Findings</span>
              </div>
              <p className="text-hive-textDim text-sm line-clamp-2">{agent.latestFindings}</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Decisions */}
      {agentDecisions.length > 0 && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-hive-textDim text-xs font-mono uppercase tracking-wider">Recent Decisions</span>
            <span className="text-hive-textDim text-xs">{agentDecisions.length} total</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {agentDecisions.slice(0, 8).map((decision) => (
              <div key={decision.id} className="glass rounded-xl p-3 border border-hive-border/30 hover:border-current/30 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={clsx(
                      'w-2 h-2 rounded-full',
                      decision.recommendation === 'BUY' ? 'bg-green' :
                      decision.recommendation === 'REJECT' ? 'bg-red' : 'bg-yellow'
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs font-mono truncate max-w-[150px]">{decision.mint.slice(0, 12)}...</p>
                      <p className="text-hive-textDim text-[10px]">
                        {new Date(decision.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={clsx(
                      'text-[10px] font-mono px-2 py-0.5 rounded-full',
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentHQPage() {
  const { agents } = useAgents();
  const { decisions } = useDecisions();
  const { wsConnected } = useWebSocket();

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Agent HQ</h1>
            <p className="text-hive-textDim mt-1">Individual agent profiles, activity, and decision history</p>
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

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} decisions={decisions} />
          ))}
        </div>
      </div>
  );
}