'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (!data || data.role !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
      setProfile(data);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '';

  const tabs = ['Overview', 'Courses', 'Students', 'Assessors', 'Submissions', 'Certificates', 'Announcements'];

  const stats = [
    { label: 'Total students', value: '1,284', change: '+12 this week', color: 'text-[#4285f4]', bg: 'bg-[#e8f0fe]' },
    { label: 'Active courses', value: '48', change: '+3 this month', color: 'text-[#34a853]', bg: 'bg-[#e6f4ea]' },
    { label: 'Pending submissions', value: '23', change: 'Awaiting grade', color: 'text-[#ea4335]', bg: 'bg-[#fce8e6]' },
    { label: 'Certificates issued', value: '342', change: '+18 this month', color: 'text-[#fbbc04]', bg: 'bg-[#fff8e1]' },
  ];

  const recentStudents = [
    { name: 'Sarah Johnson', email: 'sarah@example.com', course: 'Level 3 Health & Social Care', enrolled: '2 days ago', status: 'Active' },
    { name: 'Michael Osei', email: 'michael@example.com', course: 'Level 5 Business Management', enrolled: '3 days ago', status: 'Active' },
    { name: 'Amara Diallo', email: 'amara@example.com', course: 'Cyber Security Level 4', enrolled: '5 days ago', status: 'Active' },
    { name: 'James Kariuki', email: 'james@example.com', course: 'Level 7 Leadership', enrolled: '1 week ago', status: 'Active' },
  ];

  const pendingSubmissions = [
    { student: 'Sarah Johnson', assignment: 'Unit 3 – Care Planning Essay', course: 'Health & Social Care L3', submitted: '1 day ago', urgent: true },
    { student: 'Michael Osei', assignment: 'Strategic Analysis Report', course: 'Business Management L5', submitted: '2 days ago', urgent: false },
    { student: 'Amara Diallo', assignment: 'Network Security Assessment', course: 'Cyber Security L4', submitted: '3 days ago', urgent: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans">

      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>

        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <div>
              <p className="text-xs font-medium text-white">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#34a853]">Super Admin</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Management</p>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition text-left ${activeTab === tab ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab === 'Overview' && '📊'}
            {tab === 'Courses' && '📚'}
            {tab === 'Students' && '👥'}
            {tab === 'Assessors' && '👨‍🏫'}
            {tab === 'Submissions' && '📝'}
            {tab === 'Certificates' && '🏆'}
            {tab === 'Announcements' && '📢'}
            {tab}
          </button>
        ))}

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full"
          >
            🚪 Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60 bg-[#f0f2f5] p-4 md:p-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Welcome back,</p>
            <h2 className="text-xl font-semibold text-[#202124]">{profile?.first_name} {profile?.last_name} 👋</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[#202124]">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-[#34a853]">Super Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-sm font-medium">{initials}</div>
          </div>
        </div>

        {/* Tab navigation — mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${activeTab === tab ? 'bg-[#4285f4] text-white border-[#4285f4]' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'Overview' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                  <p className={`text-xs font-semibold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.change}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <h3 className="text-sm font-semibold text-[#202124] mb-3">Quick actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Add new course', icon: '➕', color: 'bg-[#e8f0fe] text-[#4285f4]', tab: 'Courses' },
                { label: 'Add assessor', icon: '👨‍🏫', color: 'bg-[#e6f4ea] text-[#34a853]', tab: 'Assessors' },
                { label: 'Grade submissions', icon: '📝', color: 'bg-[#fce8e6] text-[#ea4335]', tab: 'Submissions' },
                { label: 'Issue certificate', icon: '🏆', color: 'bg-[#fff8e1] text-[#f9a825]', tab: 'Certificates' },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setActiveTab(a.tab)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#4285f4] transition text-left"
                >
                  <div className={`w-9 h-9 ${a.color} rounded-xl flex items-center justify-center text-lg mb-2`}>{a.icon}</div>
                  <p className="text-xs font-medium text-[#202124]">{a.label}</p>
                </button>
              ))}
            </div>

            {/* Recent students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#202124]">Recent enrolments</h3>
                  <button onClick={() => setActiveTab('Students')} className="text-xs text-[#4285f4] hover:underline">View all</button>
                </div>
                {recentStudents.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-medium shrink-0">
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#202124] truncate">{s.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{s.course}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{s.enrolled}</span>
                  </div>
                ))}
              </div>

              {/* Pending submissions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#202124]">Pending submissions</h3>
                  <button onClick={() => setActiveTab('Submissions')} className="text-xs text-[#4285f4] hover:underline">View all</button>
                </div>
                {pendingSubmissions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#202124] truncate">{s.assignment}</p>
                      <p className="text-[10px] text-gray-400 truncate">{s.student} · {s.course}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.urgent ? 'bg-[#fce8e6] text-[#c5221f]' : 'bg-[#e8f0fe] text-[#1a73e8]'}`}>
                        {s.submitted}
                      </span>
                      <button onClick={() => setActiveTab('Submissions')} className="text-[10px] px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white hover:opacity-90 transition">
                        Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses tab */}
        {activeTab === 'Courses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Manage Courses</h3>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                ➕ Add new course
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-400 text-center py-8">Course management coming soon — connect to Supabase to manage courses dynamically.</p>
            </div>
          </div>
        )}

        {/* Students tab */}
        {activeTab === 'Students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Manage Students</h3>
              <input type="text" placeholder="Search students..." className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#4285f4] transition w-48" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Course</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Enrolled</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-medium shrink-0">
                            {s.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#202124]">{s.name}</p>
                            <p className="text-[10px] text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-500">{s.course}</p></td>
                      <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-400">{s.enrolled}</p></td>
                      <td className="px-4 py-3"><span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">{s.status}</span></td>
                      <td className="px-4 py-3">
                        <button className="text-[10px] px-2.5 py-1 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#e8f0fe] transition">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assessors tab */}
        {activeTab === 'Assessors' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Manage Assessors</h3>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                ➕ Add assessor
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">👨‍🏫</div>
              <h4 className="text-sm font-semibold text-[#202124] mb-1">No assessors yet</h4>
              <p className="text-xs text-gray-400 mb-4">Add assessors to grade student submissions.</p>
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                Add first assessor
              </button>
            </div>
          </div>
        )}

        {/* Submissions tab */}
        {activeTab === 'Submissions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Submissions</h3>
              <span className="text-xs bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-medium">{pendingSubmissions.length} pending</span>
            </div>
            <div className="flex flex-col gap-3">
              {pendingSubmissions.map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#4285f4] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f0f2f5] rounded-xl flex items-center justify-center text-xl shrink-0">📝</div>
                    <div>
                      <p className="text-sm font-medium text-[#202124]">{s.assignment}</p>
                      <p className="text-xs text-gray-400">{s.student} · {s.course}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Submitted {s.submitted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition">
                      ⬇ Download
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                      ✏️ Grade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates tab */}
        {activeTab === 'Certificates' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Certificates</h3>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                ⬆ Upload template
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="text-sm font-semibold text-[#202124] mb-1">No certificate templates yet</h4>
              <p className="text-xs text-gray-400 mb-4">Upload a PDF template per course. Student details will be auto-filled on download.</p>
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                Upload first template
              </button>
            </div>
          </div>
        )}

        {/* Announcements tab */}
        {activeTab === 'Announcements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Announcements</h3>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                ➕ New announcement
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3">
                {[
                  { title: 'New Level 7 Executive PA Diploma now available', date: '11 March 2026', dot: 'bg-[#4285f4]' },
                  { title: 'OTHM Level 7 Risk Management now enrolling', date: '6 February 2026', dot: 'bg-[#34a853]' },
                  { title: 'Logistics & Supply Chain Management course updated', date: '5 January 2026', dot: 'bg-[#fbbc04]' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#4285f4] transition gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${a.dot} shrink-0`}></div>
                      <div>
                        <p className="text-xs font-medium text-[#202124]">{a.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="text-[10px] px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition">Edit</button>
                      <button className="text-[10px] px-2.5 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}