'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/Layout';
import { useDecisions, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import type { AgentDecision } from '@/types';

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

export default function LiveChatPage() {
  const { decisions } = useDecisions();
  const { wsConnected } = useWebSocket();
  const [messages, setMessages] = useState<Array<{
    id: string;
    agent: string;
    type: 'analysis' | 'decision' | 'communication' | 'trade' | 'risk';
    content: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Generate chat messages from decisions
  useEffect(() => {
    const decisionMessages = decisions.slice(0, 50).map((decision, index) => ({
      id: `decision-${decision.id}`,
      agent: decision.agent,
      type: decision.recommendation === 'REJECT' ? 'risk' : 'decision' as const,
      content: `${decision.recommendation} - ${decision.findings} (Confidence: ${(decision.confidence * 100).toFixed(0)}%)`,
      timestamp: new Date(decision.created_at),
    }));
    setMessages(decisionMessages.reverse());
  }, [decisions]);

  // Auto-generate simulated agent communications
  useEffect(() => {
    const communicationTemplates = [
      { agent: 'Token Scout', type: 'communication' as const, content: 'Discovered new token with high liquidity: {mint}' },
      { agent: 'Rug Detector', type: 'analysis' as const, content: 'Security scan complete for {mint}: No mint authority, low holder concentration' },
      { agent: 'Technical Analyst', type: 'analysis' as const, content: 'Price action shows bullish momentum on {mint}, volume increasing 45%' },
      { agent: 'Social Intelligence', type: 'communication' as const, content: 'Narrative detection: {mint} trending on X with 2.3k mentions in last hour' },
      { agent: 'Strategy Analyst', type: 'decision' as const, content: 'Strategy evaluation: {mint} meets criteria for momentum strategy' },
      { agent: 'Risk Manager', type: 'risk' as const, content: 'Risk assessment: {mint} within portfolio limits, position size 8%' },
      { agent: 'Execution Trader', type: 'trade' as const, content: 'Paper trade executed: {mint} - 0.5 SOL at market price' },
      { agent: 'Portfolio Manager', type: 'communication' as const, content: 'Portfolio updated: {mint} position opened, total exposure 12%' },
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance per interval
        const template = communicationTemplates[Math.floor(Math.random() * communicationTemplates.length)];
        const mints = ['So11111111111111111111111111111111111111112', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTt1', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xrnBepc13FmF'];
        const mint = mints[Math.floor(Math.random() * mints.length)];
        
        const newMsg = {
          id: `comm-${Date.now()}`,
          agent: template.agent,
          type: template.type,
          content: template.content.replace('{mint}', mint.slice(0, 8) + '...'),
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev.slice(-99), newMsg]);
      }
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, [decisions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const msg = {
        id: `user-${Date.now()}`,
        agent: 'User',
        type: 'communication' as const,
        content: newMessage.trim(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      // Simulate agent response
      setTimeout(() => {
        const responses = [
          'Acknowledged. Analyzing...',
          'Processing your request...',
          'Task queued for appropriate agent.',
          'Initiating analysis cycle...',
        ];
        const response = {
          id: `agent-${Date.now()}`,
          agent: 'JARVIS',
          type: 'communication' as const,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <MainLayout>
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

        {/* Chat Interface */}
        <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden flex flex-col h-[70vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-hive-text">Agent Communications</h3>
              <span className="text-hive-textDim text-xs font-mono">{messages.length} messages</span>
            </div>
            <div className="flex items-center gap-2">
              <select className="glass rounded-lg px-3 py-1.5 text-sm text-hive-text border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent">
                <option value="all">All Agents</option>
                <option value="jarvis">JARVIS</option>
                <option value="token-scout">Token Scout</option>
                <option value="rug-detector">Rug Detector</option>
                <option value="technical-analyst">Technical Analyst</option>
                <option value="social-intelligence">Social Intelligence</option>
                <option value="strategy-analyst">Strategy Analyst</option>
                <option value="risk-manager">Risk Manager</option>
                <option value="execution-trader">Execution Trader</option>
                <option value="portfolio-manager">Portfolio Manager</option>
              </select>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: '60vh' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-hive-textDim">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
                </svg>
                <p className="text-lg">No communications yet</p>
                <p className="text-sm">Agent activity will appear here</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={clsx(
                    'flex gap-3 animate-fade-in',
                    msg.agent === 'User' && 'flex-row-reverse'
                  )}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={clsx(
                      'w-8 h-8 rounded-xl flex items-center justify-center',
                      msg.agent === 'User' ? 'bg-purple/20' : 
                      msg.agent === 'JARVIS' ? 'bg-cyan/20' :
                      AGENT_COLORS[msg.agent] ? AGENT_COLORS[msg.agent] + '/20' : 'bg-hive-border/50'
                    )}>
                      {msg.agent === 'User' ? (
                        <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                          <circle cx="12" cy="7" r="4" strokeWidth="2" />
                        </svg>
                      ) : msg.agent === 'JARVIS' ? (
                        <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{msg.agent.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className={clsx(
                    'flex-1 min-w-0',
                    msg.agent === 'User' && 'text-right'
                  )}>
                    <div className={clsx(
                      'inline-block max-w-[70%] px-4 py-2 rounded-2xl',
                      msg.agent === 'User' 
                        ? 'bg-gradient-to-r from-purple/30 to-cyan/30 border border-purple/50 text-hive-text' 
                        : msg.type === 'risk'
                        ? 'bg-red/10 border border-red/30 text-hive-text'
                        : msg.type === 'trade'
                        ? 'bg-green/10 border border-green/30 text-hive-text'
                        : 'bg-hive-bgCard border border-hive-border/50 text-hive-text'
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.agent}</span>
                        <span className="text-hive-textDim text-[10px] font-mono">{msg.timestamp.toLocaleTimeString()}</span>
                        <span className={clsx(
                          'text-[9px] font-mono px-1.5 py-0.5 rounded-full',
                          msg.type === 'analysis' ? 'bg-purple/20 text-purple' :
                          msg.type === 'decision' ? 'bg-cyan/20 text-cyan' :
                          msg.type === 'trade' ? 'bg-green/20 text-green' :
                          msg.type === 'risk' ? 'bg-red/20 text-red' :
                          'bg-hive-border/50 text-hive-textDim'
                        )}>
                          {msg.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            )}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-hive-border/50">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a message to the team... (Enter to send)"
                  className="w-full glass rounded-xl px-4 py-3 text-hive-text placeholder-hive-textDim border border-hive-border/50 focus:outline-none focus:border-cyan/50 bg-transparent pr-12"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan to-purple flex items-center justify-center text-hive-bg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}