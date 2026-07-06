import posthog from 'posthog-js';
import { Booking } from '../types';

let isPostHogInitialized = false;

/**
 * Initializes PostHog analytics if keys are configured in the environment.
 */
export function initPostHog(): void {
  if (typeof window === 'undefined' || isPostHogInitialized) {
    return;
  }

  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (key) {
    try {
      posthog.init(key, {
        api_host: host,
        autocapture: true,
        capture_pageview: true,
        person_profiles: 'identified_only',
        loaded: () => {
          console.log('[PostHog] Initialized successfully with remote host:', host);
        }
      });
      isPostHogInitialized = true;
    } catch (err) {
      console.error('[PostHog] Failed to initialize:', err);
    }
  } else {
    console.log('[PostHog] Running in Simulated Sandbox Mode (VITE_POSTHOG_KEY is not defined).');
  }
}

/**
 * Tracks a custom event in PostHog.
 * Falls back to console logger if PostHog keys are missing.
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  
  if (key && isPostHogInitialized) {
    try {
      posthog.capture(eventName, properties);
      console.log(`[PostHog] Event captured: "${eventName}"`, properties);
    } catch (err) {
      console.error(`[PostHog] Error capturing event "${eventName}":`, err);
    }
  } else {
    // Elegant, structured console tracker for Sandbox mode
    console.info(
      `%c[PostHog Sandbox] Event: "${eventName}"`,
      'background: #1e293b; color: #38bdf8; padding: 4px 8px; font-weight: bold; font-family: monospace;',
      properties
    );
  }
}

/**
 * Specifically tracks a "Booking Created" event with complete contextual attributes.
 */
export function trackBookingCreated(booking: Omit<Booking, 'id'> & { id?: string }, userId?: string): void {
  // If the user has a specific ID, identify them in PostHog first so the event maps correctly
  if (userId && import.meta.env.VITE_POSTHOG_KEY && isPostHogInitialized) {
    try {
      posthog.identify(userId, {
        email: booking.email
      });
    } catch (err) {
      console.error('[PostHog] Error identifying user:', err);
    }
  }

  trackEvent('Booking Created', {
    bookingId: booking.id || 'new_simulation',
    guestName: booking.guestName,
    email: booking.email,
    suiteName: booking.suiteName,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    status: booking.status,
    totalPrice: booking.totalPrice,
    guestsCount: booking.guestsCount,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString()
  });
}
