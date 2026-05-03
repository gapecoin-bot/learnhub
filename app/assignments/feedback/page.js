'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';

// ─── GRAY EMOJI WRAPPER ───────────────────────────────────────────────────────
const GE = ({ children, size = 'text-base', opacity = 0.6 }) => (
  <span style={{ filter: 'grayscale(1)', opacity }} className={`${size} shrink-0`}>
    {children}
  </span>
);

function FeedbackContent() {
  const [profile, setProfile] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [nextAssignment, setNextAssignment] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submission_id');

  useEffect(() => {
    const init = async () => {
      // ── Auth ──
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData || profileData.role !== 'student') { router.push('/login'); return; }
      setProfile(profileData);

      // ── Active enrolment for nav ──
      const { data: enrolment } = await supabase
        .from('enrolments')
        .select('course_id')
        .eq('student_id', session.user.id)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (enrolment?.course_id) setCourseId(enrolment.course_id);

      // ── Unread messages ──
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', session.user.id)
        .eq('is_read', false);
      setUnreadMessages(count || 0);

      // ── Validate submission_id ──
      if (!submissionId) {
        setError('No submission specified. Please go back to your assignments.');
        setLoading(false);
        return;
      }

      // ── Fetch submission — only own, only graded ──
      const { data: subData, error: subErr } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .eq('student_id', session.user.id)
        .single();

      if (subErr || !subData) {
        setError('Submission not found or you do not have access to it.');
        setLoading(false);
        return;
      }

      if (subData.status !== 'graded') {
        setError('This submission has not been graded yet. Check back later.');
        setLoading(false);
        return;
      }

      setSubmission(subData);

      // ── Fetch assignment + course ──
      const { data: assignData } = await supabase
        .from('assignments')
        .select(`
          *,
          module:course_modules(id, title, order_number, is_locked),
          course:courses(id, title, emoji, awarding_body, level, banner_from, banner_to, badge_bg, badge_text)
        `)
        .eq('id', subData.assignment_id)
        .single();

      if (assignData) {
        setAssignment(assignData);
        setCourse(assignData.course);

        // ── Find next unlocked assignment ──
        // Look for assignments in the same course with a higher module order_number
        // that are unlocked and have instructions uploaded
        const { data: nextAssignments } = await supabase
          .from('assignments')
          .select(`
            id, title,
            module:course_modules(id, title, order_number, is_locked)
          `)
          .eq('course_id', assignData.course.id)
          .not('instructions_url', 'is', null)
          .neq('id', subData.assignment_id);

        if (nextAssignments?.length > 0) {
          // Filter to only unlocked modules with higher order number
          const currentOrder = assignData.module?.order_number || 0;
          const next = nextAssignments
            .filter(a => !a.module?.is_locked && (a.module?.order_number || 0) > currentOrder)
            .sort((a, b) => (a.module?.order_number || 0) - (b.module?.order_number || 0))[0];
          if (next) setNextAssignment(next);
        }
      }

      setLoading(false);
    };
    init();
  }, [submissionId]);

  // ── Grade helpers ──
  const getPassFail = (grade) => {
    if (!grade) return null;
    const lower = grade.toLowerCase();
    if (lower === 'fail') return { label: 'Fail', color: 'text-[#ea4335]', bg: 'bg-[#fce8e6]' };
    if (['distinction', 'merit', 'pass'].includes(lower)) return { label: grade, color: 'text-[#137333]', bg: 'bg-[#e6f4ea]' };
    const num = parseInt(grade);
    if (!isNaN(num)) {
      if (num >= 50) return { label: 'Pass', color: 'text-[#137333]', bg: 'bg-[#e6f4ea]' };
      return { label: 'Fail', color: 'text-[#ea4335]', bg: 'bg-[#fce8e6]' };
    }
    return { label: grade, color: 'text-[#137333]', bg: 'bg-[#e6f4ea]' };
  };

  const getScorePercent = (grade) => {
    if (!grade) return 0;
    const num = parseInt(grade);
    if (!isNaN(num)) return Math.min(100, num);
    const lower = grade.toLowerCase();
    if (lower === 'distinction') return 90;
    if (lower === 'merit') return 75;
    if (lower === 'pass') return 60;
    if (lower === 'fail') return 25;
    return 0;
  };

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '';

  const navItems = [
    { href: '/dashboard',           icon: '📊', label: 'Dashboard'      },
    { href: `/courses/${courseId}`, icon: '📚', label: 'My Courses'     },
    { href: '/announcements',       icon: '🔔', label: 'Announcements'  },
    { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages > 0 ? unreadMessages : null },
    { href: '/resources',           icon: '📁', label: 'Resources'      },
    { href: '/profile',             icon: '👤', label: 'Profile'        },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex min-h-screen font-sans bg-[#f0f2f5]">
        <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40">
          <Link href="/" className="flex items-center gap-2 mb-6 px-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
          </Link>
        </aside>
        <main className="flex-1 md:ml-60 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md w-full">
            <GE size="text-4xl" opacity={0.4}>⚠️</GE>
            <h3 className="text-sm font-semibold text-[#202124] mt-4 mb-2">Unable to load feedback</h3>
            <p className="text-xs text-gray-400 mb-5">{error}</p>
            <Link href="/assignments" className="inline-block px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
              Back to assignments
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const passFail = getPassFail(submission?.grade);
  const scorePercent = getScorePercent(submission?.grade);

  return (
    <div className="flex min-h-screen font-sans bg-[#f0f2f5]">
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/dashboard" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs">LA</div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[10px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">{profile?.student_id}</p>
            </div>
          </div>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${item.href === '/announcements' ? 'text-[#F5A623] bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-[10px]">LA</div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[9px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <Link href="/profile" className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</Link>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-60 bg-[#f0f2f5] p-4 md:p-8 pb-24 md:pb-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 md:mb-6">
          <Link href="/assignments" className="hover:text-[#4285f4] transition">Assignments</Link>
          <span>›</span>
          <span className="text-[#202124] truncate">{assignment?.title}</span>
        </div>

        {/* Desktop title */}
        <div className="hidden md:flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-sm text-gray-400">Assignment feedback</p>
            <h2 className="text-xl font-semibold text-[#202124]">{assignment?.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#202124]">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-gray-400">Student · {profile?.student_id}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-sm font-medium">{initials}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* ── Left: main feedback ── */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Grade card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  {course && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.badge_bg || 'bg-[#e8f0fe]'} ${course.badge_text || 'text-[#1a73e8]'} mb-2 inline-block`}>
                      {course.title}
                    </span>
                  )}
                  <h3 className="text-base md:text-lg font-semibold text-[#202124]">{assignment?.title}</h3>
                  {assignment?.module && (
                    <p className="text-xs text-gray-400 mt-0.5">Unit {assignment.module.order_number} · {assignment.module.title}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {submission?.submitted_at && (
                      <p className="text-xs text-gray-400">
                        Submitted {new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    {submission?.graded_at && (
                      <p className="text-xs text-gray-400">
                        · Graded {new Date(submission.graded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-3xl md:text-4xl font-bold mb-1 text-[#137333]">
                    {submission?.grade}
                  </div>
                  {passFail && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${passFail.bg} ${passFail.color}`}>
                      {passFail.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Grade bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scorePercent >= 50 ? 'bg-[#F5A623]' : 'bg-[#ea4335]'}`}
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0%</span>
                <span>Pass mark: 50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Feedback */}
            {submission?.feedback ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
                <h3 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                  <GE size="text-base">💬</GE> Assessor feedback
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <GE size="text-3xl" opacity={0.3}>💬</GE>
                <p className="text-xs text-gray-400 mt-2">No written feedback was provided for this submission.</p>
              </div>
            )}

            {/* Student notes (what they submitted with) */}
            {submission?.notes && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
                <h3 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                  <GE size="text-base">📝</GE> Your submission notes
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{submission.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/assignments"
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition text-center"
              >
                ← Back to assignments
              </Link>
              {submission?.file_url && (
                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-lg border border-[#4285f4] text-[#4285f4] text-sm font-medium hover:bg-[#e8f0fe] transition text-center"
                >
                  <GE size="text-sm">📄</GE> View your submission
                </a>
              )}
              <Link
                href={`/courses/${courseId}`}
                className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-semibold hover:opacity-90 transition text-center"
              >
                Continue course →
              </Link>
            </div>
          </div>

          {/* ── Right: details panel ── */}
          <div className="flex flex-col gap-4">

            {/* Submission details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                <GE size="text-sm">📋</GE> Submission details
              </h3>
              <div className="flex flex-col gap-0">
                {[
                  { label: 'Assignment', value: assignment?.title },
                  { label: 'Course', value: course?.title },
                  { label: 'Unit', value: assignment?.module ? `Unit ${assignment.module.order_number} · ${assignment.module.title}` : '—' },
                  { label: 'Submitted', value: submission?.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Graded', value: submission?.graded_at ? new Date(submission.graded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Final grade', value: submission?.grade || '—' },
                  { label: 'Result', value: passFail?.label || '—', color: passFail?.color },
                ].map((d) => (
                  <div key={d.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0 gap-2">
                    <span className="text-xs text-gray-400 shrink-0">{d.label}</span>
                    <span className={`text-xs font-medium text-right ${d.color || 'text-[#202124]'}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graded by — anonymous by default */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                <GE size="text-sm">👨‍🏫</GE> Graded by
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#f0f2f5] flex items-center justify-center shrink-0">
                  <GE size="text-xl" opacity={0.4}>👤</GE>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#202124]">Your Assessor</p>
                  <p className="text-xs text-gray-400">Course Assessor</p>
                </div>
              </div>
              <Link
                href="/messages"
                className="block w-full py-2 text-center rounded-lg border border-[#F5A623]/40 text-[#B8780A] text-xs hover:bg-[#FFF8E7] transition"
              >
                <GE size="text-xs">💬</GE> Message assessor
              </Link>
            </div>

            {/* Next assignment — only if unlocked */}
            {nextAssignment ? (
              <div className="bg-[#e8f0fe] rounded-2xl border border-[#4285f4]/20 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-[#202124] mb-1 flex items-center gap-2">
                  <GE size="text-sm">🔓</GE> Next up
                </h3>
                <p className="text-xs text-gray-500 mb-1">Your next assignment is available:</p>
                <p className="text-xs font-medium text-[#202124] mb-3">
                  Unit {nextAssignment.module?.order_number} · {nextAssignment.title}
                </p>
                <Link
                  href="/assignments"
                  className="block w-full py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-semibold text-center hover:opacity-90 transition"
                >
                  View next assignment →
                </Link>
              </div>
            ) : (
              <div className="bg-[#f8f9fa] rounded-2xl border border-gray-200 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-[#202124] mb-1 flex items-center gap-2">
                  <GE size="text-sm">⏳</GE> Next unit
                </h3>
                <p className="text-xs text-gray-400">Your next unit will appear here once your assessor unlocks it.</p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 flex items-center justify-around px-4 py-2 z-40">
        {[
          { href: '/dashboard',           icon: '📊', label: 'Home'     },
          { href: `/courses/${courseId}`, icon: '📚', label: 'Courses'  },
          { href: '/announcements',       icon: '🔔', label: 'Alerts'   },
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

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}