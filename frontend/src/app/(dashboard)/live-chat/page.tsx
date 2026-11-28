'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAgents, useWebSocket } from '@/hooks/useApi';
import { clsx } from 'clsx';
import { Send, Bot, User, Zap, Brain, Shield, Search, TrendingUp, AlertTriangle } from 'lucide-react';

const MOCK_MESSAGES = [
  { id: 1, agent: 'JARVIS', role: 'Central Intelligence', content: 'Hive network initialized. All 8 agents online and operational.', timestamp: '10:00:00', type: 'system' },
  { id: 2, agent: 'Token Scout', role: 'Market Discovery', content: 'New token detected: $BONK - 5M liquidity, 150K holders. Analyzing...', timestamp: '10:01:23', type: 'analysis' },
  { id: 3, agent: 'Rug Detector', role: 'Security Analysis', content: '$BONK contract verified: No mint authority, liquidity locked 1 year. Risk score: LOW', timestamp: '10:01:45', type: 'security' },
  { id: 4, agent: 'Technical Analyst', role: 'Price Action', content: '$BONK showing bullish divergence on 1h RSI. Volume increasing 40% over 24h.', timestamp: '10:02:10', type: 'analysis' },
  { id: 5, agent: 'Social Intelligence', role: 'Narrative Detection', content: 'Strong social momentum for $BONK. 500% mention increase on X/Twitter last 6h.', timestamp: '10:02:35', type: 'sentiment' },
  { id: 6, agent: 'Strategy Analyst', role: 'Trade Strategy', content: 'Favorable risk/reward for $BONK long. Entry: 0.000022, Stop: 0.000018, Target: 0.000035', timestamp: '10:03:00', type: 'strategy' },
  { id: 7, agent: 'Risk Manager', role: 'Risk Authority', content: 'Position size approved: 2% portfolio allocation. Within risk parameters.', timestamp: '10:03:15', type: 'approval' },
  { id: 8, agent: 'Execution Trader', role: 'Trade Execution', content: 'Executing BUY order: 5M $BONK @ 0.000022 via Jito bundle. Slippage: 0.1%', timestamp: '10:03:30', type: 'execution' },
  { id: 9, agent: 'Portfolio Manager', role: 'Portfolio Ops', content: 'Position opened: 5M $BONK (0.11 SOL). Portfolio rebalancing scheduled in 4h.', timestamp: '10:03:45', type: 'portfolio' },
  { id: 10, agent: 'JARVIS', role: 'Central Intelligence', content: 'Trade cycle complete. $BONK position active. Monitoring for exit signals.', timestamp: '10:04:00', type: 'system' },
];

const AGENT_COLORS: Record<string, string> = {
  'JARVIS': 'hive-cyan',
  'Token Scout': 'hive-green',
  'Rug Detector': 'hive-red',
  'Technical Analyst': 'hive-purple',
  'Social Intelligence': 'hive-orange',
  'Strategy Analyst': 'hive-cyan',
  'Risk Manager': 'hive-red',
  'Execution Trader': 'hive-green',
  'Portfolio Manager': 'hive-purple',
};

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'JARVIS': Brain,
  'Token Scout': Search,
  'Rug Detector': Shield,
  'Technical Analyst': TrendingUp,
  'Social Intelligence': Zap,
  'Strategy Analyst': Zap,
  'Risk Manager': Shield,
  'Execution Trader': Send,
  'Portfolio Manager': Bot,
};

export default function LiveChatPage() {
  const { agents } = useAgents();
  const { wsConnected } = useWebSocket();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'system' | 'analysis' | 'security' | 'sentiment' | 'strategy' | 'approval' | 'execution' | 'portfolio'>('all');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredMessages = messages.filter(m => filter === 'all' || m.type === filter);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now(),
      agent: 'You',
      role: 'Operator',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      type: 'user' as const,
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Live Chat</h1>
          <p className="text-hive-textDim mt-1">Real-time agent communication and decision log</p>
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

      <div className="glass rounded-2xl border border-hive-border/50 overflow-hidden flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-hive-border/50 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {['all', 'system', 'analysis', 'security', 'sentiment', 'strategy', 'approval', 'execution', 'portfolio'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={clsx('px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-colors', filter === f ? 'bg-cyan/20 text-cyan border border-cyan/30' : 'text-hive-textMuted hover:text-hive-text hover:bg-hive-bgCard/50')}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
          {filteredMessages.map((msg, idx) => {
            const Icon = AGENT_ICONS[msg.agent] || Bot;
            const color = AGENT_COLORS[msg.agent] || 'hive-cyan';
            const isUser = msg.agent === 'You';
            
            return (
              <div key={msg.id} className={clsx('flex gap-3 animate-slide-in', isUser && 'flex-row-reverse')}>
                {!isUser && (
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', `${color}/10`)}>
                    <Icon className={clsx('w-4 h-4', color)} />
                  </div>
                )}
                <div className={clsx('flex-1 min-w-0 glass rounded-xl p-3 border', isUser ? 'border-cyan/30 bg-cyan/5' : 'border-hive-border/50')}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={clsx('font-medium text-sm', isUser ? 'text-cyan' : color)}>{msg.agent}</span>
                      <span className="text-hive-textDim text-[10px] font-mono">{msg.role}</span>
                      <span className={clsx('text-[10px] font-mono px-1.5 py-0.5 rounded-full', 
                        msg.type === 'system' ? 'bg-cyan/20 text-cyan' :
                        msg.type === 'analysis' ? 'bg-purple/20 text-purple' :
                        msg.type === 'security' ? 'bg-red/20 text-red' :
                        msg.type === 'sentiment' ? 'bg-orange/20 text-orange' :
                        msg.type === 'strategy' ? 'bg-green/20 text-green' :
                        msg.type === 'approval' ? 'bg-emerald/20 text-emerald' :
                        msg.type === 'execution' ? 'bg-blue/20 text-blue' :
                        msg.type === 'portfolio' ? 'bg-pink/20 text-pink' :
                        'bg-hive-border/50 text-hive-textDim'
                      )}>{msg.type.toUpperCase()}</span>
                    </div>
                    <span className="text-hive-textDim text-[10px] font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-hive-text text-sm">{msg.content}</p>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan/10">
                    <User className="w-4 h-4 text-cyan" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-hive-border/50">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Send message to hive..."
                className="w-full bg-hive-bg/50 border border-hive-border/50 rounded-lg px-4 py-3 text-hive-text placeholder-hive-textDim focus:outline-none focus:border-cyan/50"
              />
            </div>
            <button onClick={handleSend} disabled={!input.trim()} className="w-12 h-12 rounded-xl bg-cyan flex items-center justify-center text-hive-bg hover:bg-cyanGlow transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}