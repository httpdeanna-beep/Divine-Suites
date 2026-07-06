/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Retrieve keys from Vite environment variables or browser localStorage
export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';
  return { url: url.trim(), anonKey: anonKey.trim() };
};

export const initSupabaseClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    try {
      return createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

// Hot reference
export const supabase = initSupabaseClient();
