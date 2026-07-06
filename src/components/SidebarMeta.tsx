/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Database, Cpu, HardDrive, ShieldAlert, CpuIcon, Sparkles } from 'lucide-react';
import { SystemConfig, SystemMetrics } from '../types';

interface SidebarMetaProps {
  config: SystemConfig;
  metrics: SystemMetrics;
}

export default function SidebarMeta({ config, metrics }: SidebarMetaProps) {
  const getDeployBadgeColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-emerald-500';
      case 'Deploying':
      case 'Compiling':
        return 'bg-blue-500 animate-pulse';
      case 'Failed':
        return 'bg-rose-500';
      default:
        return 'bg-slate-300';
    }
  };

  return (
    <aside className="w-72 border-r border-slate-200 p-6 flex flex-col gap-8 bg-slate-50 overflow-y-auto select-none shrink-0" id="sidebar-meta">
      {/* System Status Section */}
      <section className="flex flex-col">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>System Topology Status</span>
          <span className="text-[9px] font-mono lowercase text-slate-400">active verification</span>
        </h3>
        
        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-2 bg-white border border-slate-150 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Authentication</span>
                <span className="text-[9px] font-mono text-slate-400">{config.authProvider}</span>
              </div>
            </div>
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-2 bg-white border border-slate-150 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Database</span>
                <span className="text-[9px] font-mono text-slate-400">{config.dbProvider.split(' ')[0]}</span>
              </div>
            </div>
            <Database className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-2 bg-white border border-slate-150 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Cognitive Pipeline</span>
                <span className="text-[9px] font-mono text-slate-400">{config.aiModel}</span>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-2 bg-white border border-slate-150 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${getDeployBadgeColor(metrics.dbStatus || 'Pending')}`} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Cloud Deployment</span>
                <span className="text-[9px] font-mono text-slate-400">{config.deployTarget.split(' ')[0]}: {metrics.dbStatus || 'Pending'}</span>
              </div>
            </div>
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="flex flex-col">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-200 pb-1">
          Project Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-slate-250 p-3 bg-white flex flex-col justify-between">
            <div className="text-2xl font-light leading-none mb-1 text-slate-800 font-sans">
              {metrics.endpointsCount}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              API Endpoints
            </div>
          </div>

          <div className="border border-slate-250 p-3 bg-white flex flex-col justify-between">
            <div className="text-2xl font-light leading-none mb-1 text-slate-800 font-sans">
              {metrics.modulesCount}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              Core Modules
            </div>
          </div>

          <div className="border border-slate-250 p-3 bg-white flex flex-col justify-between">
            <div className="text-2xl font-light leading-none mb-1 text-slate-850 font-sans">
              {metrics.activeBookings}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              Active Bookings
            </div>
          </div>

          <div className="border border-slate-250 p-3 bg-white flex flex-col justify-between">
            <div className="text-2xl font-light leading-none mb-1 text-slate-850 font-sans">
              {metrics.avgLatencyMs}<span className="text-xs font-normal">ms</span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              Avg Latency
            </div>
          </div>
        </div>
      </section>

      {/* Team Details Section */}
      <section className="mt-auto border-t border-slate-200 pt-5">
        <div className="bg-slate-900 p-5 text-white flex flex-col gap-3 shadow-md relative overflow-hidden">
          {/* Subtle geometric lines */}
          <div className="absolute -right-6 -bottom-6 w-16 h-16 border border-white/10 rotate-45 pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-24 h-24 border border-white/5 rounded-full pointer-events-none" />

          <div>
            <p className="text-[8px] opacity-45 uppercase tracking-widest font-mono">Assigned Architect</p>
            <p className="font-medium text-sm text-slate-100">Sarah Jenkins</p>
            <p className="text-[10px] text-slate-400 font-mono">Lead Systems Architect</p>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center text-[10px]">
            <span className="opacity-50 font-mono">WORKSPACE</span>
            <span className="font-mono text-emerald-400 font-semibold uppercase">0448581D-ACTIVE</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
