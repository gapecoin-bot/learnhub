import Link from 'next/link';

const courses = [
  {
    id: 1,
    title: 'Level 3 Diploma in Health and Social Care',
    category: 'Health & Social Care',
    modules: 12,
    assignments: 6,
    progress: 72,
    emoji: '📋',
    banner: 'from-[#e8f0fe] to-[#d2e3fc]',
    badge: 'bg-[#e6f4ea] text-[#137333]',
    bar: 'from-[#4285f4] to-[#34a853]',
    awarding: 'TQUK',
    price: '£10.00',
    originalPrice: '£349.00',
    duration: '1 Week – 12 Months',
    overview: 'The Health and Social Care diploma equips you with the theoretical and practical knowledge of various health and social care duties. Designed to prepare learners for varied job roles and competitive positions in the health and social care sector.',
    modules_list: [
      { title: 'Introduction and Overview', duration: '45 mins', completed: true },
      { title: 'Core Principles and Frameworks', duration: '1hr 20 mins', completed: true },
      { title: 'Practical Application', duration: '1hr 10 mins', completed: true },
      { title: 'Case Studies and Analysis', duration: '55 mins', completed: false },
      { title: 'Assessment Preparation', duration: '40 mins', completed: false },
      { title: 'Final Review', duration: '30 mins', completed: false },
    ],
    assignment: 'Unit 3 – Care Planning Essay',
    due: 'Due in 2 days',
  },
  {
    id: 2,
    title: 'Level 5 Diploma in Business Management',
    category: 'Business',
    modules: 10,
    assignments: 5,
    progress: 40,
    emoji: '💼',
    banner: 'from-[#fce8e6] to-[#fad2cf]',
    badge: 'bg-[#e8f0fe] text-[#1a73e8]',
    bar: 'from-[#ea4335] to-[#fbbc04]',
    awarding: 'Qualifi',
    price: '£10.00',
    originalPrice: '£399.00',
    duration: '1 Week – 12 Months',
    overview: 'This Level 5 Business Management diploma provides a comprehensive understanding of business operations, strategic planning, and leadership. It is ideal for professionals looking to advance into management roles across all industries.',
    modules_list: [
      { title: 'Business Environment and Strategy', duration: '1hr', completed: true },
      { title: 'Financial Management Fundamentals', duration: '1hr 30 mins', completed: true },
      { title: 'Marketing and Sales Strategy', duration: '1hr', completed: false },
      { title: 'Human Resource Management', duration: '55 mins', completed: false },
      { title: 'Operations Management', duration: '45 mins', completed: false },
    ],
    assignment: 'Strategic Analysis Report',
    due: 'Due in 8 days',
  },
  {
    id: 3,
    title: 'Qualifi Cyber Security Level 4',
    category: 'Technology',
    modules: 8,
    assignments: 4,
    progress: 15,
    emoji: '🛡️',
    banner: 'from-[#e6f4ea] to-[#ceead6]',
    badge: 'bg-[#fce8e6] text-[#c5221f]',
    bar: 'from-[#34a853] to-[#4285f4]',
    awarding: 'Qualifi',
    price: '£10.00',
    originalPrice: '£449.00',
    duration: '1 Week – 12 Months',
    overview: 'This Cyber Security diploma covers the principles of information security, network protection, and risk management. It prepares learners for roles in the fast-growing cyber security sector with practical and theoretical knowledge.',
    modules_list: [
      { title: 'Introduction to Cyber Security', duration: '1hr', completed: true },
      { title: 'Network Security Fundamentals', duration: '1hr 20 mins', completed: false },
      { title: 'Risk Assessment and Management', duration: '55 mins', completed: false },
      { title: 'Ethical Hacking Basics', duration: '1hr 10 mins', completed: false },
      { title: 'Data Protection and GDPR', duration: '45 mins', completed: false },
    ],
    assignment: 'Network Security Assessment',
    due: 'Due in 14 days',
  },
  {
    id: 4,
    title: 'Level 7 Diploma in Leadership and Management',
    category: 'Leadership',
    modules: 14,
    assignments: 7,
    progress: 0,
    emoji: '🏆',
    banner: 'from-[#fff8e1] to-[#fff3cd]',
    badge: 'bg-[#fff8e1] text-[#f9a825]',
    bar: 'from-[#fbbc04] to-[#ea4335]',
    awarding: 'OTHM',
    price: '£10.00',
    originalPrice: '£499.00',
    duration: '1 Week – 12 Months',
    overview: 'This Level 7 Leadership and Management diploma develops advanced leadership skills for senior professionals. It covers strategic decision-making, organisational development, and change management at an executive level.',
    modules_list: [
      { title: 'Strategic Leadership Principles', duration: '1hr 30 mins', completed: false },
      { title: 'Organisational Behaviour', duration: '1hr', completed: false },
      { title: 'Change Management', duration: '55 mins', completed: false },
      { title: 'Financial Strategy for Leaders', duration: '1hr 20 mins', completed: false },
      { title: 'Executive Communication', duration: '45 mins', completed: false },
    ],
    assignment: 'Leadership Strategy Report',
    due: 'Due in 21 days',
  },
  {
    id: 5,
    title: 'Level 4 Diploma in Project Management',
    category: 'Project Management',
    modules: 10,
    assignments: 5,
    progress: 60,
    emoji: '📊',
    banner: 'from-[#f3e5f5] to-[#e1bee7]',
    badge: 'bg-[#f3e5f5] text-[#7b1fa2]',
    bar: 'from-[#4285f4] to-[#ea4335]',
    awarding: 'TQUK',
    price: '£10.00',
    originalPrice: '£379.00',
    duration: '1 Week – 12 Months',
    overview: 'This Project Management diploma provides essential skills in planning, executing, and closing projects successfully. Covering industry-standard methodologies including PRINCE2 and Agile, it is ideal for aspiring project managers.',
    modules_list: [
      { title: 'Project Planning Fundamentals', duration: '1hr', completed: true },
      { title: 'Agile Project Management', duration: '1hr 20 mins', completed: true },
      { title: 'Risk and Issue Management', duration: '55 mins', completed: true },
      { title: 'Stakeholder Management', duration: '45 mins', completed: false },
      { title: 'Project Closure and Review', duration: '40 mins', completed: false },
    ],
    assignment: 'Project Plan Submission',
    due: 'Due in 10 days',
  },
  {
    id: 6,
    title: 'Certificate in Safeguarding Adults',
    category: 'Health & Social Care',
    modules: 5,
    assignments: 2,
    progress: 100,
    emoji: '🛡️',
    banner: 'from-[#e8f5e9] to-[#c8e6c9]',
    badge: 'bg-[#e6f4ea] text-[#137333]',
    bar: 'from-[#34a853] to-[#34a853]',
    awarding: 'TQUK',
    price: '£10.00',
    originalPrice: '£199.00',
    duration: '1 Week – 3 Months',
    overview: 'This Safeguarding Adults certificate covers the key principles of adult safeguarding, legislation, and best practices. It is essential for anyone working in health, social care, or any role involving vulnerable adults.',
    modules_list: [
      { title: 'Introduction to Safeguarding', duration: '45 mins', completed: true },
      { title: 'Legislation and Policy', duration: '1hr', completed: true },
      { title: 'Recognising Abuse and Neglect', duration: '55 mins', completed: true },
      { title: 'Reporting and Responding', duration: '40 mins', completed: true },
      { title: 'Case Studies and Assessment', duration: '30 mins', completed: true },
    ],
    assignment: 'Safeguarding Case Study',
    due: 'Submitted',
  },
];

export default async function CoursePage({ params }) {
  const { id } = await params;
  const course = courses.find((c) => c.id === parseInt(id)) || courses[0];
  const completedModules = course.modules_list.filter((m) => m.completed).length;

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
        <div className="md:hidden flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-medium">LW</div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 md:mb-6">
          <Link href="/courses" className="hover:text-[#4285f4] transition">My Courses</Link>
          <span>›</span>
          <span className="text-[#202124] truncate">{course.title}</span>
        </div>

        {/* Course header */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 md:mb-6">
          <div className={`h-28 md:h-36 bg-gradient-to-br ${course.banner} flex items-center justify-center text-5xl md:text-6xl`}>{course.emoji}</div>
          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className={`text-xs ${course.badge} px-2 py-0.5 rounded-full mb-2 inline-block`}>{course.category}</span>
                <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-1">{course.title}</h2>
                <p className="text-xs md:text-sm text-gray-400">{course.modules} modules · {course.assignments} assignments · Awarded by {course.awarding}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl md:text-2xl font-semibold text-[#4285f4]">{course.progress}%</p>
                <p className="text-xs text-gray-400">complete</p>
                <p className="text-xs text-gray-400 mt-1">{completedModules}/{course.modules_list.length} modules done</p>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
              <div className={`h-full bg-gradient-to-r ${course.bar} rounded-full transition-all`} style={{ width: `${course.progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 mb-4 md:mb-6">
          <h3 className="text-sm font-semibold text-[#202124] mb-2">About this course</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{course.overview}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Modules list */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[#202124] mb-3">Course Modules</h3>
            <div className="flex flex-col gap-2">
              {course.modules_list.map((m, i) => (
                <div key={i} className={`bg-white rounded-xl border p-3 md:p-4 flex items-center justify-between gap-3 transition ${m.completed ? 'border-[#34a853]/30' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium shrink-0 ${m.completed ? 'bg-[#e6f4ea] text-[#34a853]' : 'bg-gray-100 text-gray-400'}`}>
                      {m.completed ? '✓' : i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-[#202124] truncate">{m.title}</p>
                      <p className="text-[11px] text-gray-400">{m.duration}</p>
                    </div>
                  </div>
                  <button className={`text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-lg border transition shrink-0 ${m.completed ? 'border-[#34a853] text-[#34a853] hover:bg-[#e6f4ea]' : 'border-[#4285f4] text-[#4285f4] hover:bg-[#e8f0fe]'}`}>
                    {m.completed ? 'Review' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">

            {/* Course notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-2">📄 Course Notes</h3>
              <p className="text-xs text-gray-400 mb-3">Download your official course materials and study notes.</p>
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                ⬇ Download Notes
              </button>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-2">📝 Assignment</h3>
              <p className="text-xs text-gray-400 mb-1">{course.assignment}</p>
              <p className={`text-xs mb-3 ${course.due === 'Submitted' ? 'text-[#34a853]' : 'text-[#c5221f]'}`}>{course.due}</p>
              <button className="w-full py-2 rounded-lg border border-[#4285f4] text-[#4285f4] text-xs font-medium hover:bg-[#e8f0fe] transition mb-2">
                ⬇ Download Brief
              </button>
              {course.due !== 'Submitted' && (
                <Link href="/assignments/submit" className="block w-full py-2 rounded-lg bg-gradient-to-r from-[#ea4335] to-[#fbbc04] text-white text-xs font-medium text-center hover:opacity-90 transition">
                  ↑ Submit Assignment
                </Link>
              )}
              {course.due === 'Submitted' && (
                <div className="w-full py-2 rounded-lg bg-[#e6f4ea] text-[#137333] text-xs font-medium text-center">
                  ✓ Assignment submitted
                </div>
              )}
            </div>

            {/* Course info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-3">📋 Course Info</h3>
              {[
                { label: 'Awarding body', value: course.awarding },
                { label: 'Duration', value: course.duration },
                { label: 'Study method', value: 'Online Self-Paced' },
                { label: 'Certificate', value: 'Available separately' },
              ].map((info) => (
                <div key={info.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{info.label}</span>
                  <span className="text-xs font-medium text-[#202124]">{info.value}</span>
                </div>
              ))}
            </div>

            {/* Tutor */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-3">👨‍🏫 Your Tutor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbbc04] to-[#ea4335] flex items-center justify-center text-white text-sm font-medium shrink-0">JM</div>
                <div>
                  <p className="text-sm font-medium text-[#202124]">James Mitchell</p>
                  <p className="text-xs text-gray-400">{course.category}</p>
                </div>
              </div>
              <button className="w-full py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:border-[#4285f4] hover:text-[#4285f4] transition">
                ✉ Send Message
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}