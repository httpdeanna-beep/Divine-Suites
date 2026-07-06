/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Users, ChevronRight, Activity, TrendingUp, Sparkles, RefreshCw, Heart, Building, ListFilter, Check, Info, Pencil, XCircle, LayoutDashboard, Briefcase, Clock, ArrowUpRight, Star, ClipboardList } from 'lucide-react';
import { Booking, SystemConfig } from '../types';
import { LUXURY_SUITES } from '../data/defaultSpec';
import { UserSession } from '../lib/supabaseService';
import AuthPanel from './AuthPanel';

interface BookingSimulatorTabProps {
  bookings: Booking[];
  onCreateBooking: (booking: Omit<Booking, 'id'>) => void;
  onUpdateBooking: (id: string, booking: Omit<Booking, 'id'>) => void;
  onUpdateStatus: (id: string, status: Booking['status']) => void;
  onDeleteBooking: (id: string) => void;
  config: SystemConfig;
  user: UserSession | null;
  favorites: string[];
  onToggleFavorite: (suiteName: string) => void;
  onAuthSuccess: (user: UserSession) => void;
}

export default function BookingSimulatorTab({
  bookings,
  onCreateBooking,
  onUpdateBooking,
  onUpdateStatus,
  onDeleteBooking,
  config,
  user,
  favorites,
  onToggleFavorite,
  onAuthSuccess
}: BookingSimulatorTabProps) {
  // Sub-tab navigation
  const [subTab, setSubTab] = useState<'dashboard' | 'catalog' | 'ledger' | 'form'>('dashboard');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Editing state
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<Booking['status']>('Pending');

  // Local form state
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [suiteName, setSuiteName] = useState(LUXURY_SUITES[0].name);
  const [checkIn, setCheckIn] = useState('2026-07-10');
  const [checkOut, setCheckOut] = useState('2026-07-14');
  const [guestsCount, setGuestsCount] = useState(2);

  // Dynamic pricing multiplier simulator state
  const [demandFactor, setDemandFactor] = useState<'Standard' | 'Elevated' | 'Surging'>('Elevated');
  const [aiOptimizationRunning, setAiOptimizationRunning] = useState(false);

  // Calculate price dynamically for the booking form
  const selectedSuiteInfo = useMemo(() => {
    return LUXURY_SUITES.find((s) => s.name === suiteName) || LUXURY_SUITES[0];
  }, [suiteName]);

  const computedPrice = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const basePrice = selectedSuiteInfo.pricePerNight * diffDays;
    
    // Apply simulated pricing multiplier
    const multiplier = demandFactor === 'Surging' ? 1.4 : demandFactor === 'Elevated' ? 1.15 : 1.0;
    return Math.round(basePrice * multiplier);
  }, [checkIn, checkOut, selectedSuiteInfo, demandFactor]);

  // Aggregate Booking Analytics
  const analyticsData = useMemo(() => {
    const revenueBySuite: Record<string, number> = {
      'The Royal Penthouse': 0,
      'The Sapphire Suite': 0,
      'The Emerald Villa': 0,
      'The Obsidian Loft': 0,
    };

    let totalRevenue = 0;
    let completedReservations = 0;

    bookings.forEach((b) => {
      if (b.status !== 'Pending') {
        revenueBySuite[b.suiteName] = (revenueBySuite[b.suiteName] || 0) + b.totalPrice;
        totalRevenue += b.totalPrice;
      }
      if (b.status === 'Completed' || b.status === 'Checked-In') {
        completedReservations += 1;
      }
    });

    // Simulate occupancy rate based on currently active reservation ratios
    const activeBookingCount = bookings.filter((b) => b.status === 'Checked-In' || b.status === 'Confirmed').length;
    const simulatedOccupancyRate = Math.min(100, Math.round((activeBookingCount / 12) * 100)) || 25;

    return {
      revenueBySuite,
      totalRevenue,
      simulatedOccupancyRate,
      activeBookingCount
    };
  }, [bookings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !email) return;

    if (editingBookingId) {
      onUpdateBooking(editingBookingId, {
        guestName,
        email,
        suiteName,
        checkIn,
        checkOut,
        guestsCount,
        totalPrice: computedPrice,
        status: editingStatus
      });
    } else {
      onCreateBooking({
        guestName,
        email,
        suiteName,
        checkIn,
        checkOut,
        guestsCount,
        totalPrice: computedPrice,
        status: 'Confirmed'
      });
    }

    // Reset Form
    setGuestName('');
    setEmail('');
    setEditingBookingId(null);
    setSubTab('ledger');
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setGuestName(booking.guestName);
    setEmail(booking.email);
    setSuiteName(booking.suiteName);
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setGuestsCount(booking.guestsCount);
    setEditingStatus(booking.status);
    setSubTab('form');
  };

  const handleQuickBook = (selectedSuite: string) => {
    setEditingBookingId(null);
    setSuiteName(selectedSuite);
    if (user) {
      setEmail(user.email);
    }
    setSubTab('form');
  };

  const handleRunAiOptimization = () => {
    setAiOptimizationRunning(true);
    setTimeout(() => {
      setAiOptimizationRunning(false);
      // Alter demand based on volume of active reservations
      if (bookings.length >= 6) {
        setDemandFactor('Surging');
      } else if (bookings.length >= 4) {
        setDemandFactor('Elevated');
      } else {
        setDemandFactor('Standard');
      }
    }, 1500);
  };

  // If user is not authenticated, render the Secure Auth portal directly in the tab
  if (!user) {
    return <AuthPanel onAuthSuccess={onAuthSuccess} />;
  }

  // Filter suites for the catalog tab
  const filteredSuites = LUXURY_SUITES.filter(s => !favoritesOnly || favorites.includes(s.name));

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white" id="simulator-tab-container">
      
      {/* Booking List, Suite Catalog, and Creation form (Left Side) */}
      <div className="flex-1 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto flex flex-col">
        
        {/* Dynamic Multi-Subtab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Operations Engine
            </span>
            <h2 className="text-2xl font-light tracking-tight text-slate-900 uppercase">
              Secure Suite Portal
            </h2>
          </div>

          {/* Subtab Segmented Switch */}
          <div className="flex border border-slate-200 bg-slate-50 p-1 font-sans text-xs gap-1">
            <button
              onClick={() => {
                setEditingBookingId(null);
                setSubTab('dashboard');
              }}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 rounded-none ${
                subTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="subtab-dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setEditingBookingId(null);
                setGuestName('');
                setEmail('');
                setSubTab('catalog');
              }}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none ${
                subTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="subtab-catalog"
            >
              Suites
            </button>
            <button
              onClick={() => {
                setEditingBookingId(null);
                setSubTab('ledger');
              }}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none ${
                subTab === 'ledger'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="subtab-ledger"
            >
              Ledger ({bookings.length})
            </button>
            <button
              onClick={() => setSubTab('form')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 rounded-none ${
                subTab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              id="subtab-book"
            >
              {editingBookingId ? (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- 0. DASHBOARD VIEW --- */}
        {subTab === 'dashboard' && (
          <div className="space-y-6 flex-1 flex flex-col overflow-y-auto pr-1">
            
            {/* Header Greeting Card */}
            <div className="bg-slate-900 text-white p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6">
                <LayoutDashboard className="w-48 h-48" />
              </div>
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Secure Session
                </span>
                <h3 className="text-xl font-light tracking-tight">
                  Welcome to your Executive Ledger Dashboard
                </h3>
                <p className="text-xs text-slate-400">
                  Manage your verified physical suite bookings and tracked portfolio items below.
                </p>
              </div>
              {user && (
                <div className="relative z-10 bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2 font-mono text-xs">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Account ID</span>
                  <span className="font-bold text-white text-[11px] truncate max-w-[150px] block">{user.email}</span>
                </div>
              )}
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700 shrink-0">
                  <Briefcase className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Bookings</span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">{bookings.length}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700 shrink-0">
                  <Calendar className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Upcoming</span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
                    {bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed').length}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700 shrink-0">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Saved Suites</span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">{favorites.length}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700 shrink-0">
                  <DollarSign className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ledger Value</span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
                    ${bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Split layout: 1. Upcoming Reservations  2. Booking Status Distribution */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Upcoming Reservations List */}
              <div className="xl:col-span-2 bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-900" />
                    <span>Upcoming Bookings Portfolio</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">CHRONOLOGICAL ORDER</span>
                </div>

                <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                  {bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed').length === 0 ? (
                    <div className="border border-dashed border-slate-200 p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                      <ClipboardList className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">No active upcoming reservations</p>
                      <p className="text-[11px]">Ready to experience pristine high-end luxury?</p>
                      <button
                        onClick={() => setSubTab('catalog')}
                        className="mt-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest px-4 py-1.5 cursor-pointer rounded-none active:scale-95 transition-all"
                      >
                        Browse Suites
                      </button>
                    </div>
                  ) : (
                    bookings
                      .filter(b => b.status !== 'Cancelled' && b.status !== 'Completed')
                      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                      .map((booking) => (
                        <div key={booking.id} className="border border-slate-150 p-3 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1 py-0.5 font-bold">
                                {booking.id}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{booking.guestName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4">
                              <span>Suite: <strong className="text-slate-700">{booking.suiteName}</strong></span>
                              <span>Dates: <strong className="text-slate-700">{booking.checkIn} to {booking.checkOut}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-400 uppercase block leading-none mb-1">SECURED VALUE</span>
                              <span className="text-sm font-bold text-slate-900 font-sans leading-none">${booking.totalPrice}</span>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                              booking.status === 'Confirmed' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : booking.status === 'Checked-In'
                                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                                  : 'bg-amber-50 border-amber-200 text-amber-600'
                            }`}>
                              {booking.status}
                            </span>

                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditClick(booking)}
                                className="p-1 bg-white border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 cursor-pointer"
                                title="Edit Booking Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onUpdateStatus(booking.id, 'Cancelled')}
                                className="p-1 bg-white border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 cursor-pointer"
                                title="Cancel Reservation"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Booking Status distribution */}
              <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-900" />
                    <span>Booking Statuses</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">LEDGER STATUS</span>
                </div>

                <div className="space-y-4 pt-1 flex-1 flex flex-col justify-center">
                  {(['Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled'] as Booking['status'][]).map((status) => {
                    const count = bookings.filter(b => b.status === status).length;
                    const percent = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                    
                    const barColor = 
                      status === 'Confirmed' 
                        ? 'bg-emerald-500' 
                        : status === 'Checked-In' 
                          ? 'bg-blue-500' 
                          : status === 'Pending'
                            ? 'bg-amber-500'
                            : status === 'Completed'
                              ? 'bg-slate-900'
                              : 'bg-slate-300';

                    const badgeColor = 
                      status === 'Confirmed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : status === 'Checked-In' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : status === 'Completed'
                              ? 'bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-rose-50 text-rose-600 border-rose-100';

                    return (
                      <div key={status} className="space-y-1.5 font-sans">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`text-[10px] font-mono font-bold border px-1.5 py-0.5 uppercase tracking-wider ${badgeColor}`}>
                            {status}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {count} <span className="text-[10px] text-slate-400 font-normal">({Math.round(percent)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 border border-slate-150 w-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-1000`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tracked / Favorite Properties Section */}
            <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Star className="w-4 h-4 text-slate-900" />
                  <span>Tracked Properties & Favorites</span>
                </h4>
                <span className="text-[9px] font-mono text-rose-500 font-bold">FAVORITES ONLY</span>
              </div>

              {favorites.length === 0 ? (
                <div className="border border-dashed border-slate-200 p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Heart className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No suites bookmarked yet</p>
                  <p className="text-[11px]">Save luxury suites in the Suites catalog to track them on your dashboard.</p>
                  <button
                    onClick={() => setSubTab('catalog')}
                    className="mt-2 text-xs border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-800 font-bold uppercase tracking-widest px-4 py-1.5 cursor-pointer rounded-none"
                  >
                    Go to Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {LUXURY_SUITES.filter(s => favorites.includes(s.name)).map((suite) => (
                    <div key={suite.name} className="border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between hover:border-slate-800 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">{suite.size}</span>
                          <button
                            onClick={() => onToggleFavorite(suite.name)}
                            className="text-rose-500 hover:text-slate-400 cursor-pointer transition-all"
                            title="Remove from favorites"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          </button>
                        </div>
                        <h5 className="text-sm font-bold text-slate-950 mt-1 leading-snug">{suite.name}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{suite.view}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end">
                        <div>
                          <span className="text-[8px] font-mono text-slate-400 uppercase block">RATE</span>
                          <span className="text-sm font-bold text-slate-900 leading-none">${suite.pricePerNight} <span className="text-[9px] font-normal text-slate-500">/nt</span></span>
                        </div>
                        <button
                          onClick={() => handleQuickBook(suite.name)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 cursor-pointer rounded-none active:scale-95 flex items-center gap-1"
                        >
                          <span>Book</span>
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- 1. SUITE CATALOG VIEW --- */}
        {subTab === 'catalog' && (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Catalog Filter Row */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 flex-wrap gap-3">
              <span className="text-xs text-slate-500 font-sans flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-700" />
                <span>Explore and save premium physical suite investments.</span>
              </span>
              
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 cursor-pointer rounded-none"
                />
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Show Favorites Only
                </span>
              </label>
            </div>

            {filteredSuites.length === 0 ? (
              <div className="border border-dashed border-slate-200 p-12 text-center text-slate-400 flex-1 flex flex-col items-center justify-center">
                <Heart className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No favorite suites saved yet</p>
                <p className="text-xs mt-1">Tap the heart icon on any luxury suite listing below to isolate and track them.</p>
                {favoritesOnly && (
                  <button 
                    onClick={() => setFavoritesOnly(false)} 
                    className="mt-4 text-xs font-bold text-slate-900 underline cursor-pointer hover:text-slate-700"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="suites-catalog-grid">
                {filteredSuites.map((suite) => {
                  const isFav = favorites.includes(suite.name);
                  return (
                    <div 
                      key={suite.name} 
                      className="border border-slate-200 bg-white hover:border-slate-800 transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative group"
                    >
                      {/* Heart Toggle Button */}
                      <button
                        onClick={() => onToggleFavorite(suite.name)}
                        className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-800 transition-all text-slate-400 hover:text-rose-500 cursor-pointer rounded-none shadow-xs active:scale-90 z-10"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 transition-all ${isFav ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                      </button>

                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            {suite.size} • Max {suite.capacity} Guests
                          </span>
                          <h4 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                            {suite.name}
                          </h4>
                        </div>

                        <div className="space-y-1 text-xs text-slate-500 font-sans border-t border-b border-slate-100 py-2">
                          <p className="flex justify-between">
                            <span>View Dimension:</span>
                            <span className="text-slate-800 font-semibold">{suite.view}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Platform Status:</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Inventory
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-between items-center mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Rate per night</span>
                          <span className="text-lg font-bold text-slate-900 font-sans leading-none">
                            ${suite.pricePerNight} <span className="text-xs font-normal text-slate-400">USD</span>
                          </span>
                        </div>

                        <button
                          onClick={() => handleQuickBook(suite.name)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 flex items-center gap-1 rounded-none transition-all cursor-pointer active:scale-95"
                        >
                          <span>Reserve</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- 2. CREATE BOOKING FORM VIEW --- */}
        {subTab === 'form' && (
          /* Create Booking Form */
          <form onSubmit={handleSubmit} className="border border-slate-200 p-6 bg-slate-50 space-y-5 shadow-xs max-w-xl mx-auto w-full">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-900" />
              <span>{editingBookingId ? `Edit Booking Reservation [${editingBookingId}]` : 'Simulate New Booking Transaction'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Primary Guest Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admiral Sterling"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Secure Communication Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="sterling@mansion.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Luxury Suite Class
                </label>
                <select
                  value={suiteName}
                  onChange={(e) => setSuiteName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                >
                  {LUXURY_SUITES.map((suite) => (
                    <option key={suite.name} value={suite.name}>
                      {suite.name} (${suite.pricePerNight}/n)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Guest Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedSuiteInfo.capacity}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  Capacity limit: {selectedSuiteInfo.capacity} for this room type.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                />
              </div>

              {editingBookingId && (
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Booking Status
                  </label>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value as Booking['status'])}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white focus:outline-none focus:border-slate-900 rounded-none font-sans"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            {/* Price Preview Card */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center rounded-none select-none">
              <div className="flex flex-col">
                <span className="text-[8px] opacity-40 font-mono uppercase tracking-widest">
                  Estimated Persistent Transaction Ledger
                </span>
                <span className="text-xs text-slate-300 font-sans">
                  {selectedSuiteInfo.view} • {selectedSuiteInfo.size}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-light tracking-tight text-emerald-400 font-sans leading-none">
                  ${computedPrice}
                </span>
                <span className="text-[9px] font-mono opacity-50">
                  Multiplier: {demandFactor === 'Surging' ? '1.40x (Surge)' : demandFactor === 'Elevated' ? '1.15x (Elevated)' : '1.00x (Standard)'}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => {
                  setGuestName('');
                  setEmail('');
                  setEditingBookingId(null);
                  setSubTab('ledger');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-500 bg-white hover:bg-slate-100 text-xs font-bold uppercase tracking-widest cursor-pointer rounded-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{editingBookingId ? 'Save Changes' : 'Commit Booking'}</span>
              </button>
            </div>
          </form>
        )}

        {/* --- 3. SECURE LEDGER BOOKINGS LIST VIEW --- */}
        {subTab === 'ledger' && (
          /* Booking Ledger List */
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
            {bookings.length === 0 ? (
              <div className="border border-dashed border-slate-250 p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                <Info className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Your Secure Booking Ledger is Empty</p>
                <p className="text-xs mt-1">Navigate to the "Suites" directory or click "Book" above to secure a luxury reservation.</p>
              </div>
            ) : (

              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`border p-4 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group ${
                    booking.status === 'Cancelled'
                      ? 'border-dashed border-slate-200 bg-slate-50 opacity-70'
                      : 'border-slate-200 bg-white hover:border-slate-800 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {booking.id}
                      </span>
                      <span className={`text-sm font-bold ${booking.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {booking.guestName}
                      </span>
                      {booking.status === 'Cancelled' && (
                        <span className="text-[9px] font-mono bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 uppercase tracking-wider font-bold">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-sans">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 font-semibold text-[10px] uppercase">
                        {booking.suiteName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.checkIn} to {booking.checkOut}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.guestsCount} guests</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end gap-3 sm:gap-1.5 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className={`text-base font-medium font-sans leading-none ${booking.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      ${booking.totalPrice}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(booking)}
                        className="p-1 border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer rounded-none active:scale-90"
                        title="Edit booking details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {booking.status !== 'Cancelled' && (
                        <button
                          onClick={() => onUpdateStatus(booking.id, 'Cancelled')}
                          className="p-1 border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer rounded-none active:scale-90"
                          title="Cancel Reservation"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <select
                        value={booking.status}
                        onChange={(e) => onUpdateStatus(booking.id, e.target.value as Booking['status'])}
                        className="text-[10px] font-mono font-bold border border-slate-200 bg-slate-50 p-1 px-1.5 outline-none rounded-none focus:border-slate-800 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-In">Checked-In</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => onDeleteBooking(booking.id)}
                        className="p-1 border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors cursor-pointer rounded-none active:scale-90"
                        title="Delete record from simulation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Analytics Dashboard (Right Side) */}
      <div className="w-full lg:w-96 p-6 md:p-8 flex flex-col gap-6 bg-slate-50 overflow-y-auto shrink-0" id="simulator-analytics-panel">
        
        {/* Dynamic Pricing AI Optimizer */}
        <section className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>AI Dynamic Rate Optimizer</span>
            </h3>
            <span className="text-[9px] font-mono bg-slate-150 px-1.5 py-0.5 rounded-xs text-slate-500 uppercase font-semibold">
              {config.aiModel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Calculated Demand
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 border mt-1 inline-block uppercase tracking-wider ${
                demandFactor === 'Surging' 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : demandFactor === 'Elevated' 
                    ? 'bg-amber-50 border-amber-200 text-amber-600' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}>
                {demandFactor}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Base Multiplier
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 mt-1 inline-block">
                {demandFactor === 'Surging' ? '1.40x' : demandFactor === 'Elevated' ? '1.15x' : '1.00x'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Heuristic rate updates process the ledger occupancy levels, scaling core price-per-night constants dynamically to secure optimal yield margins.
          </p>

          <button
            onClick={handleRunAiOptimization}
            disabled={aiOptimizationRunning}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 rounded-none active:scale-95 disabled:bg-slate-350 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiOptimizationRunning ? 'animate-spin' : ''}`} />
            <span>{aiOptimizationRunning ? 'Recomputing Rate Matrices...' : 'Optimize Yield Rates'}</span>
          </button>
        </section>

        {/* Custom SVG Bar Chart (Revenue by Suite Class) */}
        <section className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-900" />
              <span>Revenue by Suite Class</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold">POSTGRES</span>
          </div>

          {/* SVG Custom Horizontal Bar Chart */}
          <div className="space-y-4 pt-1 select-none">
            {Object.entries(analyticsData.revenueBySuite).map(([suite, rev]) => {
              const revenue = rev as number;
              // Calculate width ratio based on a max ceiling of $10k or max revenue in group
              const suiteValues = Object.values(analyticsData.revenueBySuite) as number[];
              const maxCeiling = Math.max(10000, ...suiteValues);
              const percent = maxCeiling > 0 ? (revenue / maxCeiling) * 100 : 0;
              
              return (
                <div key={suite} className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{suite}</span>
                    <span className="font-mono font-bold text-slate-900">${revenue}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 border border-slate-150 rounded-none w-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 transition-all duration-1000 border-r border-emerald-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 flex justify-between font-mono">
            <span>DATABASE ACCUMULATION</span>
            <span className="text-slate-800 font-bold">${analyticsData.totalRevenue} USD</span>
          </div>
        </section>

        {/* Circular Occupancy Forecast Gauge */}
        <section className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-900" />
              <span>Forecast Occupancy Gauge</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold">PERCENTAGE</span>
          </div>

          <div className="flex items-center justify-center py-4 select-none">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(241,245,249,1)" strokeWidth="8" />
                
                {/* Active progress ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="#0f172a" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - analyticsData.simulatedOccupancyRate / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-light tracking-tight text-slate-900 leading-none font-sans">
                  {analyticsData.simulatedOccupancyRate}%
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Occupancy
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 leading-relaxed text-center font-sans">
            Inventory limits are locked to 12 total physical suite assets. Current active load represents <span className="font-bold text-slate-800">{analyticsData.activeBookingCount} booked suite blocks</span>.
          </div>
        </section>

      </div>
    </div>
  );
}
