'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolments, setEnrolments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState('Profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', address: '', dob: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    new_password: '', confirm_password: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  // ─── AUTH CHECK ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData) { router.push('/login'); return; }
      if (profileData.role === 'super_admin') { router.push('/admin'); return; }
      if (profileData.role === 'assessor') { router.push('/assessor'); return; }
      setProfile(profileData);
      setForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        dob: profileData.dob || '',
      });
      await fetchAll(session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ─── DATA FETCHERS ────────────────────────────────────────────────────────────
  const fetchAll = async (userId) => {
    const { data: enrolData } = await supabase
      .from('enrolments')
      .select('*, course:courses(id, title, emoji, category, level, awarding_body)')
      .eq('student_id', userId)
      .eq('is_active', true)
      .order('enrolled_at', { ascending: false });
    if (enrolData) setEnrolments(enrolData);

    const { data: subData } = await supabase
      .from('submissions')
      .select('*, assignment:assignments(id, title, course:courses(id, title, emoji))')
      .eq('student_id', userId)
      .order('submitted_at', { ascending: false });
    if (subData) setSubmissions(subData);

    const { data: certData } = await supabase
      .from('certificates')
      .select('*, course:courses(id, title, emoji, awarding_body)')
      .eq('student_id', userId)
      .order('issued_at', { ascending: false });
    if (certData) setCertificates(certData);
  };

  // ─── PROFILE SAVE ─────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setSaveError('First name and last name are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('profiles').update({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      dob: form.dob || null,
    }).eq('id', profile.id);
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setProfile(prev => ({ ...prev, ...form }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ─── PASSWORD CHANGE ──────────────────────────────────────────────────────────
  const changePassword = async () => {
    setPasswordError('');
    if (!passwordForm.new_password) { setPasswordError('Please enter a new password.'); return; }
    if (passwordForm.new_password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    if (passwordForm.new_password !== passwordForm.confirm_password) { setPasswordError('Passwords do not match.'); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new_password });
    setChangingPassword(false);
    if (error) { setPasswordError(error.message); return; }
    setPasswordSaved(true);
    setPasswordForm({ new_password: '', confirm_password: '' });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  // ─── AVATAR UPLOAD ────────────────────────────────────────────────────────────
  const uploadAvatar = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setSaveError('Avatar must be JPG, PNG or WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Avatar must be under 2MB.');
      return;
    }
    setUploadingAvatar(true);
    const fileName = `avatar_${profile.id}_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });
    if (upErr) { setSaveError(`Upload failed: ${upErr.message}`); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id);
    setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
    setUploadingAvatar(false);
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '';

  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] transition';

  return (
    <div className="flex min-h-screen font-sans">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-56 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Main</p>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">🏠 Dashboard</Link>
        <Link href="/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">📚 My Courses</Link>
        <Link href="/browse" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">🔍 Browse Courses</Link>
        <Link href="/assignments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">📝 Assignments</Link>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mt-4 mb-1">Account</p>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-white/10 text-sm">👤 Profile</Link>
        <div className="mt-auto">
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-400 mb-1">Student ID</p>
            <p className="text-xs text-white font-mono">{profile?.student_id || '—'}</p>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">🚪 Log out</button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 z-50 flex items-center justify-around px-2 py-3">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">🏠</span><span className="text-[10px]">Home</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">📚</span><span className="text-[10px]">Courses</span>
        </Link>
        <Link href="/assignments" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">📝</span><span className="text-[10px]">Assignments</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-white">
          <span className="text-lg">👤</span><span className="text-[10px]">Profile</span>
        </Link>
      </nav><main className="flex-1 md:ml-56 bg-[#f0f2f5] p-4 md:p-8 pb-24 md:pb-8">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-medium">{initials}</div>
        </div>

        {/* ── Desktop top bar ── */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Account</p>
            <h2 className="text-xl font-semibold text-[#202124]">My Profile</h2>
          </div>
        </div>

        {/* ── Profile hero card ── */}
        <div className="bg-gradient-to-br from-[#0C0E13] to-[#1a1d27] rounded-2xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
              )}
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-[#4285f4] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition">
                {uploadingAvatar ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-[10px] text-white">✏️</span>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => uploadAvatar(e.target.files[0])} className="hidden" />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-sm text-gray-400">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs bg-[#4285f4]/20 text-[#4285f4] px-2 py-0.5 rounded-full">Student</span>
                <span className="text-xs text-gray-500 font-mono">{profile?.student_id}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              {[
                { label: 'Enrolled', value: enrolments.length, color: 'text-[#4285f4]' },
                { label: 'Submitted', value: submissions.length, color: 'text-[#fbbc04]' },
                { label: 'Graded', value: gradedCount, color: 'text-[#34a853]' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab pills ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['Profile', 'My Courses', 'Submissions', 'Certificates', 'Security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition ${activeTab === tab ? 'bg-[#4285f4] text-white border-[#4285f4]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#4285f4] hover:text-[#4285f4]'}`}
            >
              {tab === 'Profile' && '👤 '}
              {tab === 'My Courses' && '📚 '}
              {tab === 'Submissions' && '📝 '}
              {tab === 'Certificates' && '🏆 '}
              {tab === 'Security' && '🔒 '}
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB: Profile ── */}
        {activeTab === 'Profile' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-[#202124] mb-5">Personal information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">First name <span className="text-[#ea4335]">*</span></label>
                <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Last name <span className="text-[#ea4335]">*</span></label>
                <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Email address</label>
                <input type="email" value={profile?.email || ''} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 outline-none cursor-not-allowed" />
                <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Phone number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +44 7700 000000" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Date of birth</label>
                <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Student ID</label>
                <input type="text" value={profile?.student_id || ''} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 font-mono outline-none cursor-not-allowed" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. 123 Main Street, London" className={inputCls} />
              </div>
            </div>
            {saveError && (
              <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <span>⚠️</span><span>{saveError}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={saveProfile} disabled={saving} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saved && <span className="text-xs text-[#34a853]">✓ Changes saved</span>}
            </div>
          </div>
        )}

        {/* ── TAB: My Courses ── */}
        {activeTab === 'My Courses' && (
          <div>
            {enrolments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📚</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No courses yet</h4>
                <p className="text-xs text-gray-400 mb-4">Browse and enrol in a course to get started.</p>
                <Link href="/browse" className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">Browse courses</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {enrolments.map((e) => (
                  <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 hover:border-[#4285f4] transition">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="text-3xl shrink-0">{e.course?.emoji || '📚'}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#202124] mb-0.5">{e.course?.title}</h4>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">{e.course?.category}</span>
                          <span className="text-[10px] text-gray-400">{e.course?.level}</span>
                          <span className="text-[10px] text-gray-400">📜 {e.course?.awarding_body}</span>
                          <span className="text-[10px] text-gray-400">Enrolled {new Date(e.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#4285f4] to-[#34a853] rounded-full" style={{ width: `${e.progress || 0}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{e.progress || 0}%</span>
                        </div>
                      </div>
                      <Link href={`/courses/${e.course_id}`} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition shrink-0">Continue →</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Submissions ── */}
        {activeTab === 'Submissions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#202124]">My submissions</h3>
              <span className="text-xs text-gray-400">{submissions.length} total</span>
            </div>
            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No submissions yet</h4>
                <p className="text-xs text-gray-400">Your submitted assignments will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {submissions.map((s) => {
                  const statusStyle = {
                    submitted: 'bg-[#fff8e1] text-[#f9a825]',
                    graded: 'bg-[#e6f4ea] text-[#137333]',
                    pending: 'bg-[#fce8e6] text-[#c5221f]',
                  }[s.status] || 'bg-[#f0f2f5] text-gray-500';
                  const statusLabel = {
                    submitted: '📤 Submitted',
                    graded: '✅ Graded',
                    pending: '⏳ Pending',
                  }[s.status] || s.status;
                  return (
                    <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#4285f4] transition">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-xs font-semibold text-[#202124]">{s.assignment?.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>{statusLabel}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{s.assignment?.course?.emoji} {s.assignment?.course?.title}</p>
                          {s.submitted_at && <p className="text-[10px] text-gray-400 mt-0.5">Submitted {new Date(s.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                          {s.status === 'graded' && s.grade && (
                            <span className="text-xs bg-[#e6f4ea] text-[#137333] px-2.5 py-1 rounded-full font-medium mt-2 inline-block">Grade: {s.grade}</span>
                          )}
                          {s.status === 'graded' && s.feedback && (
                            <div className="mt-2 bg-[#e8f0fe] rounded-lg px-3 py-2">
                              <p className="text-[10px] font-medium text-[#1a73e8] mb-0.5">Assessor feedback</p>
                              <p className="text-xs text-[#202124]">{s.feedback}</p>
                            </div>
                          )}
                        </div>
                        {s.file_url && (
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition shrink-0">📄 View</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}{/* ── TAB: Certificates ── */}
        {activeTab === 'Certificates' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#202124]">My certificates</h3>
              <span className="text-xs text-gray-400">{certificates.length} earned</span>
            </div>
            {certificates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No certificates yet</h4>
                <p className="text-xs text-gray-400 mb-4">Complete a course and pass your assessments to earn a certificate.</p>
                <Link href="/courses" className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">View my courses</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 hover:border-[#4285f4] transition">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="w-12 h-12 bg-[#e6f4ea] rounded-xl flex items-center justify-center text-2xl shrink-0">🏆</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#202124]">{cert.course?.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Awarded by {cert.course?.awarding_body}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {cert.grade && <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full font-medium">Grade: {cert.grade}</span>}
                          <span className="text-[10px] text-gray-400">{new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                      {cert.certificate_url && (
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition">👁 Preview</a>
                          <a href={cert.certificate_url} download className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">⬇ Download</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Security ── */}
        {activeTab === 'Security' && (
          <div className="flex flex-col gap-6">

            {/* ── Change password ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-1">Change password</h3>
              <p className="text-xs text-gray-400 mb-5">Choose a strong password with at least 6 characters.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">New password</label>
                  <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} placeholder="Enter new password" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">Confirm new password</label>
                  <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} placeholder="Confirm new password" className={inputCls} />
                </div>
              </div>
              {passwordError && (
                <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <span>⚠️</span><span>{passwordError}</span>
                </div>
              )}
              {passwordSaved && (
                <div className="bg-[#e6f4ea] text-[#137333] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <span>✓</span><span>Password updated successfully!</span>
                </div>
              )}
              <button onClick={changePassword} disabled={changingPassword} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                {changingPassword ? 'Updating...' : 'Update password'}
              </button>
            </div>

            {/* ── Account info ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-4">Account information</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Full name', value: `${profile?.first_name} ${profile?.last_name}` },
                  { label: 'Email', value: profile?.email },
                  { label: 'Student ID', value: profile?.student_id },
                  { label: 'Role', value: 'Student' },
                  { label: 'Member since', value: new Date(profile?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400">{d.label}</span>
                    <span className="text-xs font-medium text-[#202124]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sign out ── */}
            <div className="bg-white rounded-2xl border border-[#ea4335]/20 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#ea4335] mb-1">Sign out</h3>
              <p className="text-xs text-gray-400 mb-4">Sign out of your LearnHub account on this device.</p>
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                className="px-5 py-2 rounded-lg border border-[#ea4335] text-[#ea4335] text-sm font-medium hover:bg-[#fce8e6] transition"
              >
                🚪 Sign out
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}