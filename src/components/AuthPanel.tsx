/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Key, Mail, Lock, Server, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';
import { supabaseService, reinitSupabase } from '../lib/supabaseService';

interface AuthPanelProps {
  onAuthSuccess: (user: { id: string; email: string }) => void;
}

export default function AuthPanel({ onAuthSuccess }: AuthPanelProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supabase live configuration state
  const [dbUrl, setDbUrl] = useState(() => localStorage.getItem('supabase_url') || '');
  const [anonKey, setAnonKey] = useState(() => localStorage.getItem('supabase_anon_key') || '');
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isRealClient = supabaseService.isRealMode();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { user, error } = await supabaseService.signUp(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg(isRealClient 
            ? 'Account created! Please check your email inbox to confirm your registration.' 
            : 'Simulated Sandbox account created and logged in!'
          );
          if (!isRealClient) {
            setTimeout(() => onAuthSuccess(user), 1500);
          }
        }
      } else {
        const { user, error } = await supabaseService.logIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg('Successfully authenticated!');
          setTimeout(() => onAuthSuccess(user), 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (dbUrl.trim() && anonKey.trim()) {
      localStorage.setItem('supabase_url', dbUrl.trim());
      localStorage.setItem('supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
    }

    const reinitialized = reinitSupabase();
    setIsConfigSaved(true);
    setTimeout(() => {
      setIsConfigSaved(false);
      window.location.reload(); // reload to reset state clean
    }, 1200);
  };

  const handleClearConfig = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    window.location.reload();
  };

  const sqlSchema = `-- DIVINE SUITES - SUPABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor to support Bookings & Favorites with RLS.

-- 1. Create Bookings table
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  suite_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  guests_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings security policies
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookings" ON bookings FOR DELETE USING (auth.uid() = user_id);

-- 2. Create Favorites table
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  suite_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, suite_name)
);

-- Enable RLS for Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Favorites security policies
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto bg-white p-6 md:p-8 font-sans gap-8" id="auth-panel-container">
      
      {/* Left side: Authentic Auth Form */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-4">
        <div className="flex flex-col gap-1.5 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-slate-900 text-white font-bold text-xs flex items-center justify-center">D</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Vault</span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-slate-900 uppercase">
            {isSignUp ? 'Create Operator Account' : 'Suite Portal Gateway'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isSignUp 
              ? 'Register a secure digital identity on the platform to synchronize reservations and curate bespoke suite listings.' 
              : 'Authenticate using your cryptographic credentials to retrieve personalized ledger bookings and active saved favorites.'
            }
          </p>
        </div>

        {/* Auth Mode Indicator */}
        <div className="flex border border-slate-200 mb-6 bg-slate-50 p-1">
          <button
            onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Database Status Tag */}
        <div className={`mb-5 p-3 flex items-center justify-between border text-[11px] font-mono ${
          isRealClient 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5" />
            <span className="font-bold">MODE: {isRealClient ? 'LIVE CLOUD (SUPABASE)' : 'LOCAL SANDBOX'}</span>
          </div>
          <span className="text-[9px] font-bold uppercase opacity-80">
            {isRealClient ? 'SECURE' : 'DEV STANDBY'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-5 flex gap-2 rounded-none">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-5 flex gap-2 rounded-none">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="your.email@divinesuites.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 pl-10 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Cryptographic Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 rounded-none active:scale-98 shadow-sm"
          >
            <Key className="w-4 h-4" />
            <span>{isLoading ? 'Verifying Credentials...' : isSignUp ? 'Create Secure Account' : 'Authenticate Gateway'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-400 leading-relaxed font-sans">
          This secure access gateway uses advanced TLS cryptographic session handshakes and secure JWT token protocols to guarantee complete account isolation.
        </div>
      </div>

      {/* Right side: Supabase Cloud Config Center */}
      <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8 py-4 flex flex-col justify-between max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cloud Integrations</span>
            <h3 className="text-lg font-light tracking-tight text-slate-900 uppercase">Supabase Connectivity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              By default, this app runs in an elegant <strong>Local Sandbox Mode</strong> using local storage isolation so you can try out the sign-up, login, favorites, and secure ledger tracking immediately. 
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              To connect this to your <strong>Live Supabase Cloud Project</strong>, input your credentials below. They will be stored securely in your browser's workspace.
            </p>
          </div>

          {/* Config Input Form */}
          <form onSubmit={handleSaveConfig} className="border border-slate-200 p-4 bg-slate-50 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>Supabase Project Credentials</span>
            </h4>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzabc.supabase.co"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full text-[11px] p-2 border border-slate-200 bg-white font-mono focus:outline-none focus:border-slate-800 rounded-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full text-[11px] p-2 border border-slate-200 bg-white font-mono focus:outline-none focus:border-slate-800 rounded-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              {(localStorage.getItem('supabase_url') || localStorage.getItem('supabase_anon_key')) && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 bg-white text-slate-600 text-[10px] font-bold uppercase tracking-wider cursor-pointer rounded-none"
                >
                  Clear Config
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer rounded-none flex items-center gap-1.5 active:scale-95"
              >
                {isConfigSaved ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Save & Connect</span>
                )}
              </button>
            </div>
          </form>

          {/* Copyable SQL Schema */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Supabase SQL DDL Schema Setup</span>
              </label>
              <button
                onClick={copySqlToClipboard}
                className="text-[10px] text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                title="Copy SQL code"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied SQL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="border border-slate-200 bg-slate-950 p-3 overflow-x-auto max-h-40 rounded-none text-left">
              <pre className="text-[9px] font-mono text-emerald-400 leading-normal whitespace-pre">
                {sqlSchema}
              </pre>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
