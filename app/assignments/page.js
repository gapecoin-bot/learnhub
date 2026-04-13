import Link from 'next/link';

const assignments = [
  {
    id: 1,
    title: 'Unit 1 – Introduction to Care',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    due: 'Submitted 5 days ago',
    status: 'graded',
    emoji: '📋',
    grade: '78%',
  },
  {
    id: 2,
    title: 'Unit 2 – Safeguarding Principles',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    due: 'Submitted 2 days ago',
    status: 'submitted',
    emoji: '📋',
    grade: null,
  },
  {
    id: 3,
    title: 'Unit 3 – Care Planning Essay',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    due: 'Due in 2 days',
    status: 'active',
    urgent: true,
    emoji: '📋',
    grade: null,
  },
  {
    id: 4,
    title: 'Unit 4 – Communication in Care',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    due: 'Unlocks after Unit 3',
    status: 'locked',
    emoji: '📋',
    grade: null,
  },
  {
    id: 5,
    title: 'Unit 5 – Equality and Diversity',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    due: 'Unlocks after Unit 4',
    status: 'locked',
    emoji: '📋',
    grade: null,
  },
  {
    id: 6,
    title: 'Unit 6 – Final Assessment',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    due: 'Unlocks after Unit 5',
    status: 'locked',
    emoji: '📋',
    grade: null,
  },
];

const statusConfig = {
  graded: { label: 'Graded', bg: 'bg-[#e6f4ea]', text: 'text-[#137333]', border: 'border-[#34a853]/30' },
  submitted: { label: 'Awaiting grade', bg: 'bg-[#fff8e1]', text: 'text-[#f9a825]', border: 'border-[#fbbc04]/30' },
  active: { label: 'Active', bg: 'bg-[#fce8e6]', text: 'text-[#c5221f]', border: 'border-[#4285f4]/30' },
  locked: { label: 'Locked', bg: 'bg-[#f0f2f5]', text: 'text-gray-400', border: 'border-gray-100' },
};

export default function Assignments() {
  const active = assignments.find((a) => a.status === 'active');
  const graded = assignments.filter((a) => a.status === 'graded');
  const submitted = assignments.filter((a) => a.status === 'submitted');
  const locked = assignments.filter((a) => a.status === 'locked');

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
        <Link href="/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">📚 My Courses</Link>
        <Link href="/browse" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">🔍 Browse Courses</Link>
        <Link href="/assignments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-white/10 text-sm">📝 Assignments</Link>
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
        <Link href="/courses" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">📚</span>
          <span className="text-[10px]">Courses</span>
        </Link>
        <Link href="/assignments" className="flex flex-col items-center gap-1 text-white">
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
            <p className="text-sm text-gray-400">Track your submissions</p>
            <h2 className="text-xl font-semibold text-[#202124]">Assignments</h2>
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
          <p className="text-sm text-gray-400">Track your submissions</p>
          <h2 className="text-lg font-semibold text-[#202124]">Assignments</h2>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e6f4ea] rounded-xl flex items-center justify-center shrink-0">
              <p className="text-base font-bold text-[#34a853]">{graded.length}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-[#202124]">Graded</p>
              <p className="text-[10px] text-gray-400">completed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#fff8e1] rounded-xl flex items-center justify-center shrink-0">
              <p className="text-base font-bold text-[#f9a825]">{submitted.length}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-[#202124]">Submitted</p>
              <p className="text-[10px] text-gray-400">awaiting grade</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f0f2f5] rounded-xl flex items-center justify-center shrink-0">
              <p className="text-base font-bold text-gray-400">{locked.length}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-[#202124]">Upcoming</p>
              <p className="text-[10px] text-gray-400">locked</p>
            </div>
          </div>
        </div>

        {/* Active assignment — highlighted */}
        {active && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#202124] mb-3">Current Assignment</h3>
            <div className="bg-white rounded-2xl border-2 border-[#4285f4] p-4 md:p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#e8f0fe] rounded-xl flex items-center justify-center text-2xl shrink-0">{active.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-[#fce8e6] text-[#c5221f] px-2 py-0.5 rounded-full font-medium">Active</span>
                      {active.urgent && <span className="text-[10px] bg-[#fce8e6] text-[#c5221f] px-2 py-0.5 rounded-full font-medium">{active.due}</span>}
                    </div>
                    <p className="text-sm md:text-base font-semibold text-[#202124]">{active.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{active.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] text-xs font-medium hover:bg-[#e8f0fe] transition">
                    ⬇ Download Brief
                  </button>
                  <Link href={`/assignments/submit?id=${active.id}&course=${active.courseId}`} className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium text-center hover:opacity-90 transition">
                    ↑ Submit Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All assignments timeline */}
        <div>
          <h3 className="text-sm font-semibold text-[#202124] mb-3">All Assignments</h3>
          <div className="flex flex-col gap-2">
            {assignments.map((a, index) => {
              const config = statusConfig[a.status];
              return (
                <div key={a.id} className={`bg-white rounded-xl border ${config.border} p-3 md:p-4 flex items-center justify-between gap-3 flex-wrap ${a.status === 'locked' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">

                    {/* Step number */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${a.status === 'graded' ? 'bg-[#e6f4ea] text-[#34a853]' : a.status === 'active' ? 'bg-[#e8f0fe] text-[#4285f4]' : a.status === 'submitted' ? 'bg-[#fff8e1] text-[#f9a825]' : 'bg-[#f0f2f5] text-gray-400'}`}>
                      {a.status === 'graded' ? '✓' : a.status === 'locked' ? '🔒' : index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-[#202124] truncate">{a.title}</p>
                      <p className="text-[10px] text-gray-400">{a.due}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {a.status === 'graded' && (
                      <>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>Grade: {a.grade}</span>
                        <Link href={`/assignments/feedback?id=${a.id}`} className="text-[10px] px-3 py-1.5 rounded-lg border border-[#34a853] text-[#34a853] hover:bg-[#e6f4ea] transition">View feedback</Link>
                      </>
                    )}
                    {a.status === 'submitted' && (
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>{config.label}</span>
                    )}
                    {a.status === 'active' && (
                      <Link href={`/assignments/submit?id=${a.id}&course=${a.courseId}`} className="text-[10px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white hover:opacity-90 transition">
                        Submit
                      </Link>
                    )}
                    {a.status === 'locked' && (
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}