'use client';

import { HabitReminder } from '@/types';

/**
 * Checks if the Notification API is supported in the current browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets the current notification permission state
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Plays a soft, harmonic notification chime using the Web Audio API (zero external assets needed)
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore audio context autoplay restrictions gracefully
  }
}

/**
 * Triggers subtle device vibration if supported
 */
export function triggerVibration(pattern: number[] = [100, 50, 100]): void {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Sends a native system notification for a HabitReminder
 */
export function sendBrowserNotification(
  reminder: HabitReminder,
  onClick?: () => void
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const options: NotificationOptions = {
      body: reminder.message,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: `budgeti-${reminder.cueType}`,
      requireInteraction: reminder.urgency === 'important',
      data: {
        url: window.location.origin,
        action: reminder.suggestedAction,
        reminderId: reminder.id,
      },
    };

    const notification = new Notification(reminder.title, options);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (onClick) {
        onClick();
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.error('Failed to dispatch browser notification:', err);
    return false;
  }
}
