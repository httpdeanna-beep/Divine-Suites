/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { SystemConfig } from '../types';

interface RightPanelGraphicsProps {
  config: SystemConfig;
}

export default function RightPanelGraphics({ config }: RightPanelGraphicsProps) {
  const [cpuUsage, setCpuUsage] = useState(58);
  const [memoryUsage, setMemoryUsage] = useState(42);
  const [socketsUsage, setSocketsUsage] = useState(74);

  // Simulate minor fluctuations in resource consumption
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return Math.max(30, Math.min(90, next));
      });
      setMemoryUsage((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const next = prev + delta;
        return Math.max(25, Math.min(85, next));
      });
      setSocketsUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return Math.max(40, Math.min(100, next));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 border-l border-slate-200 bg-slate-50 flex flex-col justify-between shrink-0 overflow-y-auto select-none" id="right-panel-graphics">
      {/* Topology Visualization */}
      <div className="border-b border-slate-200 p-5 flex flex-col">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
          Network Topology
        </h4>
        <div className="relative h-32 flex items-center justify-center bg-white border border-slate-200 shadow-xs overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 200 120">
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(226,232,240,0.4)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Central Circle */}
            <circle cx="100" cy="60" r="42" fill="none" stroke="rgba(15,23,42,0.04)" strokeWidth="8" />
            <circle cx="100" cy="60" r="32" fill="none" stroke="rgba(15,23,42,0.1)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Rotating Outer Square */}
            <g transform="translate(100,60)">
              <rect x="-24" y="-24" width="48" height="48" fill="none" stroke="rgba(15,23,42,0.85)" strokeWidth="1.5" className="animate-[spin_20s_linear_infinite]" />
              <rect x="-18" y="-18" width="36" height="36" fill="none" stroke="rgba(15,23,42,0.3)" strokeWidth="1" className="animate-[spin_12s_linear_infinite_reverse]" />
            </g>

            {/* Internal Core Node */}
            <circle cx="100" cy="60" r="8" fill="rgba(15,23,42,1)" />
            <circle cx="100" cy="60" r="4" fill="#10b981" />

            {/* Connection Terminals */}
            <line x1="100" y1="18" x2="100" y2="4" stroke="rgba(15,23,42,0.15)" strokeWidth="1" />
            <circle cx="100" cy="4" r="2.5" fill="rgba(15,23,42,0.5)" />

            <line x1="42" y1="60" x2="15" y2="60" stroke="rgba(15,23,42,0.15)" strokeWidth="1" />
            <circle cx="15" cy="60" r="2.5" fill="rgba(15,23,42,0.5)" />

            <line x1="158" y1="60" x2="185" y2="60" stroke="rgba(15,23,42,0.15)" strokeWidth="1" />
            <circle cx="185" cy="60" r="2.5" fill="rgba(15,23,42,0.5)" />
          </svg>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400">
            SECURE-MESH
          </div>
        </div>
      </div>

      {/* Resource Allocations */}
      <div className="border-b border-slate-200 p-5 flex flex-col flex-1 justify-center gap-5">
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              CPU Container Utilization
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-600">{cpuUsage}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 w-full rounded-none overflow-hidden">
            <div 
              className="h-1.5 bg-slate-900 transition-all duration-1000" 
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Allocated RAM (Cache)
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-600">{memoryUsage}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 w-full rounded-none overflow-hidden">
            <div 
              className="h-1.5 bg-slate-900 transition-all duration-1000" 
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Socket Mesh Throughput
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-600">{socketsUsage}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 w-full rounded-none overflow-hidden">
            <div 
              className="h-1.5 bg-slate-900 transition-all duration-1000" 
              style={{ width: `${socketsUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Regulatory Compliance / Note Card */}
      <div className="p-5">
        <div className="p-4 border border-dashed border-slate-300 bg-white text-[10px] text-slate-500 leading-normal uppercase font-semibold flex flex-col gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>COMPLIANCE POLICY</span>
          </div>
          
          <p className="font-medium text-slate-500">
            Strict regulatory guidelines mandate full {config.complianceGdpr ? 'GDPR-compliant user deletion' : 'local database constraints'} and {config.complianceSoc2 ? 'SOC2 Security Trust principles' : 'organizational access safety'} protocols for all active guest transactions in {config.deployTarget}.
          </p>

          <div className="flex items-center gap-1 font-mono text-[8px] text-slate-400">
            <Info className="w-3 h-3" />
            <span>ID: SEC-REG-SOC2</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
