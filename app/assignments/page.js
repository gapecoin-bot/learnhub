'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';
import WebPattern from '@/app/components/WebPattern';

// ─── GRAY EMOJI WRAPPER ───────────────────────────────────────────────────────
const GE = ({ children, size = 'text-base', opacity = 0.6 }) => (
  <span style={{ filter: 'grayscale(1)', opacity }} className={`${size} shrink-0`}>
    {children}
  </span>
);

export default function AssignmentsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [notes, setNotes] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [courseId, setCourseId] = useState(null); // ── for My Courses nav link
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (!profileData || profileData.role !== 'student') { router.push('/login'); return; }
      setProfile(profileData);

      // ── Fetch active enrolment for nav link ──
      const { data: enrolment } = await supabase
        .from('enrolments')
        .select('course_id')
        .eq('student_id', session.user.id)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (enrolment?.course_id) setCourseId(enrolment.course_id);

      // ── Fetch all active enrolments for assignment lookup ──
      const { data: enrolments } = await supabase
        .from('enrolments')
        .select('course_id')
        .eq('student_id', session.user.id)
        .eq('is_active', true);
      const courseIds = (enrolments || []).map(e => e.course_id);

      if (courseIds.length > 0) {
        // ── Fetch assignments from unlocked modules only ──
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('*, course:courses(id, title, emoji, banner_from, banner_to), module:course_modules(id, title, is_locked)')
          .in('course_id', courseIds)
          .not('instructions_url', 'is', null)
          .order('deadline', { ascending: true });
        // Filter out assignments belonging to locked modules
        const unlockedAssignments = (assignmentData || []).filter(a => !a.module?.is_locked);
        setAssignments(unlockedAssignments);

        // ── Fetch submissions ──
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', session.user.id)
          .order('submitted_at', { ascending: false });
        setSubmissions(submissionData || []);
      }

      // ── Unread messages ──
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', session.user.id)
        .eq('is_read', false);
      setUnreadMessages(count || 0);

      setLoading(false);
    };
    init();
  }, []);

  // ── Submission helpers ──
  const getSubmissionsFor = (assignmentId) =>
    submissions.filter(s => s.assignment_id === assignmentId);

  const getLatestSubmission = (assignmentId) => {
    const subs = getSubmissionsFor(assignmentId);
    return subs.length > 0 ? subs[0] : null;
  };

  const getAttemptCount = (assignmentId) =>
    getSubmissionsFor(assignmentId).length;

  const canSubmit = (assignmentId) =>
    getAttemptCount(assignmentId) < 3;

  // ── Upload file ──
  const handleUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(assignmentId);
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip'].includes(ext)) {
      alert('Unsupported file type. Please upload PDF, DOC, DOCX, JPG, PNG or ZIP.');
      setUploading(null);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('File too large. Maximum size is 20MB.');
      setUploading(null);
      return;
    }
    const name = `submission_${assignmentId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error: upErr } = await supabase.storage
      .from('submissions')
      .upload(name, file, { cacheControl: '3600', upsert: false });
    if (upErr) { alert(`Upload failed: ${upErr.message}`); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(name);
    setUploadedFiles(prev => ({ ...prev, [assignmentId]: { url: urlData.publicUrl, name: file.name } }));
    setUploading(null);
  };

  // ── Submit assignment ──
  const handleSubmit = async (assignmentId) => {
    const fileData = uploadedFiles[assignmentId];
    if (!fileData) { alert('Please upload a file first.'); return; }
    if (!canSubmit(assignmentId)) { alert('You have reached the maximum of 3 submission attempts.'); return; }
    setSubmitting(assignmentId);
    const { error } = await supabase.from('submissions').insert({
      student_id: profile.id,
      assignment_id: assignmentId,
      file_url: fileData.url,
      notes: notes[assignmentId] || '',
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
    if (error) { alert(`Submission failed: ${error.message}`); setSubmitting(null); return; }

    const { data: updatedSubs } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', profile.id)
      .order('submitted_at', { ascending: false });
    setSubmissions(updatedSubs || []);
    setUploadedFiles(prev => { const n = { ...prev }; delete n[assignmentId]; return n; });
    setNotes(prev => { const n = { ...prev }; delete n[assignmentId]; return n; });
    setSubmitting(null);
  };

  const statusColor = (status) => {
    if (status === 'graded') return 'bg-[#e6f4ea] text-[#137333]';
    if (status === 'submitted') return 'bg-[#e8f0fe] text-[#1a73e8]';
    if (status === 'resubmit') return 'bg-[#fff8e1] text-[#f9a825]';
    return 'bg-[#f0f2f5] text-gray-500';
  };

  const deadlineStatus = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Overdue', color: 'text-[#ea4335]' };
    if (days <= 3) return { label: `${days}d left`, color: 'text-[#f9a825]' };
    return { label: `${days}d left`, color: 'text-[#34a853]' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();

  const pendingAssignments = assignments.filter(a => {
    const sub = getLatestSubmission(a.id);
    return !sub || sub.status === 'resubmit';
  });
  const submittedAssignments = assignments.filter(a => {
    const sub = getLatestSubmission(a.id);
    return sub && (sub.status === 'submitted' || sub.status === 'graded');
  });

  // ── Nav items — My Courses goes directly to /courses/[id] ──
  const navItems = [
    { href: '/dashboard',              icon: '📊', label: 'Dashboard'   },
    { href: `/courses/${courseId}`,    icon: '📚', label: 'My Courses'  },
    { href: '/assignments',            icon: '📝', label: 'Announcements' },
    { href: '/messages',               icon: '💬', label: 'Messages', badge: unreadMessages > 0 ? unreadMessages : null },
    { href: '/resources',              icon: '📁', label: 'Resources'   },
    { href: '/profile',                icon: '👤', label: 'Profile'     },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans relative pb-20 md:pb-0">
      <WebPattern />
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#34a853]">{profile?.student_id}</p>
            </div>
          </div>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${item.href === '/announcements' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <GE>{item.icon}</GE>
            {item.label}
            {item.badge && (
              <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
            )}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full"
          >
            <GE>🚪</GE> Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden bg-[#0C0E13] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-[10px]">L</div>
          <span className="text-base font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="flex items-center gap-2">
          {unreadMessages > 0 && (
            <Link href="/messages" className="relative">
              <GE size="text-xl">💬</GE>
              <span className="absolute -top-1 -right-1 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>
            </Link>
          )}
          <Link href="/profile" className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-bold">{initials}</Link>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="md:ml-60 p-4 md:p-8 relative z-10">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#202124]">Assignments <GE size="text-xl">📝</GE></h1>
            <p className="text-sm text-gray-400 mt-0.5">Submit your work and track your progress</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full font-medium">{pendingAssignments.length} pending</span>
            <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-medium">{submittedAssignments.length} submitted</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'pending',   label: `Pending (${pendingAssignments.length})`   },
            { key: 'submitted', label: `Submitted (${submittedAssignments.length})` },
            { key: 'all',       label: `All (${assignments.length})`              },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition ${activeTab === t.key ? 'bg-[#4285f4] text-white border-[#4285f4]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#4285f4]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-4">
              <GE size="text-3xl" opacity={0.4}>📝</GE>
            </div>
            <h3 className="text-sm font-semibold text-[#202124] mb-1">No assignments yet</h3>
            <p className="text-xs text-gray-400">Your assessor will upload assignments here when ready.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(activeTab === 'pending' ? pendingAssignments : activeTab === 'submitted' ? submittedAssignments : assignments).map((a) => {
              const latestSub = getLatestSubmission(a.id);
              const attemptCount = getAttemptCount(a.id);
              const attemptsLeft = 3 - attemptCount;
              const dl = deadlineStatus(a.deadline);
              const fileData = uploadedFiles[a.id];
              const allSubs = getSubmissionsFor(a.id);

              return (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#4285f4] transition">

                  {/* Card header stripe */}
                  <div className={`h-1.5 bg-gradient-to-r ${a.course?.banner_from || 'from-[#4285f4]'} ${a.course?.banner_to || 'to-[#34a853]'}`}></div>

                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#f0f2f5] flex items-center justify-center shrink-0">
                          <GE size="text-xl" opacity={0.5}>{a.course?.emoji || '📚'}</GE>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#202124] truncate">{a.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">{a.course?.title}{a.module?.title ? ` · ${a.module.title}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {latestSub && (
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColor(latestSub.status)}`}>
                            {latestSub.status === 'graded' ? '✓ Graded' : latestSub.status === 'submitted' ? '⏳ Under review' : '↩ Resubmit'}
                          </span>
                        )}
                        {dl && <span className={`text-[10px] font-medium ${dl.color}`}>{dl.label}</span>}
                      </div>
                    </div>

                    {a.description && <p className="text-xs text-gray-500 mb-4 leading-relaxed">{a.description}</p>}

                    {a.submission_guide && (
                      <div className="bg-[#e8f0fe] rounded-xl p-3 mb-4">
                        <p className="text-[11px] text-[#1a73e8] font-medium mb-1">📋 Submission guide</p>
                        <p className="text-[11px] text-[#1a73e8]">{a.submission_guide}</p>
                      </div>
                    )}

                    {a.deadline && (
                      <div className="flex items-center gap-2 mb-4">
                        <GE size="text-sm">📅</GE>
                        <p className="text-xs text-gray-500">
                          Deadline: <strong>{new Date(a.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        </p>
                      </div>
                    )}

                    {a.instructions_url && (
                      <a href={a.instructions_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-[#4285f4] hover:underline mb-4">
                        <GE size="text-sm">📥</GE>
                        Download instructions{a.instructions_filename ? ` (${a.instructions_filename})` : ''}
                      </a>
                    )}

                    {/* Attempts indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      <GE size="text-sm">🔄</GE>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(n => (
                          <div key={n} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${n <= attemptCount ? 'bg-[#4285f4] border-[#4285f4] text-white' : 'border-gray-200 text-gray-300'}`}>{n}</div>
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">{attemptsLeft > 0 ? `${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining` : 'No attempts remaining'}</span>
                    </div>

                    {/* Grade/feedback */}
                    {latestSub?.status === 'graded' && (
                      <div className="bg-[#e6f4ea] rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <GE size="text-sm">🏆</GE>
                            <p className="text-xs font-semibold text-[#137333]">Grade: {latestSub.grade}</p>
                          </div>
                          <Link
                            href={`/assignments/feedback?submission_id=${latestSub.id}`}
                            className="text-[10px] px-3 py-1.5 rounded-lg bg-[#34a853] text-white font-medium hover:opacity-90 transition shrink-0"
                          >
                            View full feedback →
                          </Link>
                        </div>
                        {latestSub.feedback && (
                          <p className="text-xs text-[#137333] line-clamp-2">💬 {latestSub.feedback}</p>
                        )}
                      </div>
                    )}

                    {/* View submitted file */}
                    {latestSub?.status === 'submitted' && latestSub?.file_url && (
                      <div className="bg-[#f8f9fa] rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <GE size="text-sm">📄</GE>
                          <p className="text-xs text-gray-500">Submission uploaded — awaiting review</p>
                        </div>
                        <a
                          href={latestSub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-3 py-1.5 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#e8f0fe] transition shrink-0"
                        >
                          View file
                        </a>
                      </div>
                    )}

                    {/* Submission history */}
                    {allSubs.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Submission history</p>
                        <div className="flex flex-col gap-2">
                          {allSubs.map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between bg-[#f8f9fa] rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <GE size="text-sm">📄</GE>
                                <div>
                                  <p className="text-[11px] font-medium text-[#202124]">Attempt {allSubs.length - i}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(s.submitted_at).toLocaleDateString('en-GB')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(s.status)}`}>{s.status}</span>
                                {s.file_url && (
                                  <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#4285f4] hover:underline">View</a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit section */}
                    {attemptsLeft > 0 && latestSub?.status !== 'graded' && (
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <p className="text-xs font-medium text-[#202124] mb-3">
                          {attemptCount === 0 ? 'Submit your assignment' : 'Resubmit your assignment'}
                        </p>
                        <textarea
                          rows={2}
                          placeholder="Add a note to your assessor (optional)..."
                          value={notes[a.id] || ''}
                          onChange={e => setNotes(prev => ({ ...prev, [a.id]: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-xs text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] transition resize-none mb-3"
                        />
                        <div className={`border-2 border-dashed rounded-xl p-4 text-center transition mb-3 ${fileData ? 'border-[#34a853] bg-[#e6f4ea]' : 'border-gray-200 bg-[#f8f9fa]'}`}>
                          {fileData ? (
                            <div>
                              <GE size="text-2xl">✅</GE>
                              <p className="text-xs font-medium text-[#137333] mt-1">{fileData.name}</p>
                              <button
                                onClick={() => setUploadedFiles(prev => { const n = { ...prev }; delete n[a.id]; return n; })}
                                className="text-[10px] text-[#ea4335] hover:underline mt-1"
                              >Remove</button>
                            </div>
                          ) : uploading === a.id ? (
                            <div>
                              <div className="w-6 h-6 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                              <p className="text-xs text-gray-400">Uploading...</p>
                            </div>
                          ) : (
                            <div>
                              <GE size="text-2xl">📤</GE>
                              <p className="text-xs text-gray-500 mt-1 mb-2">Upload your work (PDF, DOC, DOCX, ZIP — max 20MB)</p>
                              <label className="px-4 py-2 rounded-lg bg-[#4285f4] text-white text-xs font-medium cursor-pointer hover:opacity-90 transition">
                                Choose file
                                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" onChange={e => handleUpload(e, a.id)} className="hidden" />
                              </label>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleSubmit(a.id)}
                          disabled={!fileData || submitting === a.id}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting === a.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Submitting...
                            </span>
                          ) : attemptCount === 0 ? 'Submit assignment' : `Resubmit (attempt ${attemptCount + 1} of 3)`}
                        </button>
                      </div>
                    )}

                    {/* Max attempts reached */}
                    {attemptsLeft === 0 && latestSub?.status !== 'graded' && (
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <div className="bg-[#fff8e1] rounded-xl p-4 flex items-start gap-3">
                          <GE size="text-xl">⚠️</GE>
                          <div>
                            <p className="text-xs font-semibold text-[#f9a825] mb-1">Maximum attempts reached</p>
                            <p className="text-xs text-gray-500 mb-3">You have used all 3 submission attempts. Please contact your assessor.</p>
                            <Link href="/messages" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4285f4] text-white text-xs font-medium hover:opacity-90 transition">
                              <GE size="text-xs">💬</GE> Contact assessor
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 flex items-center justify-around px-4 py-2 z-40">
        {[
          { href: '/dashboard',           icon: '📊', label: 'Home'     },
          { href: `/courses/${courseId}`, icon: '📚', label: 'Courses'  },
          { href: '/announcements',       icon: '🔔', label: 'Alerts'    },
          { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages },
          { href: '/profile',             icon: '👤', label: 'Profile'  },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${item.href === '/announcements' ? 'text-[#4285f4]' : 'text-gray-500'}`}
          >
            <span className="text-xl" style={{ filter: 'grayscale(1)', opacity: 0.6 }}>{item.icon}</span>
            <span className="text-[9px]">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}