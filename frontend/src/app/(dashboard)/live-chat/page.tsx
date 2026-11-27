'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDecisions, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { AgentDecision } from '@/types';

const AGENT_COLORS: Record<string, string> = {
  'Token Scout': 'bg-green/20',
  'Rug Detector': 'bg-red/20',
  'Technical Analyst': 'bg-purple/20',
  'Social Intelligence': 'bg-orange/20',
  'Strategy Analyst': 'bg-cyan/20',
  'Risk Manager': 'bg-red/20',
  'Execution Trader': 'bg-green/20',
  'Portfolio Manager': 'bg-purple/20',
  'JARVIS': 'bg-cyan/20',
  'User': 'bg-purple/20',
  'System': 'bg-yellow/20',
};

const AGENT_TEXT_COLORS: Record<string, string> = {
  'Token Scout': 'text-green',
  'Rug Detector': 'text-red',
  'Technical Analyst': 'text-purple',
  'Social Intelligence': 'text-orange',
  'Strategy Analyst': 'text-cyan',
  'Risk Manager': 'text-red',
  'Execution Trader': 'text-green',
  'Portfolio Manager': 'text-purple',
  'JARVIS': 'text-cyan',
  'User': 'text-purple',
  'System': 'text-yellow',
};

type ChatMessage = {
  id: string;
  agent: string;
  type: 'analysis' | 'decision' | 'communication' | 'trade' | 'risk' | 'system';
  content: string;
  timestamp: Date;
  mint?: string;
  confidence?: number;
  recommendation?: string;
};

export default function LiveChatPage() {
  const { decisions } = useDecisions();
  const { wsConnected } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'analysis' | 'decision' | 'communication' | 'trade' | 'risk' | 'system'>('all');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Convert decisions to chat messages
  const decisionMessages = useMemo(() => 
    decisions.slice(0, 50).map((d): ChatMessage => ({
      id: `decision-${d.id}`,
      agent: d.agent,
      type: d.recommendation === 'REJECT' ? 'risk' : d.recommendation === 'BUY' ? 'trade' : 'decision',
      content: d.findings,
      timestamp: new Date(d.created_at),
      mint: d.mint,
      confidence: d.confidence,
      recommendation: d.recommendation,
    })),
  [decisions]);

  // Merge with existing messages
  const allMessages = useMemo(() => {
    const combined = [...messages, ...decisionMessages];
    // Sort by timestamp
    combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    // Deduplicate by id
    const seen = new Set();
    return combined.filter(msg => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages, decisionMessages]);

  const filteredMessages = useMemo(() => {
    if (filter === 'all') return allMessages;
    return allMessages.filter(m => m.type === filter);
  }, [allMessages, filter]);

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages, autoScroll]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const msg: ChatMessage = {
        id: `user-${Date.now()}`,
        agent: 'User',
        type: 'communication',
        content: newMessage.trim(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      setAutoScroll(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setAutoScroll(isAtBottom);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Live Team Chat</h1>
          <p className="text-hive-textDim mt-1">Real-time agent communications and coordination</p>
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

      {/* Chat Container */}
      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden flex flex-col h-[70vh]">
        {/* Header with filters */}
        <div className="px-5 py-4 border-b border-hive-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-hive-text">Agent Communications</h3>
            <span className="text-hive-textDim text-xs font-mono">{filteredMessages.length} messages</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'analysis', 'decision', 'communication', 'trade', 'risk', 'system'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200',
                  filter === f
                    ? 'bg-gradient-to-r from-cyan to-purple text-hive-bg font-semibold shadow-glow-cyan'
                    : 'glass text-hive-textDim hover:text-hive-text hover:bg-hive-bgCardHover/50 border border-hive-border/50'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Message List */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: '60vh' }}
        >
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-hive-textDim">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
              </svg>
              <p className="text-lg">No communications yet</p>
              <p className="text-sm">Agent activity will appear here as analysis cycles run</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.agent === 'User' ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${AGENT_COLORS[msg.agent] || 'bg-hive-bgCardHover/50'}`}>
                    <span className={`text-xs font-bold ${AGENT_TEXT_COLORS[msg.agent] || 'text-hive-text'}`}>
                      {msg.agent === 'User' ? 'US' : msg.agent.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-mono ${AGENT_TEXT_COLORS[msg.agent] || 'text-hive-text'}`}>{msg.agent}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-hive-bg/50 border border-hive-border/30 text-hive-textDim">{msg.type}</span>
                    {msg.confidence !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded bg-hive-bg/50 border border-hive-border/30 text-cyan">
                        {(msg.confidence * 100).toFixed(0)}% conf
                      </span>
                    )}
                    {msg.recommendation && (
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded',
                        msg.recommendation === 'BUY' ? 'bg-green/20 text-green' :
                        msg.recommendation === 'REJECT' ? 'bg-red/20 text-red' : 'bg-yellow/20 text-yellow'
                      )}>
                        {msg.recommendation}
                      </span>
                    )}
                    <span className="text-xs text-hive-textDim font-mono">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-hive-text">{msg.content}</p>
                  {msg.mint && (
                    <p className="text-hive-textDim text-xs font-mono mt-1 truncate max-w-[300px]">
                      Mint: {msg.mint.slice(0, 16)}...
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-hive-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message to the team..."
              className="flex-1 glass rounded-xl px-4 py-2 border border-hive-border/50 focus:outline-none focus:border-cyan/50 text-hive-text placeholder-hive-textDim"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="glass px-6 py-2 rounded-xl border border-cyan/50 text-cyan hover:bg-cyan/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Send
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-hive-textDim">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4 rounded border-hive-border/50 bg-hive-bg text-cyan focus:ring-cyan/50"
              />
              Auto-scroll
            </label>
            <span className="font-mono">{allMessages.length} total messages</span>
          </div>
        </div>
      </div>
    </div>
  );
}