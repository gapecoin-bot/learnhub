'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';
import WebPattern from '@/app/components/WebPattern';

const GE = ({ children, size = 'text-base', opacity = 0.6 }) => (
  <span style={{ filter: 'grayscale(1)', opacity }} className={`${size} shrink-0`}>{children}</span>
);

export default function Dashboard() {
  const [profile,        setProfile]        = useState(null);
  const [enrolments,     setEnrolments]     = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [courseId,       setCourseId]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData || profileData.role !== 'student') { router.push('/login'); return; }
      setProfile(profileData);

      // ── Enrolments with fresh progress ──
      const { data: enrolData } = await supabase
        .from('enrolments')
        .select('id, course_id, progress, enrolled_at, is_active, course:courses(id, title, emoji, banner_from, banner_to, badge_bg, badge_text, category, level, awarding_body)')
        .eq('student_id', session.user.id)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false });

      // ── Recalculate progress from module_progress for accuracy ──
      const enriched = await Promise.all((enrolData || []).map(async (e) => {
        const { data: mods } = await supabase.from('course_modules').select('id').eq('course_id', e.course_id);
        const { data: assigns } = await supabase.from('assignments').select('id, module_id').eq('course_id', e.course_id).not('instructions_url', 'is', null);
        const { data: mats } = await supabase.from('course_materials').select('id, module_id').eq('course_id', e.course_id);
        const { data: subs } = await supabase.from('submissions').select('assignment_id').eq('student_id', session.user.id);
        const { data: modProgress } = await supabase.from('module_progress').select('module_id, completed').eq('student_id', session.user.id);
        const modProgressMap = {};
        (modProgress || []).forEach(mp => { modProgressMap[mp.module_id] = mp; });
        const subAssignIds = (subs || []).map(s => s.assignment_id);
        if (!mods?.length) return { ...e, progress: 0 };
        const unitShare = 100 / mods.length;
        let total = 0;
        (mods || []).forEach(mod => {
          const dbRow = modProgressMap[mod.id];
          const viewed = !!dbRow;
          const hasSubmission = (assigns || []).filter(a => a.module_id === mod.id).some(a => subAssignIds.includes(a.id));
          const submitted = hasSubmission || dbRow?.completed === true;
          const hasContent = (mats || []).some(m => m.module_id === mod.id);
          const hasAssignment = (assigns || []).some(a => a.module_id === mod.id);
          if (!hasContent && !hasAssignment) { if (viewed) total += unitShare; }
          else if (!hasAssignment) { if (viewed) total += unitShare; }
          else if (!hasContent) { if (submitted) total += unitShare; }
          else { if (viewed) total += unitShare * 0.5; if (submitted) total += unitShare * 0.5; }
        });
        const freshProgress = Math.min(100, Math.round(total));
        // Save fresh value back to DB
        await supabase.from('enrolments').update({ progress: freshProgress }).eq('id', e.id);
        return { ...e, progress: freshProgress };
      }));
      setEnrolments(enriched);

      // ── Course ID for nav ──
      if (enriched?.length > 0) setCourseId(enriched[0].course_id);

      // ── Announcements ──
      const earliest = (enrolData || []).reduce((e, row) =>
        !e || new Date(row.enrolled_at) < new Date(e) ? row.enrolled_at : e, null);
      let q = supabase.from('announcements').select('*')
        .order('created_at', { ascending: false }).limit(4);
      if (earliest) q = q.gte('created_at', earliest);
      const { data: announcementData } = await q;
      setAnnouncements(announcementData || []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();

  const navItems = [
    { href: '/dashboard',           icon: '📊', label: 'Dashboard'     },
    { href: `/courses/${courseId}`, icon: '📚', label: 'My Courses'    },
    { href: '/announcements',       icon: '🔔', label: 'Announcements' },
    { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages > 0 ? unreadMessages : null },
    { href: '/resources',           icon: '📁', label: 'Resources'     },
    { href: '/profile',             icon: '👤', label: 'Profile'       },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans relative pb-20 md:pb-0">
      <WebPattern />
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto border-r border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs shrink-0">LA</div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[10px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">{profile?.student_id}</p>
            </div>
          </div>
        </div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${item.href === '/dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <span className="text-base shrink-0" style={{ filter: 'grayscale(1)', opacity: item.href === '/dashboard' ? 1 : 0.6 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-all w-full">
            <span className="text-base shrink-0" style={{ filter: 'grayscale(1)', opacity: 0.6 }}>🚪</span>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden bg-[#0C0E13] px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-[10px]">LA</div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[9px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {unreadMessages > 0 && (
            <Link href="/messages" className="relative">
              <span className="text-xl" style={{ filter: 'grayscale(1)', opacity: 0.7 }}>💬</span>
              <span className="absolute -top-1 -right-1 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>
            </Link>
          )}
          <Link href="/profile" className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</Link>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="md:ml-60 p-4 md:p-8 relative z-10">

        {/* Welcome */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h1 className="text-xl font-semibold text-[#202124]">{profile?.first_name} {profile?.last_name} 👋</h1>
            <p className="text-xs text-[#F5A623]/80 mt-0.5 font-mono">{profile?.student_id}</p>
          </div>
          <Link href="/browse"
            className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-semibold hover:opacity-90 transition">
            Browse courses
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Enrolled courses', value: enrolments.length,    icon: '📚', color: 'text-[#F5A623]'  },
            { label: 'Announcements',    value: announcements.length, icon: '🔔', color: 'text-[#F5A623]'  },
            { label: 'Unread messages',  value: unreadMessages,       icon: '💬', color: 'text-[#F5A623]'  },
            { label: 'School ID', value: profile?.student_id || '—',  icon: '🎓', color: 'text-[#F5A623]', small: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-[#F5A623]/20 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <GE size="text-lg">{s.icon}</GE>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
              <p className={`${s.small ? 'text-sm font-mono' : 'text-2xl'} font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Your Course */}
          <div className="bg-white rounded-2xl border border-[#F5A623]/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#202124]">Your Course</h2>
            </div>
            {enrolments.length === 0 ? (
              <div className="text-center py-8">
                <GE size="text-3xl" opacity={0.4}>📚</GE>
                <p className="text-xs text-gray-400 mt-2 mb-3">No courses yet</p>
                <Link href="/browse" className="text-xs text-[#F5A623] hover:underline">Browse courses</Link>
              </div>
            ) : enrolments.slice(0, 1).map((e) => (
              <Link key={e.id} href={`/courses/${e.course_id}`}
                className="flex items-center gap-3 py-3 hover:bg-[#FFF8E7] rounded-lg px-2 -mx-2 transition">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${e.course?.banner_from || 'from-[#FFF8E7]'} ${e.course?.banner_to || 'to-[#FFF3E0]'} flex items-center justify-center shrink-0`}>
                  <span style={{ filter: 'grayscale(1)', opacity: 0.7 }} className="text-xl">{e.course?.emoji || '📚'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#202124] truncate">{e.course?.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#F5A623] h-1.5 rounded-full transition-all" style={{ width: `${e.progress || 0}%` }}></div>
                    </div>
                    <span className="text-[10px] text-[#F5A623] font-medium shrink-0">{e.progress || 0}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl border border-[#F5A623]/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#202124]">Announcements</h2>
              {announcements.length > 3 && (
                <Link href="/announcements" className="text-xs text-[#F5A623] hover:underline">View all</Link>
              )}
            </div>
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <GE size="text-3xl" opacity={0.4}>🔔</GE>
                <p className="text-xs text-gray-400 mt-2">No announcements yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#FFF8E7] border border-[#F5A623]/20">
                    <div className="w-8 h-8 rounded-xl bg-[#F5A623]/20 flex items-center justify-center shrink-0">
                      <GE size="text-sm">📢</GE>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#202124]">{a.title}</p>
                      {a.body && a.body !== a.title && (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{a.body}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Quick Access</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/announcements', icon: '🔔', label: 'Announcements', color: 'bg-[#F5A623]/40' },
              { href: '/messages',      icon: '💬', label: 'Messages',      color: 'bg-[#F5A623]/30', badge: unreadMessages },
              { href: '/resources',     icon: '📁', label: 'Resources',     color: 'bg-[#F5A623]/20' },
              { href: '/profile',       icon: '👤', label: 'My Profile',    color: 'bg-[#F5A623]/15' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="bg-white rounded-xl border border-[#F5A623]/20 p-4 hover:border-[#F5A623] hover:bg-[#FFF8E7] transition flex flex-col items-center gap-2 text-center relative shadow-sm">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                  <GE size="text-xl" opacity={0.7}>{item.icon}</GE>
                </div>
                <p className="text-xs font-medium text-[#202124]">{item.label}</p>
                {item.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 flex items-center justify-around px-4 py-2 z-40">
        {[
          { href: '/dashboard',           icon: '📊', label: 'Home'    },
          { href: `/courses/${courseId}`, icon: '📚', label: 'Courses' },
          { href: '/announcements',       icon: '🔔', label: 'Alerts'  },
          { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages },
          { href: '/profile',             icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${item.href === '/dashboard' ? 'text-[#F5A623]' : 'text-gray-500'}`}>
            <span className="text-xl" style={{ filter: item.href !== '/dashboard' ? 'grayscale(1)' : 'none', opacity: item.href !== '/dashboard' ? 0.6 : 1 }}>{item.icon}</span>
            <span className="text-[9px]">{item.label}</span>
            {item.badge > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}