'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'super_admin') {
      router.push('/admin');
    } else if (profile?.role === 'assessor') {
      router.push('/assessor');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex flex-col">

      <nav className="bg-[#0C0E13] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Don't have an account?</span>
          <Link href="/" className="text-xs px-3 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white transition">
            Back to home
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm">

            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-lg">L</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
              </Link>
              <h2 className="text-lg font-semibold text-[#202124] mb-1">Welcome back</h2>
              <p className="text-sm text-gray-400">Sign in to continue your learning journey</p>
            </div>

            {error && (
              <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-4 border border-[#f5c6c6]">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#4285f4] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#4285f4] transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4285f4] transition text-xs"
                  >
                    {showPassword ? '🙈 Hide' : '👁 Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-[#4285f4]" />
                  <span className="text-xs text-gray-500">Remember me</span>
                </label>
                <span className="text-xs text-[#4285f4] cursor-pointer hover:underline">Forgot password?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-gray-200"></span>
              <span className="text-xs text-gray-400">or continue with</span>
              <span className="flex-1 h-px bg-gray-200"></span>
            </div>

            <div className="flex gap-3 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm text-[#202124] hover:bg-gray-50 transition">
                <span className="font-bold text-[#4285f4]">G</span> Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm text-[#202124] hover:bg-gray-50 transition">
                <span className="font-bold text-[#0a66c2]">in</span> LinkedIn
              </button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <span className="text-[#4285f4] cursor-pointer hover:underline">Contact your administrator</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {['TQUK Accredited', 'OTHM Approved', 'Qualifi Partner', 'NOCN Recognised'].map((b) => (
              <span key={b} className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="text-[#34a853]">✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0C0E13] border-t border-white/5 px-6 py-4 text-center">
        <p className="text-xs text-gray-600">© 2025 LearnHub. All Rights Reserved.</p>
      </div>

    </div>
  );
}