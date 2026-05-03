'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  // ─── CHECK IF ALREADY LOGGED IN ───────────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await redirectByRole(session.user.id);
    };
    checkSession();
  }, []);

  // ─── ROLE-BASED REDIRECT ──────────────────────────────────────────────────────
  const redirectByRole = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!profile) return;
    if (profile.role === 'super_admin') { router.push('/admin'); return; }
    if (profile.role === 'assessor') { router.push('/assessor'); return; }
    router.push('/dashboard');
  };

  // ─── GET IP ───────────────────────────────────────────────────────────────────
  const getIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch { return 'unknown'; }
  };

  // ─── LOGIN HANDLER ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your username or email and password.');
      return;
    }
    setLoading(true);
    setError('');

    const ip = await getIp();
    const input = identifier.trim().toLowerCase();

    // ── Determine the actual login email ──────────────────────────────────────
    // Logic:
    // 1. If input ends with @learnifyacademylwm.co.uk → student username, use directly
    // 2. If input has no @ → treat as school ID, append domain
    // 3. If input is a regular email → look up in profiles
    //    a. If student → use their username field
    //    b. If admin/assessor → use their email directly

    let loginEmail = input;

    if (!input.includes('@')) {
      // School ID without domain e.g. LH-aB3xK9
      loginEmail = `${input}@learnifyacademylwm.co.uk`;
    } else if (input.endsWith('@learnifyacademylwm.co.uk')) {
      // Full username — use directly
      loginEmail = input;
    } else {
      // Regular personal email — look up in profiles
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('email', input)
        .maybeSingle();

      if (profileByEmail) {
        if (profileByEmail.role === 'student') {
          if (profileByEmail.username) {
            loginEmail = profileByEmail.username;
          } else {
            setError('Please use your school username to log in, not your personal email.');
            setLoading(false);
            return;
          }
        } else {
          // Admin or assessor — use personal email directly
          loginEmail = input;
        }
      } else {
        // Not found in profiles — try as-is (could be new admin)
        loginEmail = input;
      }
    }

    // ── Attempt sign in ───────────────────────────────────────────────────────
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authErr) {
      await supabase.from('login_logs').insert({
        email: input,
        ip_address: ip,
        status: 'failed',
        logged_in_at: new Date().toISOString(),
      });
      setError('Incorrect username or password. Please try again.');
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // ── Fetch profile ─────────────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, first_name')
      .eq('id', userId)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      setError('Account not found. Please contact support.');
      setLoading(false);
      return;
    }

    // ── Check if student has active enrolment ─────────────────────────────────
    if (profile.role === 'student') {
      const { data: activeEnrol } = await supabase
        .from('enrolments')
        .select('id')
        .eq('student_id', userId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!activeEnrol) {
        await supabase.auth.signOut();
        await supabase.from('login_logs').insert({
          email: input,
          ip_address: ip,
          status: 'suspended',
          logged_in_at: new Date().toISOString(),
        });
        router.push('/login?reason=suspended');
        return;
      }
    }

    // ── Log successful login ──────────────────────────────────────────────────
    await supabase.from('login_logs').insert({
      user_id: userId,
      email: input,
      ip_address: ip,
      status: 'success',
      logged_in_at: new Date().toISOString(),
    });

    // ── Redirect by role ──────────────────────────────────────────────────────
    if (profile.role === 'super_admin') { router.push('/admin'); return; }
    if (profile.role === 'assessor') { router.push('/assessor'); return; }
    router.push('/dashboard');
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4]/10 transition';
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-lg">L</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
          </Link>
          <h1 className="text-xl font-semibold text-[#202124]">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue learning</p>
        </div>

        {/* ── Reason banners ── */}
        {reason === 'timeout' && (
          <div className="bg-[#fff8e1] border border-[#fbbc04]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-lg shrink-0">⏰</span>
            <div>
              <p className="text-sm font-medium text-[#f9a825]">Session expired</p>
              <p className="text-xs text-gray-500 mt-0.5">You were signed out after being inactive. Please sign in again.</p>
            </div>
          </div>
        )}

        {reason === 'suspended' && (
          <div className="bg-[#fff8e1] border border-[#fbbc04]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-lg shrink-0">⏳</span>
            <div>
              <p className="text-sm font-medium text-[#f9a825]">Enrolment under review</p>
              <p className="text-xs text-gray-500 mt-0.5">Your enrolment is currently being reviewed by our team. Please contact us if you have any questions.</p>
            </div>
          </div>
        )}

        {reason === 'unauthorized' && (
          <div className="bg-[#fce8e6] border border-[#ea4335]/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-lg shrink-0">🔒</span>
            <div>
              <p className="text-sm font-medium text-[#c5221f]">Access denied</p>
              <p className="text-xs text-gray-500 mt-0.5">You need to sign in to access that page.</p>
            </div>
          </div>
        )}{/* ── Login card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* ── Username or email ── */}
            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1.5">
                Username/email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="@learnifyacademylwm.co.uk"
                autoComplete="username"
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                
              </p>
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#202124] transition text-sm"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">New to LearnHub?</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {/* ── Enrol CTA ── */}
          <Link href="/browse" className="block w-full py-3 rounded-xl border-2 border-[#4285f4] text-[#4285f4] text-sm font-semibold hover:bg-[#e8f0fe] transition text-center">
            Browse courses & enrol
          </Link>
        </div>

        {/* ── Footer links ── */}
        <div className="text-center mt-6 flex flex-col gap-2">
          <p className="text-xs text-gray-400">
            Having trouble?{' '}
            <a href="mailto:support@learnhub.co.uk" className="text-[#4285f4] hover:underline">Contact support</a>
          </p>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#202124] transition">← Back to home</Link>
        </div>

        {/* ── Security note ── */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
          <span className="text-lg shrink-0">🔐</span>
          <div>
            <p className="text-xs font-medium text-[#202124]">Secure sign in</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Your connection is encrypted. We never share your personal information with third parties.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}