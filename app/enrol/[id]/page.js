import Link from 'next/link';

const courses = [
  {
    id: 1,
    title: 'Level 3 Diploma in Health and Social Care',
    category: 'Health & Social Care',
    emoji: '📋',
    banner: 'from-[#e8f0fe] to-[#d2e3fc]',
    badge: 'bg-[#e6f4ea] text-[#137333]',
    awarding: 'TQUK',
    level: 'Level 3',
    type: 'CPD Accredited',
    duration: '1 Week – 12 Months',
    study: 'Online Self-Paced',
    assessment: 'Multiple Choice Quiz',
    price: '£10.00',
    originalPrice: '£349.00',
    learners: '2,400+',
    overview: `The Health and Social Care courses are highly beneficial for your development as they equip you with the theoretical and practical knowledge of various health and social care duties. This Level 3 professional diploma has been designed to prepare learners for varied job roles and competitive positions in the health and social care sector. The diploma comprises 20 modules, each with unique and highly relevant content. Initially, you will be introduced to the role of a health and social care worker and the required skills. More advanced modules will provide you with deep insight into various skills including safeguarding, dementia care, medication management, and more.`,
    modules: [
      'Module 1: Introduction to Health and Social Care',
      'Module 2: Safeguarding Adults and Children',
      'Module 3: Care Planning and Person-Centred Approaches',
      'Module 4: Medication Management',
      'Module 5: Mental Health Awareness',
      'Module 6: Dementia Care',
      'Module 7: Communication in Health and Social Care',
      'Module 8: Equality, Diversity and Inclusion',
      'Module 9: Health and Safety in Care Settings',
      'Module 10: Infection Prevention and Control',
      'Module 11: Moving and Handling',
      'Module 12: End of Life Care',
      'Module 13: Learning Disabilities Awareness',
      'Module 14: Nutrition and Hydration in Care',
      'Module 15: Leadership in Care Settings',
    ],
    requirements: [
      'Be age 16 years or above',
      'Solid knowledge of English Language',
      'Working knowledge of ICT for studying online',
      'A genuine desire to study and succeed',
    ],
    whoIsFor: 'This course is ideal for anyone working in or looking to enter the health and social care sector. It is suitable for care workers, support workers, healthcare assistants, and anyone looking to advance their career in care.',
    assessment: 'After studying the training manual, learners will complete a Final Test (online multiple-choice — 2 attempts). The passing score is 80%. A Mock Test with unlimited attempts is available before the final test.',
    certification: 'Upon passing, learners may purchase a Certificate of Completion. PDF format: £50. Hardcopy: £90 including postage.',
  },
  {
    id: 2,
    title: 'Level 5 Diploma in Business Management',
    category: 'Business',
    emoji: '💼',
    banner: 'from-[#fce8e6] to-[#fad2cf]',
    badge: 'bg-[#e8f0fe] text-[#1a73e8]',
    awarding: 'Qualifi',
    level: 'Level 5',
    type: 'Regulated Qualification',
    duration: '1 Week – 12 Months',
    study: 'Online Self-Paced',
    assessment: 'Written Assignments',
    price: '£10.00',
    originalPrice: '£399.00',
    learners: '1,800+',
    overview: `This Level 5 Business Management diploma provides a comprehensive understanding of business operations, strategic planning, and leadership. It is ideal for professionals looking to advance into management roles across all industries. The course covers key areas including financial management, marketing strategy, human resource management, and operations management.`,
    modules: [
      'Module 1: Business Environment and Strategy',
      'Module 2: Financial Management Fundamentals',
      'Module 3: Marketing and Sales Strategy',
      'Module 4: Human Resource Management',
      'Module 5: Operations Management',
      'Module 6: Leadership and Organisational Behaviour',
      'Module 7: Business Law and Ethics',
      'Module 8: Project Management in Business',
      'Module 9: Entrepreneurship and Innovation',
      'Module 10: Strategic Business Planning',
    ],
    requirements: [
      'Be age 18 years or above',
      'Good command of English Language',
      'Basic understanding of business concepts',
      'Access to a computer and internet',
    ],
    whoIsFor: 'This course is suitable for business professionals, managers, entrepreneurs, and graduates looking to advance into senior management roles or start their own business.',
    assessment: 'Learners will complete written assignments for each module. Assignments are marked by qualified tutors and feedback is provided within 5 working days.',
    certification: 'Upon passing all assignments, learners receive a Qualifi regulated qualification certificate recognised by employers globally.',
  },
  {
    id: 3,
    title: 'Qualifi Cyber Security Level 4',
    category: 'Technology',
    emoji: '🛡️',
    banner: 'from-[#e6f4ea] to-[#ceead6]',
    badge: 'bg-[#fce8e6] text-[#c5221f]',
    awarding: 'Qualifi',
    level: 'Level 4',
    type: 'Regulated Qualification',
    duration: '1 Week – 12 Months',
    study: 'Online Self-Paced',
    assessment: 'Written Assignments',
    price: '£10.00',
    originalPrice: '£449.00',
    learners: '950+',
    overview: `This Cyber Security diploma covers the principles of information security, network protection, and risk management. It prepares learners for roles in the fast-growing cyber security sector with practical and theoretical knowledge including ethical hacking, data protection, and GDPR compliance.`,
    modules: [
      'Module 1: Introduction to Cyber Security',
      'Module 2: Network Security Fundamentals',
      'Module 3: Risk Assessment and Management',
      'Module 4: Ethical Hacking Basics',
      'Module 5: Data Protection and GDPR',
      'Module 6: Cloud Security',
      'Module 7: Incident Response and Recovery',
      'Module 8: Security Auditing and Compliance',
    ],
    requirements: [
      'Be age 18 years or above',
      'Basic understanding of IT and computers',
      'Good command of English Language',
      'Access to a computer and internet',
    ],
    whoIsFor: 'Ideal for IT professionals, network administrators, and anyone looking to move into cyber security roles.',
    assessment: 'Learners complete written assignments assessed by qualified cyber security tutors with feedback within 5 working days.',
    certification: 'Upon passing, learners receive a Qualifi Level 4 regulated qualification certificate.',
  },
  {
    id: 4,
    title: 'Level 7 Diploma in Leadership and Management',
    category: 'Leadership',
    emoji: '🏆',
    banner: 'from-[#fff8e1] to-[#fff3cd]',
    badge: 'bg-[#fff8e1] text-[#f9a825]',
    awarding: 'OTHM',
    level: 'Level 7',
    type: 'Regulated Qualification',
    duration: '1 Week – 12 Months',
    study: 'Online Self-Paced',
    assessment: 'Written Assignments',
    price: '£10.00',
    originalPrice: '£499.00',
    learners: '1,200+',
    overview: `This Level 7 Leadership and Management diploma develops advanced leadership skills for senior professionals. It covers strategic decision-making, organisational development, and change management at an executive level. This qualification is equivalent to a Master's degree level.`,
    modules: [
      'Module 1: Strategic Leadership Principles',
      'Module 2: Organisational Behaviour and Culture',
      'Module 3: Change Management',
      'Module 4: Financial Strategy for Leaders',
      'Module 5: Executive Communication',
      'Module 6: Corporate Governance and Ethics',
      'Module 7: Strategic Human Resource Management',
      'Module 8: Global Business Strategy',
    ],
    requirements: [
      'Be age 21 years or above',
      'Hold a Level 6 qualification or equivalent',
      'Excellent command of English Language',
      'Minimum 2 years management experience recommended',
    ],
    whoIsFor: 'Designed for senior managers, directors, executives and professionals seeking to reach the highest levels of leadership.',
    assessment: 'Learners complete written assignments and a final strategic leadership project assessed by experienced tutors.',
    certification: 'Upon passing, learners receive an OTHM Level 7 regulated qualification certificate recognised internationally.',
  },
  {
    id: 5,
    title: 'Level 4 Diploma in Project Management',
    category: 'Project Management',
    emoji: '📊',
    banner: 'from-[#f3e5f5] to-[#e1bee7]',
    badge: 'bg-[#f3e5f5] text-[#7b1fa2]',
    awarding: 'TQUK',
    level: 'Level 4',
    type: 'CPD Accredited',
    duration: '1 Week – 12 Months',
    study: 'Online Self-Paced',
    assessment: 'Written Assignments',
    price: '£10.00',
    originalPrice: '£379.00',
    learners: '870+',
    overview: `This Project Management diploma provides essential skills in planning, executing, and closing projects successfully. Covering industry-standard methodologies including PRINCE2 and Agile, it is ideal for aspiring and practising project managers across all industries.`,
    modules: [
      'Module 1: Project Planning Fundamentals',
      'Module 2: Agile Project Management',
      'Module 3: Risk and Issue Management',
      'Module 4: Stakeholder Management',
      'Module 5: Project Closure and Review',
      'Module 6: Budgeting and Cost Management',
      'Module 7: Quality Management in Projects',
      'Module 8: PRINCE2 Methodology Overview',
    ],
    requirements: [
      'Be age 18 years or above',
      'Good command of English Language',
      'Basic understanding of project concepts',
      'Access to a computer and internet',
    ],
    whoIsFor: 'Ideal for project coordinators, team leaders, and professionals looking to formalise their project management skills.',
    assessment: 'Written assignments assessed by qualified project management tutors with feedback within 5 working days.',
    certification: 'Upon passing, learners receive a TQUK Level 4 qualification certificate.',
  },
  {
    id: 6,
    title: 'Level 5 Diploma in Accounting and Finance',
    category: 'Accounting',
    emoji: '💰',
    banner: 'from-[#e8f5e9] to-[#c8e6c9]',
    badge: 'bg-[#e8f5e9] text-[#2e7d32]',
    awarding: 'Qualifi',
    level: 'Level 5',
    type: 'Regulated Qualification',
    duration: '1 Week – 12 Months',
    study: 'Online Self-Paced',
    assessment: 'Written Assignments',
    price: '£10.00',
    originalPrice: '£419.00',
    learners: '640+',
    overview: `This Level 5 Accounting and Finance diploma provides comprehensive knowledge of financial management, accounting principles, and business finance. It is ideal for finance professionals looking to advance their careers or those transitioning into accounting and finance roles.`,
    modules: [
      'Module 1: Financial Accounting Principles',
      'Module 2: Management Accounting',
      'Module 3: Business Taxation',
      'Module 4: Auditing and Assurance',
      'Module 5: Financial Reporting and Analysis',
      'Module 6: Corporate Finance',
      'Module 7: Investment and Portfolio Management',
      'Module 8: Financial Risk Management',
    ],
    requirements: [
      'Be age 18 years or above',
      'Basic understanding of accounting or finance',
      'Good command of English Language',
      'Access to a computer and internet',
    ],
    whoIsFor: 'Suitable for accountants, finance officers, business owners, and anyone looking to build expertise in accounting and finance.',
    assessment: 'Written assignments assessed by qualified accounting tutors with detailed feedback provided.',
    certification: 'Upon passing, learners receive a Qualifi Level 5 regulated qualification certificate.',
  },
];

export default async function EnrolPage({ params }) {
  const { id } = await params;
  const course = courses.find((c) => c.id === parseInt(id)) || courses[0];

  const tabs = ['Overview', 'Course Outline', 'Requirements', 'Who is this for?', 'Assessment', 'Certification'];

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">

      {/* Navbar */}
      <nav className="bg-[#0C0E13] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/#courses" className="hidden md:block text-sm text-[#9aa0a6] hover:text-white transition">Courses</Link>
          <Link href="/login" className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white transition">Log in</Link>
          <Link href="/login" className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white hover:opacity-90 transition">Get started</Link>
        </div>
      </nav>

      {/* Hero banner */}
      <div className="bg-[#0C0E13] px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#4285f4] transition">Home</Link>
            <span>›</span>
            <Link href="/#courses" className="hover:text-[#4285f4] transition">Courses</Link>
            <span>›</span>
            <span className="text-gray-300 truncate">{course.title}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            <div className="md:col-span-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${course.badge} mb-3 inline-block`}>{course.category}</span>
              <h1 className="text-xl md:text-3xl font-bold text-white mb-3 leading-snug">{course.title}</h1>
              <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{course.overview}</p>
              <div className="flex flex-wrap gap-4">
                <div className="text-xs text-gray-400">⏱ {course.duration}</div>
                <div className="text-xs text-gray-400">💻 {course.study}</div>
                <div className="text-xs text-gray-400">📜 {course.type}</div>
                <div className="text-xs text-gray-400">👥 {course.learners} enrolled</div>
              </div>
            </div>

            {/* Price card — desktop */}
            <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-200">
              <div className="text-xs text-gray-400 line-through mb-1">{course.originalPrice}</div>
              <div className="text-3xl font-bold text-[#202124] mb-1">{course.price}</div>
              <div className="text-xs text-[#34a853] font-medium mb-4">
                Save {Math.round((1 - parseFloat(course.price.replace('£','')) / parseFloat(course.originalPrice.replace('£',''))) * 100)}% — limited time offer
              </div>
              <Link href="/login" className="block w-full py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium text-center hover:opacity-90 transition mb-3">
                Enrol Now
              </Link>
              <button className="w-full py-3 rounded-xl border border-gray-200 text-[#202124] text-sm font-medium hover:border-[#4285f4] hover:text-[#4285f4] transition">
                Add to basket
              </button>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {[
                  { label: 'Level', value: course.level },
                  { label: 'Approved by', value: course.awarding },
                  { label: 'Duration', value: course.duration },
                  { label: 'Study method', value: course.study },
                  { label: 'Certificate', value: 'Available separately' },
                ].map((info) => (
                  <div key={info.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400">{info.label}</span>
                    <span className="text-xs font-medium text-[#202124] text-right">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile price bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-14 z-40">
        <div>
          <span className="text-xs text-gray-400 line-through mr-2">{course.originalPrice}</span>
          <span className="text-xl font-bold text-[#202124]">{course.price}</span>
        </div>
        <Link href="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition whitespace-nowrap">
          Enrol Now
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

        {/* Left — course content */}
        <div className="md:col-span-2">

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
            {tabs.map((tab, i) => (
              <span key={tab} className={`px-3 md:px-4 py-2.5 text-xs font-medium cursor-pointer whitespace-nowrap border-b-2 transition ${i === 0 ? 'border-[#4285f4] text-[#4285f4]' : 'border-transparent text-gray-500 hover:text-[#202124]'}`}>
                {tab}
              </span>
            ))}
          </div>

          {/* Overview */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-3">Overview</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{course.overview}</p>
          </div>

          {/* Course outline */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-3">Course Outline</h2>
            <p className="text-xs text-gray-400 mb-4">This course is CPD Accredited. Learners must complete all modules.</p>
            <div className="flex flex-col gap-2">
              {course.modules.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                  <div className="w-6 h-6 rounded-full bg-[#e8f0fe] text-[#4285f4] flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                  <p className="text-xs md:text-sm text-[#202124]">{m}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-3">Requirements</h2>
            {course.requirements.map((r, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-[#34a853] text-sm shrink-0">✓</span>
                <p className="text-sm text-gray-500">{r}</p>
              </div>
            ))}
          </div>

          {/* Who is this for */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-3">Who is this for?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{course.whoIsFor}</p>
          </div>

          {/* Assessment */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-3">Assessment</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{course.assessment}</p>
          </div>

          {/* Certification */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold text-[#202124] mb-3">Certification</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{course.certification}</p>
          </div>

          {/* CTA bottom */}
          <div className="bg-[#0C0E13] rounded-2xl p-6 md:p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Ready to enrol?</h3>
            <p className="text-sm text-gray-400 mb-4">Join {course.learners} learners already studying this course.</p>
            <Link href="/login" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white font-medium hover:opacity-90 transition text-sm">
              Enrol Now — {course.price}
            </Link>
          </div>
        </div>

        {/* Right — sticky price card desktop */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 sticky top-24">
            <div className="text-xs text-gray-400 line-through mb-1">{course.originalPrice}</div>
            <div className="text-3xl font-bold text-[#202124] mb-1">{course.price}</div>
            <div className="text-xs text-[#34a853] font-medium mb-4">
              Save {Math.round((1 - parseFloat(course.price.replace('£','')) / parseFloat(course.originalPrice.replace('£',''))) * 100)}% — limited time offer
            </div>
            <Link href="/login" className="block w-full py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium text-center hover:opacity-90 transition mb-3">
              Enrol Now
            </Link>
            <button className="w-full py-3 rounded-xl border border-gray-200 text-[#202124] text-sm font-medium hover:border-[#4285f4] hover:text-[#4285f4] transition mb-4">
              Add to basket
            </button>
            <div className="pt-3 border-t border-gray-100">
              {[
                { label: 'Level', value: course.level },
                { label: 'Approved by', value: course.awarding },
                { label: 'Duration', value: course.duration },
                { label: 'Study method', value: course.study },
                { label: 'Certificate', value: 'Available separately' },
              ].map((info) => (
                <div key={info.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{info.label}</span>
                  <span className="text-xs font-medium text-[#202124] text-right">{info.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Award bodies */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-[#202124] mb-3">Award Bodies</h4>
            <div className="flex flex-wrap gap-2">
              {['TQUK', 'OTHM', 'Qualifi', 'NOCN', 'iCQ', 'Step Ahead CPD'].map((a) => (
                <span key={a} className="text-[10px] px-2 py-1 rounded-md bg-[#f0f2f5] text-gray-500 border border-gray-200">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0C0E13] border-t border-white/5 px-6 py-10 mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
              <span className="text-base font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">The UK's leading specialist provider of distance learning professional and vocational courses — worldwide.</p>
            <div className="text-xs text-gray-500 mb-1">📍 First Floor, Fairlawn High Street, Southall, London UB1 3HB</div>
            <div className="text-xs text-gray-500 mb-1">📞 +44 (0) 20 7101 9543</div>
            <div className="text-xs text-gray-500 mb-4">✉ info@learnhub.co.uk</div>
            <div className="flex gap-2">
              {['f', 'in', '▶', '📷'].map((s) => (
                <div key={s} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition">{s}</div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Popular Categories</h4>
            {['Health & Social Care', 'Business Management', 'Project Management', 'Accounting & Finance', 'Education & Training', 'Cyber Security'].map((c) => (
              <Link key={c} href="/#courses" className="block text-xs text-gray-500 mb-2 hover:text-white transition">{c}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Platforms</h4>
            {['VLE — Student Portal', 'Moodle Learning', 'Mobile App', 'Corporate Training'].map((p) => (
              <p key={p} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{p}</p>
            ))}
            <h4 className="text-xs font-semibold text-white mt-5 mb-4 pb-2 border-b border-white/5">Quick Links</h4>
            {['All Courses', 'Qualifications', 'How to Pay', 'FAQs', 'Blog'].map((l) => (
              <p key={l} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{l}</p>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Award Bodies</h4>
            <div className="flex flex-wrap gap-2 mb-5">
              {['TQUK', 'OTHM', 'Qualifi', 'NOCN', 'iCQ', 'Step Ahead CPD'].map((a) => (
                <span key={a} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10">{a}</span>
              ))}
            </div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Legal</h4>
            {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy'].map((l) => (
              <p key={l} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{l}</p>
            ))}
          </div>
        </div>
        <div className="max-w-5xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2025 LearnHub. All Rights Reserved.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <span key={l} className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer transition">{l}</span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}