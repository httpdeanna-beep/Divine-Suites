/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Shield, Database, Sparkles, HardDrive, Info, CheckCircle } from 'lucide-react';
import { SystemConfig } from '../types';

interface ConfigTabProps {
  config: SystemConfig;
  onChangeConfig: (newConfig: Partial<SystemConfig>) => void;
}

export default function ConfigTab({ config, onChangeConfig }: ConfigTabProps) {
  const handleSelectChange = (key: keyof SystemConfig, value: string) => {
    onChangeConfig({ [key]: value });
  };

  const handleCheckboxChange = (key: keyof SystemConfig, checked: boolean) => {
    onChangeConfig({ [key]: checked });
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-white flex flex-col overflow-y-auto" id="config-tab-container">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between">
        
        {/* Header Title */}
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Control Center
          </span>
          <h2 className="text-2xl font-light tracking-tight text-slate-900 uppercase">
            Technical Stack Configurator
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Alter technical drivers and regulatory boundaries below. Tweaking these controls automatically updates the structural specification paragraphs, interactive visual drawings, API contracts, and CI/CD pipelines.
          </p>
        </div>

        {/* Configuration Matrix Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-sans">
          
          {/* Database Selector */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-3">
              <Database className="w-4 h-4 text-slate-700" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Persistence Database
              </label>
            </div>
            <select
              value={config.dbProvider}
              onChange={(e) => handleSelectChange('dbProvider', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-250 bg-white focus:outline-none focus:border-slate-900 rounded-none cursor-pointer"
            >
              <option value="PostgreSQL (Cloud SQL)">PostgreSQL (Google Cloud SQL)</option>
              <option value="Spanner (Relational)">Spanner (Relational / Distributed)</option>
              <option value="MySQL (Cloud SQL)">MySQL (Google Cloud SQL)</option>
            </select>
            <span className="text-[9px] text-slate-400 mt-2 block">
              Adjusts core SQL connection pool syntax and Drizzle compilation targets.
            </span>
          </div>

          {/* Identity Provider Selector */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-3">
              <Shield className="w-4 h-4 text-slate-700" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Identity and Authentication
              </label>
            </div>
            <select
              value={config.authProvider}
              onChange={(e) => handleSelectChange('authProvider', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-250 bg-white focus:outline-none focus:border-slate-900 rounded-none cursor-pointer"
            >
              <option value="Firebase Auth">Firebase Auth (OAuth OIDC Server)</option>
              <option value="Auth0 Integration">Auth0 (Multi-Tenant Gateway)</option>
              <option value="Custom JWT Gateway">Custom Token Gateway (RSA Signature)</option>
            </select>
            <span className="text-[9px] text-slate-400 mt-2 block">
              Determines token signature validation headers and security middlewares.
            </span>
          </div>

          {/* Cognitive Model Selector */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Cognitive LLM Analytics Engine
              </label>
            </div>
            <select
              value={config.aiModel}
              onChange={(e) => handleSelectChange('aiModel', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-250 bg-white focus:outline-none focus:border-slate-900 rounded-none cursor-pointer"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Low-latency Yields)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced Forecasting)</option>
            </select>
            <span className="text-[9px] text-slate-400 mt-2 block">
              Adjusts models sourced via @google/genai SDK in server routes.
            </span>
          </div>

          {/* Deployment Host Selector */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-3">
              <HardDrive className="w-4 h-4 text-slate-700" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Cloud Container Infrastructure
              </label>
            </div>
            <select
              value={config.deployTarget}
              onChange={(e) => handleSelectChange('deployTarget', e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-250 bg-white focus:outline-none focus:border-slate-900 rounded-none cursor-pointer"
            >
              <option value="Google Cloud Run">Google Cloud Run (Serverless Microservices)</option>
              <option value="Google Kubernetes Engine (GKE)">Google Kubernetes Engine (GKE Pods)</option>
              <option value="App Engine">Google App Engine (Standard Runtime)</option>
            </select>
            <span className="text-[9px] text-slate-400 mt-2 block">
              Modifies target Docker container registries and gcloud CLI commands.
            </span>
          </div>

          {/* Secondary Options */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Settings className="w-4 h-4 text-slate-700" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Persistence Subsystems
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">
                  Volume Encryption
                </label>
                <select
                  value={config.encryptionLevel}
                  onChange={(e) => handleSelectChange('encryptionLevel', e.target.value)}
                  className="w-full text-[10px] p-2 border border-slate-250 bg-white font-mono focus:outline-none focus:border-slate-900 rounded-none"
                >
                  <option value="AES-256">AES-256 (XTS)</option>
                  <option value="AES-GCM (Chacha20)">Chacha20-Poly1305</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">
                  Backup Intervals
                </label>
                <select
                  value={config.backupFrequency}
                  onChange={(e) => handleSelectChange('backupFrequency', e.target.value)}
                  className="w-full text-[10px] p-2 border border-slate-250 bg-white font-mono focus:outline-none focus:border-slate-900 rounded-none"
                >
                  <option value="Daily Automatic">Daily Snap</option>
                  <option value="Hourly Snapshot">Hourly Snap</option>
                  <option value="Real-time Replica">Live Replica</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compliance Checkboxes */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-3">
              <Shield className="w-4 h-4 text-slate-700" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Compliance & Trust Auditing
              </label>
            </div>

            <div className="space-y-3.5 pt-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.complianceGdpr}
                  onChange={(e) => handleCheckboxChange('complianceGdpr', e.target.checked)}
                  className="w-4 h-4 accent-slate-900 rounded-none cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">GDPR Privacy Safeguards</span>
                  <span className="text-[9px] text-slate-400">Restricts user audit storage and guarantees dynamic account wipes.</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.complianceSoc2}
                  onChange={(e) => handleCheckboxChange('complianceSoc2', e.target.checked)}
                  className="w-4 h-4 accent-slate-900 rounded-none cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">SOC2 Security Trust Framework</span>
                  <span className="text-[9px] text-slate-400">Strictly enforces encrypted TLS handshakes and RBAC access auditing.</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Informative Help Alert */}
        <div className="p-4 border border-slate-200 bg-white flex gap-3 text-xs leading-normal text-slate-600 font-sans shadow-xs mb-4">
          <Info className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">Dynamic Stack Mapping</p>
            <p className="mt-0.5 text-slate-400 leading-relaxed">
              When values are toggled, the systems compiler matches references to construct customized schema migration tasks, dynamic environment configurations (<code className="font-mono bg-slate-50 border border-slate-200 px-1 text-[11px]">.env</code> files), and modular middleware imports. This guarantees complete cohesion across the entire blueprint infrastructure.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
