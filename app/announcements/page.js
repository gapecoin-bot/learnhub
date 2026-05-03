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

export default function AnnouncementsPage() {
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData || profileData.role !== 'student') { router.push('/login'); return; }
      setProfile(profileData);

      // ── Active enrolment ──
      const { data: enrolment } = await supabase
        .from('enrolments')
        .select('course_id, enrolled_at')
        .eq('student_id', session.user.id)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (enrolment?.course_id) setCourseId(enrolment.course_id);

      // ── Fetch published announcements from enrolled_at onwards ──
      let q = supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (enrolment?.enrolled_at) {
        q = q.gte('created_at', enrolment.enrolled_at);
      }
      const { data: announcementData } = await q;
      const announcements = announcementData || [];
      setAnnouncements(announcements);

      // ── Fetch which ones this student has already read ──
      if (announcements.length > 0) {
        const announcementIds = announcements.map(a => a.id);
        const { data: reads } = await supabase
          .from('announcement_reads')
          .select('announcement_id')
          .eq('student_id', session.user.id)
          .in('announcement_id', announcementIds);
        const readSet = new Set((reads || []).map(r => r.announcement_id));
        setReadIds(readSet);
        setUnreadCount(announcements.length - readSet.size);

        // ── Mark all as read after a short delay ──
        setTimeout(async () => {
          const unread = announcements.filter(a => !readSet.has(a.id));
          if (unread.length > 0) {
            await supabase.from('announcement_reads').upsert(
              unread.map(a => ({
                announcement_id: a.id,
                student_id: session.user.id,
              })),
              { onConflict: 'announcement_id,student_id' }
            );
            setReadIds(new Set(announcements.map(a => a.id)));
            setUnreadCount(0);
          }
        }, 2000);
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

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '';

  const navItems = [
    { href: '/dashboard',           icon: '📊', label: 'Dashboard'     },
    { href: `/courses/${courseId}`, icon: '📚', label: 'My Courses'    },
    { href: '/announcements',       icon: '🔔', label: 'Announcements', badge: unreadCount > 0 ? unreadCount : null },
    { href: '/messages',            icon: '💬', label: 'Messages',      badge: unreadMessages > 0 ? unreadMessages : null },
    { href: '/resources',           icon: '📁', label: 'Resources'     },
    { href: '/profile',             icon: '👤', label: 'Profile'       },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return '🎓';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans relative pb-20 md:pb-0">
      <WebPattern />
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
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${item.href === '/announcements' ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
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
        <div className="flex items-center gap-2">
          {unreadMessages > 0 && (
            <Link href="/messages" className="relative">
              <GE size="text-xl">💬</GE>
              <span className="absolute -top-1 -right-1 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>
            </Link>
          )}
          <Link href="/profile" className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</Link>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="md:ml-60 p-4 md:p-8 relative z-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#202124]">Announcements</h1>
            <p className="text-sm text-gray-400 mt-0.5">Updates from your admin and assessors</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="text-xs bg-[#fce8e6] text-[#c5221f] border border-[#ea4335]/20 px-3 py-1 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
            <span className="text-xs bg-[#FFF8E7] text-[#B8780A] border border-[#F5A623]/30 px-3 py-1 rounded-full font-medium">
              {announcements.length} total
            </span>
          </div>
        </div>

        {/* ── Empty state ── */}
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-4">
              <GE size="text-3xl" opacity={0.5}>🔔</GE>
            </div>
            <h3 className="text-sm font-semibold text-[#202124] mb-1">No announcements yet</h3>
            <p className="text-xs text-gray-400">Your admin and assessors will post updates here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a) => {
              const isUnread = !readIds.has(a.id);
              const isNew = (new Date() - new Date(a.created_at)) < 3 * 24 * 60 * 60 * 1000;
              return (
                <div
                  key={a.id}
                  className={`bg-white rounded-2xl border transition p-5 ${isUnread ? 'border-[#F5A623]/50 shadow-sm' : 'border-gray-200 hover:border-[#F5A623]/40'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${a.type === 'course' ? 'bg-[#e6f4ea]' : a.type === 'system' ? 'bg-[#fce8e6]' : 'bg-[#FFF8E7]'}`}>
                      <span className="text-xl">{getTypeIcon(a.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#202124]">{a.title}</p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#F5A623] shrink-0"></span>
                          )}
                          {isNew && (
                            <span className="text-[10px] bg-[#F5A623] text-[#0C0E13] px-2 py-0.5 rounded-full font-semibold">New</span>
                          )}
                          {a.type && a.type !== 'general' && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.type === 'course' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                              {a.type}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(a.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                      {a.body && a.body !== a.title && (
                        <p className="text-sm text-gray-500 leading-relaxed">{a.body}</p>
                      )}
                    </div>
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
          { href: '/dashboard',           icon: '📊', label: 'Home'    },
          { href: `/courses/${courseId}`, icon: '📚', label: 'Courses' },
          { href: '/announcements',       icon: '🔔', label: 'Alerts',  badge: unreadCount },
          { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages },
          { href: '/profile',             icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${item.href === '/announcements' ? 'text-[#F5A623]' : 'text-gray-500'}`}>
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