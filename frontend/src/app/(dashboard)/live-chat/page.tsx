'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../../../components/Layout/MainLayout';

export default function LiveChatPage() {
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-gradient-cyan font-display font-bold text-3xl lg:text-4xl">Live Team Chat</h1>
            <p className="text-hive-textDim mt-1">Real-time agent communications and coordination</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-bgCardHover/50 border border-hive-border/50">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-mono text-green">LIVE</span>
            </div>
          </div>
        </div>

        <div className="bg-hive-bgCardHover/50 rounded-2xl border border-hive-border/50 overflow-hidden flex flex-col h-[70vh]">
          <div className="px-5 py-4 border-b border-hive-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-hive-text">Agent Communications</h3>
              <span className="text-hive-textDim text-xs font-mono">{messages.length} messages</span>
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
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
                <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.agent === 'User' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      msg.agent === 'User' ? 'bg-purple/20' : 
                      msg.agent === 'JARVIS' ? 'bg-cyan/20' :
                      msg.type === 'risk' ? 'bg-red/20' :
                      msg.type === 'trade' ? 'bg-green/20' : 'bg-orange/20'
                    }`}>
                      <span className="text-xs font-bold text-hive-text">{msg.agent.slice(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-hive-textDim">{msg.agent}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-hive-bg/50 border border-hive-border/30 text-hive-textDim">{msg.type}</span>
                      <span className="text-xs text-hive-textDim font-mono">{msg.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-hive-text">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}