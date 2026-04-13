'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const feedbackData = {
  1: {
    title: 'Unit 1 – Introduction to Care',
    course: 'Level 3 Diploma in Health and Social Care',
    courseId: 1,
    grade: '78%',
    submittedDate: '28 March 2026',
    gradedDate: '30 March 2026',
    tutor: 'James Mitchell',
    tutorInitials: 'JM',
    passFail: 'Pass',
    breakdown: [
      { criteria: 'Understanding of care principles', score: '18/20', comment: 'Excellent understanding demonstrated throughout.' },
      { criteria: 'Use of academic references', score: '14/20', comment: 'Good use of sources but could include more recent publications.' },
      { criteria: 'Structure and presentation', score: '16/20', comment: 'Well structured with clear headings and logical flow.' },
      { criteria: 'Critical analysis', score: '15/20', comment: 'Good analysis shown. Try to challenge assumptions more.' },
      { criteria: 'Conclusion', score: '15/20', comment: 'Strong conclusion that ties the essay together well.' },
    ],
    overallFeedback: 'This was a strong submission that demonstrated a solid understanding of care principles. Your essay was well structured and clearly written. To improve further, focus on using more recent academic sources (published within the last 5 years) and push yourself to critically challenge the theories you discuss rather than just describing them. Overall a very good piece of work — well done!',
    improvements: [
      'Use more recent academic sources (2020 onwards)',
      'Critically challenge theories rather than just describing them',
      'Include real-world case studies to strengthen your arguments',
    ],
  },
  5: {
    title: 'Business Environment Analysis',
    course: 'Level 5 Diploma in Business Management',
    courseId: 2,
    grade: '78%',
    submittedDate: '25 March 2026',
    gradedDate: '28 March 2026',
    tutor: 'Sarah Thompson',
    tutorInitials: 'ST',
    passFail: 'Pass',
    breakdown: [
      { criteria: 'Business environment analysis', score: '16/20', comment: 'Good analysis of PESTLE factors with relevant examples.' },
      { criteria: 'Strategic recommendations', score: '15/20', comment: 'Recommendations were logical but lacked depth.' },
      { criteria: 'Use of business models', score: '17/20', comment: 'Excellent application of Porter\'s Five Forces.' },
      { criteria: 'Academic referencing', score: '15/20', comment: 'Good use of sources throughout.' },
      { criteria: 'Presentation and structure', score: '15/20', comment: 'Clear and professional presentation.' },
    ],
    overallFeedback: 'A solid piece of work that showed good understanding of business environment analysis. Your application of Porter\'s Five Forces was particularly strong. To improve, develop your strategic recommendations with more specific and actionable steps backed by evidence. Your writing is clear and professional throughout.',
    improvements: [
      'Develop strategic recommendations with more specific detail',
      'Back recommendations with stronger evidence and data',
      'Consider including financial implications of recommendations',
    ],
  },
};

function FeedbackContent() {
  const searchParams = useSearchParams();
  const id = parseInt(searchParams.get('id') || '1');
  const feedback = feedbackData[id] || feedbackData[1];
  const scoreNum = parseInt(feedback.grade);

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

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 md:mb-6">
          <Link href="/assignments" className="hover:text-[#4285f4] transition">Assignments</Link>
          <span>›</span>
          <span className="text-[#202124] truncate">{feedback.title}</span>
        </div>

        {/* Desktop title */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Tutor feedback</p>
            <h2 className="text-xl font-semibold text-[#202124]">Assignment Feedback</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#202124]">Lycurgus Wainaina</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-sm font-medium">LW</div>
          </div>
        </div>

        {/* Mobile title */}
        <div className="md:hidden mb-4">
          <p className="text-sm text-gray-400">Tutor feedback</p>
          <h2 className="text-lg font-semibold text-[#202124]">Assignment Feedback</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Left — main feedback */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Grade card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <span className="text-xs bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full mb-2 inline-block">{feedback.course}</span>
                  <h3 className="text-base md:text-lg font-semibold text-[#202124]">{feedback.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">Submitted {feedback.submittedDate} · Graded {feedback.gradedDate}</p>
                </div>
                <div className="text-center shrink-0">
                  <div className={`text-3xl md:text-4xl font-bold mb-1 ${scoreNum >= 70 ? 'text-[#34a853]' : scoreNum >= 50 ? 'text-[#fbbc04]' : 'text-[#ea4335]'}`}>
                    {feedback.grade}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${feedback.passFail === 'Pass' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                    {feedback.passFail}
                  </span>
                </div>
              </div>

              {/* Grade bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scoreNum >= 70 ? 'bg-gradient-to-r from-[#34a853] to-[#4285f4]' : scoreNum >= 50 ? 'bg-[#fbbc04]' : 'bg-[#ea4335]'}`}
                  style={{ width: `${scoreNum}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0%</span>
                <span>Pass mark: 50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Overall feedback */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#202124] mb-3">💬 Overall feedback</h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{feedback.overallFeedback}</p>
            </div>

            {/* Marking breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#202124] mb-4">📊 Marking breakdown</h3>
              <div className="flex flex-col gap-3">
                {feedback.breakdown.map((b, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-[#202124]">{b.criteria}</p>
                      <span className="text-xs font-semibold text-[#4285f4] shrink-0 ml-2">{b.score}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{b.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas to improve */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[#202124] mb-3">🎯 Areas to improve</h3>
              {feedback.improvements.map((item, i) => (
                <div key={i} className="flex items-start gap-2 mb-2.5">
                  <span className="w-5 h-5 bg-[#fce8e6] text-[#ea4335] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-gray-500">{item}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/assignments" className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition text-center">
                Back to assignments
              </Link>
              <Link href={`/courses/${feedback.courseId}`} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition text-center">
                Continue course →
              </Link>
            </div>
          </div>

          {/* Right — tutor info */}
          <div className="flex flex-col gap-4">

            {/* Tutor card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-3">👨‍🏫 Graded by</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbbc04] to-[#ea4335] flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {feedback.tutorInitials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#202124]">{feedback.tutor}</p>
                  <p className="text-xs text-gray-400">Course Tutor</p>
                </div>
              </div>
              <button className="w-full py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:border-[#4285f4] hover:text-[#4285f4] transition">
                ✉ Message tutor
              </button>
            </div>

            {/* Submission details */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-3">📋 Submission details</h3>
              {[
                { label: 'Submitted', value: feedback.submittedDate },
                { label: 'Graded', value: feedback.gradedDate },
                { label: 'Final grade', value: feedback.grade },
                { label: 'Result', value: feedback.passFail },
              ].map((d) => (
                <div key={d.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{d.label}</span>
                  <span className={`text-xs font-medium ${d.label === 'Result' && feedback.passFail === 'Pass' ? 'text-[#34a853]' : 'text-[#202124]'}`}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Next assignment */}
            <div className="bg-[#e8f0fe] rounded-xl border border-[#4285f4]/20 p-4">
              <h3 className="text-sm font-semibold text-[#202124] mb-2">🔓 Next up</h3>
              <p className="text-xs text-gray-500 mb-3">Your next assignment has been unlocked!</p>
              <Link href="/assignments" className="block w-full py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium text-center hover:opacity-90 transition">
                View next assignment →
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center"><p className="text-sm text-gray-400">Loading feedback...</p></div>}>
      <FeedbackContent />
    </Suspense>
  );
}