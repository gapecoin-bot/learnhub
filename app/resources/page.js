'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';

const GE = ({ children, size = 'text-base', opacity = 0.6 }) => (
  <span style={{ filter: 'grayscale(1)', opacity }} className={`${size} shrink-0`}>{children}</span>
);

export default function ResourcesPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [courseId, setCourseId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData) { router.push('/login'); return; }
      setProfile(profileData);

      const { data: enrolments } = await supabase
        .from('enrolments')
        .select('course_id')
        .eq('student_id', session.user.id)
        .eq('is_active', true);
      const courseIds = (enrolments || []).map(e => e.course_id);
      if (courseIds.length > 0) setCourseId(courseIds[0]);

      if (courseIds.length > 0) {
        const { data: mats } = await supabase
          .from('course_materials')
          .select('*, course:courses(id, title, emoji)')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false });
        setMaterials(mats || []);
      }

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

  const fileIcon = (type) => {
    if (!type) return '📄';
    if (type === 'pdf' || type.includes('pdf')) return '📕';
    if (type.includes('video')) return '🎬';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('doc')) return '📝';
    return '📄';
  };

  const categories = ['All', ...Array.from(new Set(materials.map(m => m.course?.title).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? materials : materials.filter(m => m.course?.title === activeFilter);
  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';

  const navItems = [
    { href: '/dashboard',           icon: '📊', label: 'Dashboard'     },
    { href: `/courses/${courseId}`, icon: '📚', label: 'My Courses'    },
    { href: '/announcements',       icon: '🔔', label: 'Announcements' },
    { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages > 0 ? unreadMessages : null },
    { href: '/resources',           icon: '📁', label: 'Resources'     },
    { href: '/profile',             icon: '👤', label: 'Profile'       },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans pb-20 md:pb-0">
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
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${item.href === '/resources' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <GE>{item.icon}</GE>
            {item.label}
            {item.badge && <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">
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

      <main className="md:ml-60 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#202124]">Resources</h1>
          <p className="text-sm text-gray-400 mt-1">Materials uploaded by your admin and assessors</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${activeFilter === cat ? 'bg-[#F5A623] text-[#0C0E13] border-[#F5A623]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#F5A623]'}`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-4">
              <GE size="text-3xl" opacity={0.5}>📁</GE>
            </div>
            <h3 className="text-sm font-semibold text-[#202124] mb-1">No resources yet</h3>
            <p className="text-xs text-gray-400">Your admin and assessors will upload materials here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => {
              const isPdf = m.file_type === 'pdf' || m.file_type?.includes('pdf');
              return (
                <div key={m.id} className={`bg-white rounded-xl border p-4 transition ${isPdf ? 'border-[#ea4335]/20 hover:border-[#ea4335]/40' : 'border-gray-200 hover:border-[#F5A623]/40'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? 'bg-[#fce8e6]' : 'bg-[#FFF8E7]'}`}>
                      <span style={{ filter: 'none', opacity: 1 }} className="text-xl">{isPdf ? '📕' : fileIcon(m.file_type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isPdf ? 'text-[#c5221f]' : 'text-[#202124]'}`}>{m.title}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <GE size="text-[10px]" opacity={0.5}>📚</GE> {m.course?.title}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {m.file_url && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                      className={`block w-full py-2 text-center rounded-lg text-xs font-medium transition ${isPdf ? 'bg-[#fce8e6] text-[#c5221f] border border-[#ea4335]/30 hover:bg-[#ea4335] hover:text-white' : 'border border-[#F5A623] text-[#B8780A] hover:bg-[#FFF8E7]'}`}>
                      {isPdf ? 'View PDF' : 'Download / View'}
                    </a>
                  )}
                  {m.content_text && !m.file_url && (
                    <p className="text-xs text-gray-500 line-clamp-3 mt-2">{m.content_text}</p>
                  )}
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
          { href: '/announcements',       icon: '🔔', label: 'Alerts'  },
          { href: '/messages',            icon: '💬', label: 'Messages', badge: unreadMessages },
          { href: '/profile',             icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${item.href === '/resources' ? 'text-[#F5A623]' : 'text-gray-500'}`}>
            <span className="text-xl" style={{ filter: 'grayscale(1)', opacity: 0.6 }}>{item.icon}</span>
            <span className="text-[9px]">{item.label}</span>
            {item.badge > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}