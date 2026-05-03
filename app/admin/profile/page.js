'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('Personal');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (!data || data.role !== 'super_admin') { router.push('/dashboard'); return; }
      setProfile(data);
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      });
      setLoading(false);
    };
    getProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
      })
      .eq('id', profile.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setProfile({ ...profile, ...form });
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (!passwordForm.newPass || !passwordForm.confirm) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPass,
    });
    setChangingPassword(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you absolutely sure? This will permanently delete your admin account and cannot be undone.');
    if (!confirmed) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans">

      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>

        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <div>
              <p className="text-xs font-medium text-white">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#34a853]">Super Admin</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Management</p>
        {['Overview', 'Courses', 'Students', 'Assessors', 'Submissions', 'Certificates', 'Announcements', 'Login Logs'].map((tab) => (
          <Link
            key={tab}
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition"
          >
            {tab === 'Overview' && '📊 '}
            {tab === 'Courses' && '📚 '}
            {tab === 'Students' && '👥 '}
            {tab === 'Assessors' && '👨‍🏫 '}
            {tab === 'Submissions' && '📝 '}
            {tab === 'Certificates' && '🏆 '}
            {tab === 'Announcements' && '📢 '}
            {tab === 'Login Logs' && '🔐 '}
            {tab}
          </Link>
        ))}

        <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-white/10 text-sm mt-1">
          👤 My Profile
        </Link>

        <div className="mt-auto">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full"
          >
            🚪 Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60 bg-[#f0f2f5] p-4 md:p-8 pb-24 md:pb-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Manage your account</p>
            <h2 className="text-xl font-semibold text-[#202124]">Admin Profile</h2>
          </div>
          <Link href="/admin" className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition">
            ← Back to admin
          </Link>
        </div>

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-2xl md:text-3xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-[#202124]">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-sm text-gray-400">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">Super Admin</span>
                <span className="text-xs bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">Active</span>
                <span className="text-xs text-gray-400 font-mono">ID: {profile?.student_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
          {['Personal', 'Security', 'Danger Zone'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-5 py-2.5 text-xs md:text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 transition ${activeTab === tab ? 'border-[#4285f4] text-[#4285f4]' : 'border-transparent text-gray-500 hover:text-[#202124]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Personal tab */}
        {activeTab === 'Personal' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-[#202124] mb-5">Personal information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: 'First name', key: 'first_name', type: 'text' },
                { label: 'Last name', key: 'last_name', type: 'text' },
                { label: 'Phone number', key: 'phone', type: 'tel' },
                { label: 'Address', key: 'address', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4]/10 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 outline-none cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : 'Save changes'}
              </button>
              {saved && (
                <span className="text-xs text-[#34a853] flex items-center gap-1">
                  ✓ Changes saved successfully
                </span>
              )}
            </div>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'Security' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-5">Change password</h3>

              {passwordError && (
                <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-4 border border-[#f5c6c6] flex items-center gap-2">
                  <span>⚠️</span><span>{passwordError}</span>
                </div>
              )}

              {passwordSaved && (
                <div className="bg-[#e6f4ea] text-[#137333] text-xs px-4 py-3 rounded-lg mb-4 border border-[#34a853]/20 flex items-center gap-2">
                  <span>✓</span><span>Password updated successfully.</span>
                </div>
              )}

              <div className="flex flex-col gap-4 max-w-md">
                {[
                  { label: 'New password', key: 'newPass' },
                  { label: 'Confirm new password', key: 'confirm' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">{f.label}</label>
                    <div className="relative">
                      <input
                        type={showPasswords[f.key] ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={passwordForm[f.key]}
                        onChange={(e) => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] transition pr-20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, [f.key]: !showPasswords[f.key] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-[#4285f4] transition"
                      >
                        {showPasswords[f.key] ? '🙈 Hide' : '👁 Show'}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="w-fit px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {changingPassword ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Updating...
                    </span>
                  ) : 'Update password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-2">Two-factor authentication</h3>
              <p className="text-xs text-gray-400 mb-4">Add an extra layer of security to your admin account.</p>
              <button className="px-5 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] text-xs font-medium hover:bg-[#e8f0fe] transition">
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone tab */}
        {activeTab === 'Danger Zone' && (
          <div className="bg-white rounded-2xl border border-[#ea4335]/20 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-[#ea4335] mb-2">Danger zone</h3>
            <p className="text-xs text-gray-400 mb-6">These actions are irreversible. Please be absolutely certain before proceeding.</p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 flex-wrap gap-3">
                <div>
                  <p className="text-sm font-medium text-[#202124]">Reset all student data</p>
                  <p className="text-xs text-gray-400 mt-0.5">Wipes all student progress and submissions. Cannot be undone.</p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs font-medium hover:bg-[#fce8e6] transition shrink-0">
                  Reset data
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[#ea4335]/30 bg-[#fce8e6]/20 flex-wrap gap-3">
                <div>
                  <p className="text-sm font-medium text-[#ea4335]">Delete admin account</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently deletes your admin account. All data will be lost.</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-[#ea4335] text-white text-xs font-medium hover:opacity-90 transition shrink-0"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}