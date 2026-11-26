'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store';
import { clsx } from 'clsx';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, commandPaletteOpen, closeCommandPalette } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeCommandPalette]);

  return (
    <div className="min-h-screen bg-hive-bg">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan/5 via-transparent to-purple/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple/5 via-transparent to-cyan/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-green/3 via-transparent to-orange/3 blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2300e5ff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        className={clsx(
          'min-h-screen pt-16 pb-8 transition-all duration-300',
          sidebarOpen ? 'lg:ml-72 ml-20' : 'lg:ml-20 ml-20'
        )}
      >
        <div className="p-4 lg:p-6 xl:p-8 max-w-full">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={closeCommandPalette}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div
            className="w-full max-w-2xl glass-strong border border-cyan/30 rounded-2xl shadow-glow-cyan overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-hive-border/50">
              <div className="flex items-center gap-2">
                <kbd className="text-xs font-mono px-2 py-0.5 rounded bg-hive-bg/50 border border-hive-border/30">⌘K</kbd>
                <span className="text-hive-text font-medium">Command Palette</span>
                <span className="flex-1" />
                <span className="text-hive-textDim text-xs font-mono">Type to search...</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search commands, tabs, actions..."
              className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-hive-text placeholder-hive-textDim"
              autoFocus
            />
            <div className="max-h-96 overflow-y-auto p-4">
              <div className="space-y-1">
                {[
                  { label: 'Go to Command Center', shortcut: '1', action: () => {} },
                  { label: 'Go to Hive Network', shortcut: '2', action: () => {} },
                  { label: 'Go to Agent HQ', shortcut: '3', action: () => {} },
                  { label: 'Go to Live Chat', shortcut: '4', action: () => {} },
                  { label: 'Run Analysis Cycle', shortcut: 'A', action: () => {} },
                  { label: 'Execute Paper Trade', shortcut: 'T', action: () => {} },
                  { label: 'View Portfolio', shortcut: 'P', action: () => {} },
                  { label: 'Settings', shortcut: 'S', action: () => {} },
                ].map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => { cmd.action(); closeCommandPalette(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-hive-bgCardHover/50 transition-colors text-hive-text"
                  >
                    <span>{cmd.label}</span>
                    <kbd className="text-xs font-mono px-1.5 py-0.5 rounded bg-hive-bg/50 border border-hive-border/30 text-hive-textDim">
                      {cmd.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}