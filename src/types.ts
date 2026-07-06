/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Booking {
  id: string;
  guestName: string;
  email: string;
  suiteName: string;
  checkIn: string;
  checkOut: string;
  status: 'Pending' | 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
  totalPrice: number;
  guestsCount: number;
}

export interface SystemConfig {
  dbProvider: 'PostgreSQL (Cloud SQL)' | 'Spanner (Relational)' | 'MySQL (Cloud SQL)';
  authProvider: 'Firebase Auth' | 'Auth0 Integration' | 'Custom JWT Gateway';
  aiModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  deployTarget: 'Google Cloud Run' | 'Google Kubernetes Engine (GKE)' | 'App Engine';
  environment: 'Production' | 'Staging' | 'Development';
  encryptionLevel: 'AES-256' | 'AES-GCM (Chacha20)';
  backupFrequency: 'Daily Automatic' | 'Hourly Snapshot' | 'Real-time Replica';
  complianceGdpr: boolean;
  complianceSoc2: boolean;
}

export interface SystemMetrics {
  endpointsCount: number;
  modulesCount: number;
  dbConnections: number;
  apiRequests: number;
  avgLatencyMs: number;
  activeBookings: number;
  occupancyRate: number;
  dbStatus: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'command' | 'success' | 'error';
}
