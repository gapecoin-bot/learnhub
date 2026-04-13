import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen font-sans">

      {/* Sidebar — hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex w-56 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>

        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Main</p>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-white/10 text-sm">🏠 Dashboard</Link>
        <Link href="/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">📚 My Courses</Link>
        <Link href="/browse" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">🔍 Browse Courses</Link>
        <Link href="/assignments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">📝 Assignments</Link>

        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mt-4 mb-1">Account</p>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">👤 Profile</Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">⚙️ Settings</Link>

        <div className="mt-auto bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-2">Storage used</p>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[62%] bg-gradient-to-r from-[#4285f4] to-[#34a853] rounded-full"></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">620 MB of 1 GB</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 z-50 flex items-center justify-around px-2 py-3">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-white">
          <span className="text-lg">🏠</span>
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">📚</span>
          <span className="text-[10px]">Courses</span>
        </Link>
        <Link href="/assignments" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">📝</span>
          <span className="text-[10px]">Assignments</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">👤</span>
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-56 bg-[#f0f2f5] p-4 md:p-8 pb-24 md:pb-8">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-medium">LW</div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Good morning,</p>
            <h2 className="text-xl font-semibold text-[#202124]">Welcome back, Lycurgus 👋</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#202124]">Lycurgus Wainaina</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-sm font-medium">LW</div>
          </div>
        </div>

        {/* Mobile greeting */}
        <div className="md:hidden mb-6">
          <p className="text-sm text-gray-400">Good morning,</p>
          <h2 className="text-lg font-semibold text-[#202124]">Welcome back, Lycurgus 👋</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {[
            { label: 'Enrolled courses', value: '6', change: '+2 this month', color: 'text-[#4285f4]', cc: 'text-[#34a853]' },
            { label: 'Completed', value: '3', change: '50% completion', color: 'text-[#34a853]', cc: 'text-[#34a853]' },
            { label: 'Assignments due', value: '2', change: 'This week', color: 'text-[#ea4335]', cc: 'text-[#ea4335]' },
            { label: 'Certificates', value: '3', change: 'Earned so far', color: 'text-[#fbbc04]', cc: 'text-[#34a853]' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 md:p-4 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl md:text-2xl font-semibold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${s.cc}`}>{s.change}</p>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <h3 className="text-sm font-semibold text-[#202124] mb-3">Continue learning</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 md:mb-8">
          {[
            { id: 1, title: 'Level 3 Diploma in Health and Social Care', meta: '12 modules · 6 assignments', progress: 72, banner: 'from-[#e8f0fe] to-[#d2e3fc]', badge: 'Health & Social Care', bc: 'bg-[#e6f4ea] text-[#137333]', bar: 'from-[#4285f4] to-[#34a853]', emoji: '📋' },
            { id: 2, title: 'Level 5 Diploma in Business Management', meta: '10 modules · 5 assignments', progress: 40, banner: 'from-[#fce8e6] to-[#fad2cf]', badge: 'Business', bc: 'bg-[#e8f0fe] text-[#1a73e8]', bar: 'from-[#ea4335] to-[#fbbc04]', emoji: '💼' },
            { id: 3, title: 'Qualifi Cyber Security Level 4', meta: '8 modules · 4 assignments', progress: 15, banner: 'from-[#e6f4ea] to-[#ceead6]', badge: 'Technology', bc: 'bg-[#fce8e6] text-[#c5221f]', bar: 'from-[#34a853] to-[#4285f4]', emoji: '🛡️' },
          ].map((c) => (
            <Link href={`/courses/${c.id}`} key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#4285f4] transition cursor-pointer block">
              <div className={`h-16 md:h-20 bg-gradient-to-br ${c.banner} flex items-center justify-center text-2xl md:text-3xl`}>{c.emoji}</div>
              <div className="p-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.bc} mb-2 inline-block`}>{c.badge}</span>
                <p className="text-xs font-medium text-[#202124] mb-1 leading-snug">{c.title}</p>
                <p className="text-[11px] text-gray-400 mb-2">{c.meta}</p>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${c.bar} rounded-full`} style={{ width: `${c.progress}%` }}></div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{c.progress}% complete</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#202124] mb-3">Announcements</h3>
            {[
              { dot: 'bg-[#4285f4]', text: 'New Level 7 Executive PA Diploma now available', time: '2 hours ago' },
              { dot: 'bg-[#34a853]', text: 'Maintenance window this Sunday 2–4am GMT', time: '1 day ago' },
              { dot: 'bg-[#fbbc04]', text: 'OTHM Level 7 Risk Management now enrolling', time: '3 days ago' },
            ].map((a) => (
              <div key={a.text} className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span className={`w-2 h-2 rounded-full ${a.dot} mt-1 shrink-0`}></span>
                <div>
                  <p className="text-xs text-[#202124]">{a.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#202124] mb-3">Upcoming assignments</h3>
            {[
              { title: 'Unit 3 – Care Planning Essay', course: 'Health & Social Care L3', due: 'Due in 2 days', urgent: true },
              { title: 'Strategic Analysis Report', course: 'Business Management L5', due: 'Due in 8 days', urgent: false },
              { title: 'Network Security Assessment', course: 'Cyber Security L4', due: 'Due in 14 days', urgent: false },
            ].map((a) => (
              <div key={a.title} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#202124] truncate">{a.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{a.course}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${a.urgent ? 'bg-[#fce8e6] text-[#c5221f]' : 'bg-[#e6f4ea] text-[#137333]'}`}>{a.due}</span>
                  <Link href="/assignments/submit" className="text-[11px] px-2.5 py-1 rounded-md border border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white transition">Submit</Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}