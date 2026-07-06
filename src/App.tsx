/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SidebarMeta from './components/SidebarMeta';
import RightPanelGraphics from './components/RightPanelGraphics';
import SpecTab from './components/SpecTab';
import ArchitectureTab from './components/ArchitectureTab';
import BookingSimulatorTab from './components/BookingSimulatorTab';
import DeploymentTab from './components/DeploymentTab';
import ConfigTab from './components/ConfigTab';
import { Booking, SystemConfig, SystemMetrics } from './types';
import { INITIAL_CONFIG, DEFAULT_BOOKINGS, generateSpecText } from './data/defaultSpec';
import { supabaseService, UserSession } from './lib/supabaseService';
import { trackBookingCreated } from './lib/posthog';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'spec' | 'arch' | 'simulator' | 'deploy' | 'config'>('spec');

  // Secure User state
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load and persist config state
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('divine_suites_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  // Load bookings list (synchronized based on user.id)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load and persist inline specification text custom overrides
  const [customOverrides, setCustomOverrides] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('divine_suites_overrides');
    return saved ? JSON.parse(saved) : {};
  });

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('Pending');

  // Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await supabaseService.getSession();
        setUser(session);
      } catch (e) {
        console.error('Session restoration failed:', e);
      } finally {
        setIsLoadingSession(false);
      }
    };
    loadSession();
  }, []);

  // Sync bookings & favorites when user session changes
  useEffect(() => {
    const syncUserData = async () => {
      if (user) {
        try {
          const userBookings = await supabaseService.getBookings(user.id);
          // If a new user signs up and has no bookings, let's pre-seed their account with
          // standard sample bookings so they see beautiful demo analytics right away!
          if (userBookings.length === 0) {
            const seeded: Booking[] = [];
            for (const b of DEFAULT_BOOKINGS) {
              const bCopy = { ...b };
              const created = await supabaseService.createBooking(user.id, {
                guestName: bCopy.guestName,
                email: bCopy.email,
                suiteName: bCopy.suiteName,
                checkIn: bCopy.checkIn,
                checkOut: bCopy.checkOut,
                status: bCopy.status,
                totalPrice: bCopy.totalPrice,
                guestsCount: bCopy.guestsCount,
              });
              seeded.push(created);
            }
            setBookings(seeded);
          } else {
            setBookings(userBookings);
          }

          const userFavs = await supabaseService.getFavorites(user.id);
          setFavorites(userFavs);
        } catch (e) {
          console.error('Failed to sync user data:', e);
        }
      } else {
        setBookings([]);
        setFavorites([]);
      }
    };
    syncUserData();
  }, [user]);

  // Write changes back to localStorage for configurations and overrides
  useEffect(() => {
    localStorage.setItem('divine_suites_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('divine_suites_overrides', JSON.stringify(customOverrides));
  }, [customOverrides]);

  // Handle configuration edits
  const handleUpdateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Generate dynamic spec text sections based on config, merged with user-defined overrides
  const specSections = useMemo(() => {
    const defaultSections = generateSpecText(config);
    return defaultSections.map((section, sectionIdx) => {
      return {
        ...section,
        paragraphs: section.paragraphs.map((p, pIdx) => {
          const key = `${sectionIdx}_${pIdx}`;
          return customOverrides[key] !== undefined ? customOverrides[key] : p;
        })
      };
    });
  }, [config, customOverrides]);

  // Inline Spec text editor commits
  const handleUpdateSpecParagraph = (sectionIdx: number, paragraphIdx: number, newValue: string) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [`${sectionIdx}_${paragraphIdx}`]: newValue
    }));
  };

  const handleResetSpecToDefault = () => {
    if (window.confirm('Reset all specification paragraphs back to the default values matching the current configurations?')) {
      setCustomOverrides({});
    }
  };

  // User secure log out
  const handleLogout = async () => {
    await supabaseService.logOut();
    setUser(null);
    setBookings([]);
    setFavorites([]);
  };

  const handleAuthSuccess = (sessionUser: UserSession) => {
    setUser(sessionUser);
  };

  // Booking action simulation (all isolated on user account)
  const handleCreateBooking = async (newBooking: Omit<Booking, 'id'>) => {
    if (!user) return;
    try {
      const created = await supabaseService.createBooking(user.id, newBooking);
      setBookings((prev) => [created, ...prev]);
      trackBookingCreated(created, user.id);
    } catch (e) {
      console.error('Failed to create booking in DB:', e);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    if (!user) return;
    try {
      const success = await supabaseService.updateBookingStatus(user.id, id, status);
      if (success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      }
    } catch (e) {
      console.error('Failed to update booking status in DB:', e);
    }
  };

  const handleUpdateBooking = async (id: string, updatedBooking: Omit<Booking, 'id'>) => {
    if (!user) return;
    try {
      const success = await supabaseService.updateBooking(user.id, id, updatedBooking);
      if (success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { id, ...updatedBooking } : b))
        );
      }
    } catch (e) {
      console.error('Failed to update booking in DB:', e);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!user) return;
    try {
      const success = await supabaseService.deleteBooking(user.id, id);
      if (success) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete booking in DB:', e);
    }
  };

  // Favorites toggling action (isolated on user account)
  const handleToggleFavorite = async (suiteName: string) => {
    if (!user) return;
    const isFav = favorites.includes(suiteName);
    try {
      if (isFav) {
        const success = await supabaseService.removeFavorite(user.id, suiteName);
        if (success) {
          setFavorites((prev) => prev.filter((s) => s !== suiteName));
        }
      } else {
        const success = await supabaseService.addFavorite(user.id, suiteName);
        if (success) {
          setFavorites((prev) => [...prev, suiteName]);
        }
      }
    } catch (e) {
      console.error('Failed to toggle favorite in DB:', e);
    }
  };

  // Compute live system telemetry and metrics
  const systemMetrics = useMemo<SystemMetrics>(() => {
    const activeCount = bookings.filter((b) => b.status === 'Checked-In' || b.status === 'Confirmed').length;
    const occupancy = Math.min(100, Math.round((activeCount / 12) * 100)) || 15;

    let avgLatency = 34;
    if (config.dbProvider.includes('Spanner')) {
      avgLatency = 48; // Relational spanner with globally aligned synchronization overhead
    } else if (config.dbProvider.includes('MySQL')) {
      avgLatency = 39;
    }

    const apiRequests = 1240 + bookings.length * 32;

    return {
      endpointsCount: 14,
      modulesCount: 6,
      dbConnections: 8 + bookings.length,
      apiRequests,
      avgLatencyMs: avgLatency,
      activeBookings: bookings.length,
      occupancyRate: occupancy,
      dbStatus: deploymentStatus
    };
  }, [bookings, config, deploymentStatus]);

  // Master Export Action
  const handleExportSystemBlueprint = () => {
    const bundle = {
      title: 'DIVINE SUITES PLATFORM BLUEPRINT',
      timestamp: new Date().toISOString(),
      architecture_config: config,
      telemetry: systemMetrics,
      compiled_spec: specSections,
      active_ledger_bookings: bookings
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `divine-suites-blueprint-config.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingSession) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Divine Suites Secure Vault</span>
            <span className="text-[10px] text-slate-500 mt-1">Establishing secure SSL gateway handshakes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-0 md:p-4 overflow-hidden" id="app-viewport">
      <div className="h-full w-full max-w-[1400px] bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900 border border-slate-200 shadow-2xl relative">
        
        {/* Header Bar */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onExport={handleExportSystemBlueprint} 
          user={user}
          onLogout={handleLogout}
        />

        {/* Central Core Workspaces */}
        <main className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
          
          {/* Sidebar Status Monitor */}
          <SidebarMeta 
            config={config} 
            metrics={systemMetrics} 
          />

          {/* Dynamic Tab Panes */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'spec' && (
              <SpecTab 
                specSections={specSections} 
                onUpdateSection={handleUpdateSpecParagraph}
                onResetToDefault={handleResetSpecToDefault}
              />
            )}

            {activeTab === 'arch' && (
              <ArchitectureTab 
                config={config} 
              />
            )}

            {activeTab === 'simulator' && (
              <BookingSimulatorTab 
                bookings={bookings}
                onCreateBooking={handleCreateBooking}
                onUpdateBooking={handleUpdateBooking}
                onUpdateStatus={handleUpdateBookingStatus}
                onDeleteBooking={handleDeleteBooking}
                config={config}
                user={user}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAuthSuccess={handleAuthSuccess}
              />
            )}

            {activeTab === 'deploy' && (
              <DeploymentTab 
                config={config}
                deploymentStatus={deploymentStatus}
                setDeploymentStatus={setDeploymentStatus}
              />
            )}

            {activeTab === 'config' && (
              <ConfigTab 
                config={config}
                onChangeConfig={handleUpdateConfig}
              />
            )}
          </div>

          {/* Right Panel Dynamic Vector Charts */}
          <RightPanelGraphics 
            config={config} 
          />

        </main>
      </div>
    </div>
  );
}
