import Link from 'next/link';

const courses = [
  { id: 1, title: 'Level 3 Diploma in Health and Social Care', category: 'Health & Social Care', modules: 12, assignments: 6, progress: 72, emoji: '📋', banner: 'from-[#e8f0fe] to-[#d2e3fc]', badge: 'bg-[#e6f4ea] text-[#137333]', bar: 'from-[#4285f4] to-[#34a853]' },
  { id: 2, title: 'Level 5 Diploma in Business Management', category: 'Business', modules: 10, assignments: 5, progress: 40, emoji: '💼', banner: 'from-[#fce8e6] to-[#fad2cf]', badge: 'bg-[#e8f0fe] text-[#1a73e8]', bar: 'from-[#ea4335] to-[#fbbc04]' },
  { id: 3, title: 'Qualifi Cyber Security Level 4', category: 'Technology', modules: 8, assignments: 4, progress: 15, emoji: '🛡️', banner: 'from-[#e6f4ea] to-[#ceead6]', badge: 'bg-[#fce8e6] text-[#c5221f]', bar: 'from-[#34a853] to-[#4285f4]' },
  { id: 4, title: 'Level 7 Diploma in Leadership and Management', category: 'Leadership', modules: 14, assignments: 7, progress: 0, emoji: '🏆', banner: 'from-[#fff8e1] to-[#fff3cd]', badge: 'bg-[#fff8e1] text-[#f9a825]', bar: 'from-[#fbbc04] to-[#ea4335]' },
  { id: 5, title: 'Level 4 Diploma in Project Management', category: 'Project Management', modules: 10, assignments: 5, progress: 60, emoji: '📊', banner: 'from-[#f3e5f5] to-[#e1bee7]', badge: 'bg-[#f3e5f5] text-[#7b1fa2]', bar: 'from-[#4285f4] to-[#ea4335]' },
  { id: 6, title: 'Certificate in Safeguarding Adults', category: 'Health & Social Care', modules: 5, assignments: 2, progress: 100, emoji: '🛡️', banner: 'from-[#e8f5e9] to-[#c8e6c9]', badge: 'bg-[#e6f4ea] text-[#137333]', bar: 'from-[#34a853] to-[#34a853]' },
];

export default function Courses() {
  return (
    <div className="flex min-h-screen font-sans">

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-56 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Main</p>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">🏠 Dashboard</Link>
        <Link href="/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-white/10 text-sm">📚 My Courses</Link>
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
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">🏠</span>
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center gap-1 text-white">
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

      {/* Main */}
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
            <p className="text-sm text-gray-400">Your learning journey</p>
            <h2 className="text-xl font-semibold text-[#202124]">My Courses</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#202124]">Lycurgus Wainaina</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-sm font-medium">LW</div>
          </div>
        </div>

        {/* Mobile page title */}
        <div className="md:hidden mb-4">
          <p className="text-sm text-gray-400">Your learning journey</p>
          <h2 className="text-lg font-semibold text-[#202124]">My Courses</h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['All', 'In Progress', 'Completed', 'Not Started'].map((tab) => (
            <button key={tab} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition whitespace-nowrap ${tab === 'All' ? 'bg-[#4285f4] text-white border-[#4285f4]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#4285f4] hover:text-[#4285f4]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link href={`/courses/${c.id}`} key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#4285f4] transition cursor-pointer block">
              <div className={`h-20 md:h-24 bg-gradient-to-br ${c.banner} flex items-center justify-center text-3xl md:text-4xl`}>{c.emoji}</div>
              <div className="p-3 md:p-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.badge} mb-2 inline-block`}>{c.category}</span>
                <p className="text-sm font-medium text-[#202124] mb-1 leading-snug">{c.title}</p>
                <p className="text-xs text-gray-400 mb-3">{c.modules} modules · {c.assignments} assignments</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className={`h-full bg-gradient-to-r ${c.bar} rounded-full`} style={{ width: `${c.progress}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{c.progress}% complete</p>
                  {c.progress === 100 && <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">✓ Completed</span>}
                  {c.progress === 0 && <span className="text-[10px] bg-[#f0f2f5] text-gray-400 px-2 py-0.5 rounded-full">Not started</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}