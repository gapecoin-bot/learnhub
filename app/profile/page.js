'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Personal');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: 'Lycurgus',
    lastName: 'Wainaina',
    email: 'lycurgus@example.com',
    phone: '+44 7700 900000',
    dob: '1990-01-15',
    address: 'London, United Kingdom',
    studentId: 'LH-2024-00142',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = ['Personal', 'Security', 'Certificates', 'Notifications'];

  const certificates = [
    { title: 'Certificate in Safeguarding Adults', awarding: 'TQUK', date: 'March 2026', grade: '85%', status: 'Available' },
    { title: 'Unit 1 – Introduction to Care', awarding: 'TQUK', date: 'February 2026', grade: '78%', status: 'Available' },
  ];

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
        <Link href="/assignments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition">📝 Assignments</Link>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mt-4 mb-1">Account</p>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-white/10 text-sm">👤 Profile</Link>
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
        <Link href="/assignments" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">📝</span>
          <span className="text-[10px]">Assignments</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-white">
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
            <p className="text-sm text-gray-400">Manage your account</p>
            <h2 className="text-xl font-semibold text-[#202124]">My Profile</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#202124]">{form.firstName} {form.lastName}</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-sm font-medium">
              {form.firstName[0]}{form.lastName[0]}
            </div>
          </div>
        </div>

        {/* Mobile title */}
        <div className="md:hidden mb-4">
          <p className="text-sm text-gray-400">Manage your account</p>
          <h2 className="text-lg font-semibold text-[#202124]">My Profile</h2>
        </div>

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-2xl md:text-3xl font-bold shrink-0">
              {form.firstName[0]}{form.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold text-[#202124]">{form.firstName} {form.lastName}</h3>
              <p className="text-sm text-gray-400">{form.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">Student</span>
                <span className="text-xs bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">Active</span>
                <span className="text-xs text-gray-400">ID: {form.studentId}</span>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition shrink-0">
              Change photo
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Courses enrolled', value: '6', color: 'text-[#4285f4]' },
              { label: 'Certificates earned', value: '2', color: 'text-[#34a853]' },
              { label: 'Assignments done', value: '8', color: 'text-[#fbbc04]' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-5 py-2.5 text-xs md:text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 transition ${activeTab === tab ? 'border-[#4285f4] text-[#4285f4]' : 'border-transparent text-gray-500 hover:text-[#202124]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Personal tab */}
        {activeTab === 'Personal' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-[#202124] mb-5">Personal information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: 'First name', name: 'firstName', type: 'text' },
                { label: 'Last name', name: 'lastName', type: 'text' },
                { label: 'Email address', name: 'email', type: 'email' },
                { label: 'Phone number', name: 'phone', type: 'tel' },
                { label: 'Date of birth', name: 'dob', type: 'date' },
                { label: 'Address', name: 'address', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#4285f4] focus:ring-2 focus:ring-[#4285f4]/10 transition"
                  />
                </div>
              ))}
            </div>

            {/* Student ID — read only */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#202124] mb-1.5">Student ID</label>
              <input
                type="text"
                value={form.studentId}
                readOnly
                className="w-full md:w-1/2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 outline-none cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Your student ID cannot be changed.</p>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition"
              >
                Save changes
              </button>
              {saved && (
                <span className="text-xs text-[#34a853] flex items-center gap-1">
                  ✓ Changes saved successfully
                </span>
              )}
            </div>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'Security' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-5">Change password</h3>
              <div className="flex flex-col gap-4 max-w-md">
                {[
                  { label: 'Current password', name: 'current' },
                  { label: 'New password', name: 'new' },
                  { label: 'Confirm new password', name: 'confirm' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">{field.label}</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm outline-none focus:border-[#4285f4] transition"
                    />
                  </div>
                ))}
                <button className="w-fit px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition">
                  Update password
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-2">Two-factor authentication</h3>
              <p className="text-xs text-gray-400 mb-4">Add an extra layer of security to your account.</p>
              <button className="px-5 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] text-xs font-medium hover:bg-[#e8f0fe] transition">
                Enable 2FA
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#ea4335]/20 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-[#ea4335] mb-2">Danger zone</h3>
              <p className="text-xs text-gray-400 mb-4">Once you delete your account all your data will be permanently removed.</p>
              <button className="px-5 py-2 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs font-medium hover:bg-[#fce8e6] transition">
                Delete account
              </button>
            </div>
          </div>
        )}

        {/* Certificates tab */}
        {activeTab === 'Certificates' && (
          <div className="flex flex-col gap-4">
            {certificates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-sm font-semibold text-[#202124] mb-1">No certificates yet</h3>
                <p className="text-xs text-gray-400 mb-4">Complete a course and pass your assignments to earn certificates.</p>
                <Link href="/courses" className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                  View my courses
                </Link>
              </div>
            ) : (
              certificates.map((cert, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#e6f4ea] rounded-xl flex items-center justify-center text-2xl shrink-0">🏆</div>
                    <div>
                      <p className="text-sm font-semibold text-[#202124]">{cert.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Awarded by {cert.awarding} · {cert.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">Grade: {cert.grade}</span>
                        <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">{cert.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#4285f4] hover:text-[#4285f4] transition">
                      Preview
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                      ⬇ Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === 'Notifications' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-[#202124] mb-5">Notification preferences</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Assignment due reminders', desc: 'Get notified 3 days before an assignment is due', on: true },
                { label: 'Assignment graded', desc: 'Get notified when your tutor has graded your work', on: true },
                { label: 'New course announcements', desc: 'Stay updated with new courses and offers', on: true },
                { label: 'Course progress reminders', desc: 'Weekly reminders to keep up with your learning', on: false },
                { label: 'Marketing emails', desc: 'Receive promotional offers and updates from LearnHub', on: false },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-[#202124]">{n.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition shrink-0 ${n.on ? 'bg-[#34a853]' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${n.on ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition">
              Save preferences
            </button>
          </div>
        )}

      </main>
    </div>
  );
}