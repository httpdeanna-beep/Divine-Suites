/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initSupabaseClient, getSupabaseConfig } from './supabase';
import { Booking } from '../types';

export interface UserSession {
  id: string;
  email: string;
}

// Check if we have active configuration
const isRealClientAvailable = () => {
  const { url, anonKey } = getSupabaseConfig();
  return !!(url && anonKey);
};

// Initialize client
let supabaseClient = initSupabaseClient();

export const reinitSupabase = () => {
  supabaseClient = initSupabaseClient();
  return !!supabaseClient;
};

// Database interfaces
export interface Favorite {
  id?: string;
  user_id: string;
  suite_name: string;
}

// Simulated data storage
const getSimulatedUsers = (): Record<string, string> => {
  const data = localStorage.getItem('divine_suites_sim_users');
  return data ? JSON.parse(data) : {};
};

const saveSimulatedUser = (email: string, passwordHash: string) => {
  const users = getSimulatedUsers();
  users[email.toLowerCase()] = passwordHash;
  localStorage.setItem('divine_suites_sim_users', JSON.stringify(users));
};

const getSimulatedSession = (): UserSession | null => {
  const data = localStorage.getItem('divine_suites_sim_session');
  return data ? JSON.parse(data) : null;
};

const saveSimulatedSession = (session: UserSession | null) => {
  if (session) {
    localStorage.setItem('divine_suites_sim_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('divine_suites_sim_session');
  }
};

const getSimulatedBookings = (): Record<string, Booking[]> => {
  const data = localStorage.getItem('divine_suites_sim_bookings_v2');
  return data ? JSON.parse(data) : {};
};

const saveSimulatedBookings = (userId: string, bookings: Booking[]) => {
  const all = getSimulatedBookings();
  all[userId] = bookings;
  localStorage.setItem('divine_suites_sim_bookings_v2', JSON.stringify(all));
};

const getSimulatedFavorites = (): Record<string, string[]> => {
  const data = localStorage.getItem('divine_suites_sim_favorites');
  return data ? JSON.parse(data) : {};
};

const saveSimulatedFavorites = (userId: string, suites: string[]) => {
  const all = getSimulatedFavorites();
  all[userId] = suites;
  localStorage.setItem('divine_suites_sim_favorites', JSON.stringify(all));
};

export const supabaseService = {
  // Check active mode
  isRealMode(): boolean {
    return !!supabaseClient;
  },

  getModeLabel(): 'REAL_CLOUD' | 'SANDBOX' {
    return this.isRealMode() ? 'REAL_CLOUD' : 'SANDBOX';
  },

  // AUTH API
  async getSession(): Promise<UserSession | null> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          return {
            id: session.user.id,
            email: session.user.email || '',
          };
        }
      } catch (err) {
        console.error('Error fetching real Supabase session:', err);
      }
    }
    return getSimulatedSession();
  },

  async signUp(email: string, password: string): Promise<{ user: UserSession | null; error: string | null }> {
    const formattedEmail = email.trim().toLowerCase();
    
    if (this.isRealMode() && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: formattedEmail,
          password: password,
        });
        if (error) throw error;
        if (data.user) {
          const userSession = {
            id: data.user.id,
            email: data.user.email || '',
          };
          return { user: userSession, error: null };
        }
        return { user: null, error: 'Check your email for confirmation link!' };
      } catch (err: any) {
        return { user: null, error: err.message || 'Failed to sign up on Supabase' };
      }
    } else {
      // Simulate SignUp
      const users = getSimulatedUsers();
      if (users[formattedEmail]) {
        return { user: null, error: 'User already exists with this email' };
      }
      
      const userId = `sim-user-${Math.random().toString(36).substr(2, 9)}`;
      saveSimulatedUser(formattedEmail, password); // simplified for simulation
      
      const session = { id: userId, email: formattedEmail };
      saveSimulatedSession(session);
      return { user: session, error: null };
    }
  },

  async logIn(email: string, password: string): Promise<{ user: UserSession | null; error: string | null }> {
    const formattedEmail = email.trim().toLowerCase();

    if (this.isRealMode() && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: formattedEmail,
          password: password,
        });
        if (error) throw error;
        if (data.user) {
          const userSession = {
            id: data.user.id,
            email: data.user.email || '',
          };
          return { user: userSession, error: null };
        }
        return { user: null, error: 'Invalid login details' };
      } catch (err: any) {
        return { user: null, error: err.message || 'Failed to log in to Supabase' };
      }
    } else {
      // Simulate Login
      const users = getSimulatedUsers();
      if (users[formattedEmail] && users[formattedEmail] === password) {
        const userId = `sim-user-${formattedEmail.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const session = { id: userId, email: formattedEmail };
        saveSimulatedSession(session);
        return { user: session, error: null };
      }
      return { user: null, error: 'Invalid email or password' };
    }
  },

  async logOut(): Promise<void> {
    if (this.isRealMode() && supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.error('Error logging out from Supabase:', err);
      }
    }
    saveSimulatedSession(null);
  },

  // BOOKINGS DATABASE API
  async getBookings(userId: string): Promise<Booking[]> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
          id: row.id,
          guestName: row.guest_name,
          email: row.email,
          suiteName: row.suite_name,
          checkIn: row.check_in,
          checkOut: row.check_out,
          status: row.status,
          totalPrice: row.total_price,
          guestsCount: row.guests_count,
        }));
      } catch (err) {
        console.error('Error getting bookings from Supabase, reverting to simulator state:', err);
      }
    }

    // Local / simulated mode fallback
    const bookingsMap = getSimulatedBookings();
    return bookingsMap[userId] || [];
  },

  async createBooking(userId: string, booking: Omit<Booking, 'id'>): Promise<Booking> {
    const newId = `DS-B${String(Math.floor(Math.random() * 900) + 100)}`;
    const fullBooking: Booking = { id: newId, ...booking };

    if (this.isRealMode() && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('bookings')
          .insert({
            id: newId,
            user_id: userId,
            guest_name: booking.guestName,
            email: booking.email,
            suite_name: booking.suiteName,
            check_in: booking.checkIn,
            check_out: booking.checkOut,
            status: booking.status,
            total_price: booking.totalPrice,
            guests_count: booking.guestsCount,
          });

        if (error) throw error;
        return fullBooking;
      } catch (err) {
        console.error('Failed to create booking in Supabase, using simulated storage:', err);
      }
    }

    const userBookings = await this.getBookings(userId);
    const updated = [fullBooking, ...userBookings];
    saveSimulatedBookings(userId, updated);
    return fullBooking;
  },

  async updateBookingStatus(userId: string, id: string, status: Booking['status']): Promise<boolean> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('bookings')
          .update({ status })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error updating status in Supabase:', err);
      }
    }

    const userBookings = await this.getBookings(userId);
    const updated = userBookings.map(b => b.id === id ? { ...b, status } : b);
    saveSimulatedBookings(userId, updated);
    return true;
  },

  async updateBooking(userId: string, id: string, booking: Omit<Booking, 'id'>): Promise<boolean> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('bookings')
          .update({
            guest_name: booking.guestName,
            email: booking.email,
            suite_name: booking.suiteName,
            check_in: booking.checkIn,
            check_out: booking.checkOut,
            status: booking.status,
            total_price: booking.totalPrice,
            guests_count: booking.guestsCount,
          })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error updating booking in Supabase:', err);
      }
    }

    const userBookings = await this.getBookings(userId);
    const updated = userBookings.map(b => b.id === id ? { id, ...booking } : b);
    saveSimulatedBookings(userId, updated);
    return true;
  },

  async deleteBooking(userId: string, id: string): Promise<boolean> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('bookings')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error deleting from Supabase:', err);
      }
    }

    const userBookings = await this.getBookings(userId);
    const updated = userBookings.filter(b => b.id !== id);
    saveSimulatedBookings(userId, updated);
    return true;
  },

  // FAVORITES DATABASE API
  async getFavorites(userId: string): Promise<string[]> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('favorites')
          .select('suite_name')
          .eq('user_id', userId);

        if (error) throw error;
        return (data || []).map((row: any) => row.suite_name);
      } catch (err) {
        console.error('Error fetching favorites from Supabase:', err);
      }
    }

    const favs = getSimulatedFavorites();
    return favs[userId] || [];
  },

  async addFavorite(userId: string, suiteName: string): Promise<boolean> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('favorites')
          .insert({
            user_id: userId,
            suite_name: suiteName
          });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error adding favorite to Supabase:', err);
      }
    }

    const favs = await this.getFavorites(userId);
    if (!favs.includes(suiteName)) {
      const updated = [...favs, suiteName];
      saveSimulatedFavorites(userId, updated);
    }
    return true;
  },

  async removeFavorite(userId: string, suiteName: string): Promise<boolean> {
    if (this.isRealMode() && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('suite_name', suiteName);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Error removing favorite from Supabase:', err);
      }
    }

    const favs = await this.getFavorites(userId);
    const updated = favs.filter(s => s !== suiteName);
    saveSimulatedFavorites(userId, updated);
    return true;
  }
};
