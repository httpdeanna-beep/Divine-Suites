/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Layers, Play, Terminal, Settings, Download, User, LogOut, ShieldCheck } from 'lucide-react';
import { UserSession } from '../lib/supabaseService';

interface HeaderProps {
  activeTab: 'spec' | 'arch' | 'simulator' | 'deploy' | 'config';
  setActiveTab: (tab: 'spec' | 'arch' | 'simulator' | 'deploy' | 'config') => void;
  onExport: () => void;
  user: UserSession | null;
  onLogout: () => void;
}

export default function Header({ activeTab, setActiveTab, onExport, user, onLogout }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 select-none shrink-0" id="app-header">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-none flex items-center justify-center text-white font-bold text-lg font-sans">
          D
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight text-lg text-slate-900">DIVINE SUITES</span>
          <span className="text-[9px] font-mono text-slate-400 -mt-1 uppercase tracking-wider">Enterprise Spec Suite</span>
        </div>
        <div className="h-4 w-px bg-slate-200 mx-4 hidden sm:block"></div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-200 rounded-none hidden sm:block">
          v1.0.4-STABLE
        </span>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 md:gap-4 items-center text-xs font-bold uppercase tracking-widest text-slate-500 h-full">
        <button
          onClick={() => setActiveTab('spec')}
          className={`px-3 md:px-4 h-full flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'spec'
              ? 'text-slate-900 border-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          id="tab-spec"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Specification</span>
        </button>

        <button
          onClick={() => setActiveTab('arch')}
          className={`px-3 md:px-4 h-full flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'arch'
              ? 'text-slate-900 border-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          id="tab-arch"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 md:px-4 h-full flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'text-slate-900 border-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          id="tab-simulator"
        >
          <Play className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Booking Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`px-3 md:px-4 h-full flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'deploy'
              ? 'text-slate-900 border-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          id="tab-deploy"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">DevOps Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-3 md:px-4 h-full flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'text-slate-900 border-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          id="tab-config"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Configurator</span>
        </button>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3" id="header-actions">
        {user ? (
          <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-1.5" id="user-badge-container">
            <div className="flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-[11px] text-slate-600 max-w-[120px] sm:max-w-[180px] truncate" title={user.email}>
                {user.email}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sign Out"
              id="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('simulator')}
            className="border border-slate-200 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            id="btn-header-signin"
          >
            Sign In
          </button>
        )}

        <button
          onClick={onExport}
          className="bg-slate-900 hover:bg-slate-850 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border border-slate-900 active:scale-95"
          id="btn-export-spec"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Export Spec</span>
        </button>
      </div>
    </header>
  );
}
