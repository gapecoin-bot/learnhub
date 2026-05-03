'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const WARNING_AFTER = 25 * 60 * 1000;   // 25 min inactivity → show warning
const COUNTDOWN_SECS = 5 * 60;           // 5 min countdown before logout
const REFRESH_INTERVAL = 4 * 60 * 1000; // refresh token at most every 4 min

export default function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const router = useRouter();
  const inactivityTimer = useRef(null);
  const countdownTimer = useRef(null);
  const lastRefresh = useRef(0);

  const logout = useCallback(async () => {
    clearTimeout(inactivityTimer.current);
    clearInterval(countdownTimer.current);
    await supabase.auth.signOut();
    router.push('/login?reason=timeout');
  }, [router]);

  const startCountdown = useCallback(() => {
    setShowWarning(true);
    setCountdown(COUNTDOWN_SECS);
    countdownTimer.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [logout]);

  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    clearInterval(countdownTimer.current);
    setShowWarning(false);
    setCountdown(COUNTDOWN_SECS);

    // Only refresh token if enough time has passed — prevents 429 errors
    const now = Date.now();
    if (now - lastRefresh.current > REFRESH_INTERVAL) {
      lastRefresh.current = now;
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          supabase.auth.refreshSession().catch(() => {
            // Silently ignore refresh errors — autoRefreshToken handles it
          });
        }
      });
    }

    inactivityTimer.current = setTimeout(startCountdown, WARNING_AFTER);
  }, [startCountdown]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(inactivityTimer.current);
      clearInterval(countdownTimer.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 text-center shadow-xl">
        <div className="w-16 h-16 bg-[#fff8e1] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⏰</div>
        <h3 className="text-base font-semibold text-[#202124] mb-2">Still there?</h3>
        <p className="text-sm text-gray-500 mb-4">You've been inactive for a while. For your security, you'll be logged out in:</p>
        <div className="text-4xl font-bold text-[#ea4335] mb-6 font-mono">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition"
          >
            Log out now
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 py-2.5 rounded-xl bg-[#F5A623] text-[#0C0E13] text-sm font-semibold hover:opacity-90 transition"
          >
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  );
}