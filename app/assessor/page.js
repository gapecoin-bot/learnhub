'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';

// ─── PERMISSION TAB: Announcements ───────────────────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAnnouncements(data); });
  }, []);
  const add = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await supabase.from('announcements').insert({ title: newTitle, body: newTitle, is_published: true });
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
    setNewTitle(''); setShowAdd(false); setSaving(false);
  };
  const remove = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#202124]">Announcements</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">➕ New</button>
      </div>
      {showAdd && (
        <div className="bg-white rounded-xl border border-[#F5A623]/30 p-4 mb-4">
          <input type="text" placeholder="Announcement title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition mb-3" />
          <div className="flex gap-3">
            <button onClick={add} disabled={saving} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">{saving ? 'Publishing...' : 'Publish'}</button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {announcements.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No announcements yet</p>}
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#F5A623] transition gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#F5A623] shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#202124] truncate">{a.title}</p>
                  <p className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <button onClick={() => remove(a.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition shrink-0">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PERMISSION TAB: All Students ─────────────────────────────────────────────
function AllStudentsTab() {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setStudents(data); });
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#202124]">All Students</h3>
        <span className="text-xs text-gray-400">{students.length} total</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8f9fa] border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Student ID</th>
              <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-xs text-gray-400 py-8">No students yet</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-medium shrink-0">
                      {`${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#202124]">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] text-gray-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-500 font-mono">{s.student_id}</p></td>
                <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PERMISSION TAB: Enrolments ───────────────────────────────────────────────
function EnrolmentsTab({ profile }) {
  const [requests, setRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  useEffect(() => {
    supabase.from('enrolment_requests').select('*, course:courses(id, title, emoji)').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRequests(data); });
  }, []);
  const approve = async (req) => {
    setProcessingId(req.id);
    await supabase.from('enrolment_requests').update({ status: 'approved', reviewed_by: profile.id, reviewed_at: new Date().toISOString() }).eq('id', req.id);
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    setProcessingId(null);
  };
  const reject = async (req) => {
    setProcessingId(req.id);
    await supabase.from('enrolment_requests').update({ status: 'rejected', reviewed_by: profile.id, reviewed_at: new Date().toISOString() }).eq('id', req.id);
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
    setProcessingId(null);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#202124]">Enrolment Requests</h3>
        <span className="text-xs bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full">{requests.filter(r => r.status === 'pending').length} pending</span>
      </div>
      {requests.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><p className="text-xs text-gray-400">No enrolment requests yet.</p></div>}
      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#202124]">{r.full_name}</p>
                <p className="text-xs text-gray-400">{r.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.course?.emoji} {r.course?.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${r.status === 'pending' ? 'bg-[#fff8e1] text-[#f9a825]' : r.status === 'approved' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>{r.status}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  {r.payment_proof_url && <a href={r.payment_proof_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-xs hover:bg-[#fff8e8] transition">📄 Proof</a>}
                  <button onClick={() => approve(r)} disabled={processingId === r.id} className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs hover:opacity-90 transition disabled:opacity-60">✅ Approve</button>
                  <button onClick={() => reject(r)} disabled={processingId === r.id} className="px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs hover:bg-[#fce8e6] transition disabled:opacity-60">❌ Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PERMISSION TAB: Certificates ─────────────────────────────────────────────
function CertificatesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#202124]">Certificate Templates</h3>
        <button className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">⬆ Upload template</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <h4 className="text-sm font-semibold text-[#202124] mb-1">No certificate templates yet</h4>
        <p className="text-xs text-gray-400">Upload a PDF template per course.</p>
      </div>
    </div>
  );
}

// ─── ALL COURSES for assessors with edit_courses permission ───────────────────
function AllCoursesForAssessor({ assessorId }) {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    supabase.from('courses').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setCourses(data); });
  }, []);
  const unassigned = courses.filter(c => c.assessor_id !== assessorId);
  if (unassigned.length === 0) return <p className="text-xs text-gray-400">No other courses available.</p>;
  return (
    <div className="flex flex-col gap-3">
      {unassigned.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#F5A623] transition overflow-hidden">
          <div className="flex items-center justify-between p-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">{c.emoji || '📚'}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#202124] truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">{c.category}</span>
                  <span className="text-[10px] text-[#34a853] font-medium">£{c.price}</span>
                </div>
              </div>
            </div>
            <Link href={`/assessor/courses/${c.id}`} className="px-4 py-2 rounded-lg border border-[#F5A623] text-[#b87a00] text-xs font-medium hover:bg-[#fff8e8] transition">✏️ Edit</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ASSESSOR MESSAGES COMPONENT ─────────────────────────────────────────────
function AssessorMessages({ profile, assignedCourses, onUnreadChange }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const activeChannelRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    return () => {
      if (activeChannelRef.current) {
        supabase.removeChannel(activeChannelRef.current);
      }
    };
  }, [assignedCourses]);

  const fetchStudents = async () => {
    if (!assignedCourses || assignedCourses.length === 0) return;
    const courseIds = assignedCourses.map(c => c.id);
    const { data: enrolments } = await supabase
      .from('enrolments')
      .select('student_id, course_id')
      .in('course_id', courseIds)
      .eq('is_active', true);
    if (!enrolments || enrolments.length === 0) return;
    const studentIds = [...new Set(enrolments.map(e => e.student_id))];
    const { data: studentProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', studentIds);
    if (studentProfiles) {
      const studentsWithCourse = studentProfiles.map(s => {
        const enrolment = enrolments.find(e => e.student_id === s.id);
        const course = assignedCourses.find(c => c.id === enrolment?.course_id);
        return { ...s, courseName: course?.title || '', courseEmoji: course?.emoji || '📚' };
      });
      setStudents(studentsWithCourse);
      fetchUnreadCounts(studentIds);
    }
  };

  const fetchUnreadCounts = async (studentIds) => {
    if (!studentIds.length) return;
    const { data } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', profile.id)
      .eq('is_read', false)
      .in('sender_id', studentIds);
    const counts = {};
    (data || []).forEach(m => { counts[m.sender_id] = (counts[m.sender_id] || 0) + 1; });
    setUnreadCounts(counts);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    onUnreadChange(total);
  };

  const openConversation = async (student) => {
    setSelectedStudent(student);
    setLoadingMessages(true);
    if (activeChannelRef.current) {
      await supabase.removeChannel(activeChannelRef.current);
      activeChannelRef.current = null;
    }
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${student.id}),and(sender_id.eq.${student.id},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', student.id).eq('receiver_id', profile.id);

    // ── Fix: update counts without calling onUnreadChange inside setState ──
    const updatedCounts = { ...unreadCounts, [student.id]: 0 };
    setUnreadCounts(updatedCounts);
    const total = Object.values(updatedCounts).reduce((a, b) => a + b, 0);
    onUnreadChange(total);

    const channel = supabase
      .channel(`assessor_chat_${profile.id}_${student.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, async (payload) => {
        if (payload.new.sender_id === student.id) {
          setMessages(prev => [...prev, payload.new]);
          await supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      })
      .subscribe();
    activeChannelRef.current = channel;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || sending) return;
    setSending(true);
    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: profile.id, receiver_id: selectedStudent.id, message: newMessage.trim(), created_at: new Date().toISOString() })
      .select().single();
    if (data) {
      setMessages(prev => [...prev, data]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    setNewMessage('');
    setSending(false);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDay = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const groupedMessages = messages.reduce((groups, msg) => {
    const day = formatDay(msg.created_at);
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
    return groups;
  }, {});

  if (assignedCourses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3">💬</div>
        <h4 className="text-sm font-semibold text-[#202124] mb-1">No courses assigned</h4>
        <p className="text-xs text-gray-400">You need to be assigned to a course before you can message students.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
      <div className="flex h-full">
        {/* ── Student list ── */}
        <div className={`w-full md:w-72 border-r border-gray-100 flex flex-col ${selectedStudent ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#202124]">Students</h3>
            <p className="text-xs text-gray-400 mt-0.5">{students.length} enrolled in your courses</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-xs text-gray-400">No students enrolled in your courses yet.</p>
              </div>
            ) : students.map(student => {
              const unread = unreadCounts[student.id] || 0;
              const isSelected = selectedStudent?.id === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => openConversation(student)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition hover:bg-[#f8f9fa] ${isSelected ? 'bg-[#fff8e8] border-l-2 border-l-[#F5A623]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">
                    {`${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#b87a00]' : 'text-[#202124]'}`}>
                        {student.first_name} {student.last_name}
                      </p>
                      {unread > 0 && <span className="bg-[#F5A623] text-[#0C0E13] text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-bold">{unread}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{student.courseEmoji} {student.courseName}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className={`flex-1 flex flex-col bg-[#f8f9fa] ${selectedStudent ? 'flex' : 'hidden md:flex'}`}>
          {!selectedStudent ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-4xl mb-3">💬</div>
              <h4 className="text-sm font-semibold text-[#202124] mb-1">Select a student</h4>
              <p className="text-xs text-gray-400">Choose a student to start or continue a conversation.</p>
            </div>
          ) : (
            <>
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <button onClick={() => setSelectedStudent(null)} className="md:hidden text-gray-400 hover:text-[#202124] transition mr-1 text-lg">←</button>
                <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">
                  {`${selectedStudent.first_name?.[0] || ''}${selectedStudent.last_name?.[0] || ''}`.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#202124]">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  <p className="text-[10px] text-gray-400">{selectedStudent.courseEmoji} {selectedStudent.courseName} · {selectedStudent.student_id}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="text-3xl mb-2">👋</div>
                    <p className="text-sm font-medium text-[#202124] mb-1">Start the conversation</p>
                    <p className="text-xs text-gray-400">Send a message to {selectedStudent.first_name}</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([day, dayMessages]) => (
                    <div key={day}>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-white rounded-full border border-gray-100">{day}</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      {dayMessages.map((msg, i) => {
                        const isMine = msg.sender_id === profile.id;
                        const nextMsg = dayMessages[i + 1];
                        const isLast = i === dayMessages.length - 1;
                        return (
                          <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {!isMine && (
                              <div className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-[10px] font-bold shrink-0">
                                {`${selectedStudent.first_name?.[0] || ''}${selectedStudent.last_name?.[0] || ''}`.toUpperCase()}
                              </div>
                            )}
                            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-[#F5A623] text-[#0C0E13] rounded-br-sm' : 'bg-white text-[#202124] rounded-bl-sm border border-gray-100 shadow-sm'}`}>
                                {msg.message}
                              </div>
                              {(isLast || (nextMsg && nextMsg.sender_id !== msg.sender_id)) && (
                                <p className="text-[10px] text-gray-400 mt-1">{formatTime(msg.created_at)}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="bg-white border-t border-gray-100 px-4 py-3">
                <div className="flex items-end gap-2 bg-[#f8f9fa] rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-[#F5A623] transition">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={`Message ${selectedStudent.first_name}...`}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-[#202124] placeholder-gray-400 outline-none resize-none py-1 max-h-32"
                    style={{ minHeight: '24px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="w-8 h-8 rounded-xl bg-[#F5A623] flex items-center justify-center text-[#0C0E13] hover:opacity-90 transition disabled:opacity-40 shrink-0 mb-0.5"
                  >
                    {sending
                      ? <span className="w-3.5 h-3.5 border-2 border-[#0C0E13] border-t-transparent rounded-full animate-spin" />
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    }
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}export default function AssessorPanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Submissions');
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);
  const [gradeSaved, setGradeSaved] = useState(false);
  const [gradeError, setGradeError] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', address: '' });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!data || !['assessor', 'super_admin'].includes(data.role)) { router.push('/dashboard'); return; }
      setProfile(data);
      setProfileForm({ phone: data.phone || '', address: data.address || '' });
      fetchAssignedCourses(session.user.id);
      fetchPermissions(session.user.id);
      fetchStudents();
      fetchUnreadMessages(session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchAssignedCourses = async (userId) => {
    const { data } = await supabase.from('courses').select('*').eq('assessor_id', userId);
    if (data) { setAssignedCourses(data); fetchSubmissions(data.map(c => c.id)); }
  };

  const fetchSubmissions = async (courseIds) => {
    if (!courseIds || courseIds.length === 0) { setSubmissions([]); return; }
    const { data: assignmentData } = await supabase.from('assignments').select('id, title, submission_guide, instructions_url, instructions_filename, deadline, course_id').in('course_id', courseIds);
    if (!assignmentData || assignmentData.length === 0) { setSubmissions([]); return; }
    const assignmentIds = assignmentData.map(a => a.id);
    const { data } = await supabase.from('submissions').select(`*, student:profiles!submissions_student_id_fkey(id, first_name, last_name, email, student_id), assignment:assignments(id, title, description, submission_guide, instructions_url, instructions_filename, deadline, course:courses(id, title, category, emoji))`).in('assignment_id', assignmentIds).order('submitted_at', { ascending: false });
    if (data) setSubmissions(data);
  };

  const fetchPermissions = async (userId) => {
    const { data } = await supabase.from('assessor_permissions').select('permission').eq('assessor_id', userId);
    if (data) setPermissions(data.map(p => p.permission));
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  const fetchUnreadMessages = async (userId) => {
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', userId).eq('is_read', false);
    setUnreadMessages(count || 0);
  };

  const handleGradeSubmit = async () => {
    setGradeError('');
    if (!gradeForm.grade) { setGradeError('Please select a grade.'); return; }
    if (!gradeForm.feedback.trim()) { setGradeError('Please provide feedback.'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('submissions').update({
      grade: gradeForm.grade, feedback: gradeForm.feedback,
      status: 'graded', assessor_id: profile.id,
      is_locked: true, graded_at: new Date().toISOString(),
    }).eq('id', selectedSubmission.id);
    setSubmitting(false);
    if (error) { setGradeError(error.message); return; }
    setGradeSaved(true);
    await fetchSubmissions(assignedCourses.map(c => c.id));
    setTimeout(() => { setGradeSaved(false); setSelectedSubmission(null); setGradeForm({ grade: '', feedback: '' }); }, 2000);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ phone: profileForm.phone, address: profileForm.address }).eq('id', profile.id);
    setSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  const hasPermission = (key) => permissions.includes(key);
  const pending = submissions.filter(s => s.status === 'submitted');
  const graded = submissions.filter(s => s.status === 'graded');
  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';
  const baseTabs = ['Submissions', 'Graded', 'My Courses', 'My Students', 'Messages', 'Profile'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading assessor panel...</p>
        </div>
      </div>
    );
  }return (
    <div className="flex min-h-screen font-sans">
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/assessor" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs shrink-0">LA</div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[10px] text-[#F5A623]/70">London · Assessor</span>
          </div>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">Assessor</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Assessor Panel</p>
        {baseTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === tab ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <span style={{ filter: 'grayscale(1)', opacity: activeTab === tab ? 1 : 0.6 }} className="text-base shrink-0">
              {tab === 'Submissions' && '📝'}
              {tab === 'Graded' && '✅'}
              {tab === 'My Courses' && '📚'}
              {tab === 'My Students' && '👥'}
              {tab === 'Messages' && '💬'}
              {tab === 'Profile' && '👤'}
            </span>
            {tab}
            {tab === 'Submissions' && pending.length > 0 && (
              <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pending.length}</span>
            )}
            {tab === 'Messages' && unreadMessages > 0 && (
              <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadMessages}</span>
            )}
          </button>
        ))}
        {permissions.length > 0 && (
          <>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mt-4 mb-1">Extra Access</p>
            {hasPermission('manage_announcements') && <button onClick={() => setActiveTab('Announcements')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === 'Announcements' ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>📢 Announcements</button>}
            {hasPermission('view_all_students') && <button onClick={() => setActiveTab('All Students')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === 'All Students' ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>👥 All Students</button>}
            {hasPermission('manage_enrolments') && <button onClick={() => setActiveTab('Enrolments')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === 'Enrolments' ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>📋 Enrolments</button>}
            {hasPermission('upload_certificates') && <button onClick={() => setActiveTab('Certificates')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === 'Certificates' ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>🏆 Certificates</button>}
          </>
        )}
        <div className="mt-auto pt-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">
            <span style={{ filter: 'grayscale(1)', opacity: 0.6 }} className="text-base shrink-0">🚪</span>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 z-50 flex items-center justify-around px-2 py-3">
        {baseTabs.filter(t => t !== 'Profile').map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 relative ${activeTab === tab ? 'text-[#F5A623]' : 'text-gray-400'}`}>
            <span className="text-lg" style={{ filter: 'grayscale(1)', opacity: activeTab === tab ? 1 : 0.6 }}>
              {tab === 'Submissions' && '📝'}
              {tab === 'Graded' && '✅'}
              {tab === 'My Courses' && '📚'}
              {tab === 'My Students' && '👥'}
              {tab === 'Messages' && '💬'}
            </span>
            <span className="text-[10px]">{tab === 'My Courses' ? 'Courses' : tab === 'My Students' ? 'Students' : tab}</span>
            {tab === 'Submissions' && pending.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{pending.length}</span>}
            {tab === 'Messages' && unreadMessages > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>}
          </button>
        ))}
      </nav>

      <main className="flex-1 md:ml-60 bg-[#f0f2f5] p-4 md:p-8 pb-24 md:pb-8">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <Link href="/assessor" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs">LA</div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
              <span className="text-[10px] text-[#F5A623]/70">London · Assessor</span>
            </div>
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-medium">{initials}</div>
        </div>

        {/* ── Desktop top bar ── */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Assessor dashboard</p>
            <h2 className="text-xl font-semibold text-[#202124]">Welcome, {profile?.first_name} 👋</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#202124]">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-[#F5A623]">Assessor</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-sm font-bold">{initials}</div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {[
            { label: 'Pending', value: pending.length, color: 'text-[#ea4335]' },
            { label: 'Graded', value: graded.length, color: 'text-[#34a853]' },
            { label: 'My Courses', value: assignedCourses.length, color: 'text-[#F5A623]' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Assigned courses banner ── */}
        {assignedCourses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-xs font-semibold text-[#202124] mb-2">📚 Your assigned courses</p>
            <div className="flex flex-wrap gap-2">
              {assignedCourses.map((c) => (
                <span key={c.id} className="text-xs bg-[#fff8e8] text-[#b87a00] px-3 py-1 rounded-full border border-[#F5A623]/20">{c.emoji} {c.title}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── MODAL: Grade submission ── */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#202124]">Grade Submission</h3>
                <button onClick={() => { setSelectedSubmission(null); setGradeForm({ grade: '', feedback: '' }); setGradeError(''); }} className="text-gray-400 hover:text-[#202124] text-lg">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-[#f8f9fa] rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 mb-1">Student</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedSubmission.student?.first_name} {selectedSubmission.student?.last_name}</p>
                  <p className="text-xs text-gray-400">{selectedSubmission.student?.email}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {selectedSubmission.student?.student_id}</p>
                </div>
                <div className="bg-[#f8f9fa] rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 mb-1">Assignment</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedSubmission.assignment?.title}</p>
                  <p className="text-xs text-gray-400">{selectedSubmission.assignment?.course?.emoji} {selectedSubmission.assignment?.course?.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Submitted {new Date(selectedSubmission.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedSubmission.assignment?.instructions_url && (
                <div className="bg-[#fff8e8] rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-[#b87a00] mb-2">📎 Assessment instructions</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#202124]">{selectedSubmission.assignment?.instructions_filename || 'Instructions file'}</p>
                      <p className="text-[10px] text-gray-400">Download to review what the student was asked to do</p>
                    </div>
                    <a href={selectedSubmission.assignment.instructions_url} download target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition shrink-0">⬇ Download</a>
                  </div>
                </div>
              )}
              {selectedSubmission.assignment?.submission_guide && (
                <div className="bg-[#fff8e1] rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-[#f9a825] mb-2">📝 Submission guide given to student</p>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedSubmission.assignment.submission_guide}</p>
                </div>
              )}
              {selectedSubmission.file_url && (
                <div className="bg-[#e6f4ea] rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-[#137333] mb-2">📄 Student submission</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#202124]">Submitted file</p>
                      <p className="text-[10px] text-gray-400">Click to download and review</p>
                    </div>
                    <a href={selectedSubmission.file_url} download target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#34a853] text-white text-xs font-medium hover:opacity-90 transition shrink-0">⬇ Download</a>
                  </div>
                </div>
              )}
              {selectedSubmission.notes && (
                <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-[#202124] mb-1">Student notes:</p>
                  <p className="text-xs text-gray-500">{selectedSubmission.notes}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-[#202124] mb-3">Grade this submission</p>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">Grade</label>
                  <select value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition">
                    <option value="">Select grade...</option>
                    {['100%', '95%', '90%', '85%', '80%', '75%', '70%', '65%', '60%', '55%', '50%', 'Fail'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">Feedback for student</label>
                  <textarea rows={4} value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Provide detailed, constructive feedback..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition resize-none" />
                </div>
                {gradeError && <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><span>⚠️</span><span>{gradeError}</span></div>}
                {gradeSaved && <div className="bg-[#e6f4ea] text-[#137333] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><span>✓</span><span>Grade submitted and locked successfully!</span></div>}
                <div className="bg-[#fff8e1] text-[#f9a825] text-xs px-3 py-2 rounded-lg mb-4 flex items-start gap-2">
                  <span>⚠️</span><span>Once submitted, grades are locked and cannot be changed without Super Admin approval.</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setSelectedSubmission(null); setGradeForm({ grade: '', feedback: '' }); setGradeError(''); }} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
                  <button onClick={handleGradeSubmit} disabled={!gradeForm.grade || !gradeForm.feedback || submitting || gradeSaved} className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-[#0C0E13] border-t-transparent rounded-full animate-spin"></span>Submitting...</span> : gradeSaved ? '✓ Graded!' : '🔒 Submit & Lock Grade'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Submissions ── */}
        {activeTab === 'Submissions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#202124]">Pending submissions</h3>
              <span className="text-xs bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-medium">{pending.length} to grade</span>
            </div>
            {assignedCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📚</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No courses assigned yet</h4>
                <p className="text-xs text-gray-400">Ask your admin to assign you to a course so you can start grading.</p>
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">All caught up!</h4>
                <p className="text-xs text-gray-400">No pending submissions to grade right now.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#F5A623] transition overflow-hidden">
                    <div className="flex items-start justify-between gap-4 p-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fff8e8] rounded-xl flex items-center justify-center text-xl shrink-0">📝</div>
                        <div>
                          <p className="text-sm font-medium text-[#202124]">{s.assignment?.title}</p>
                          <p className="text-xs text-gray-400">{s.student?.first_name} {s.student?.last_name} · ID: {s.student?.student_id}</p>
                          <p className="text-xs text-gray-400">{s.assignment?.course?.emoji} {s.assignment?.course?.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Submitted {new Date(s.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.file_url && <a href={s.file_url} download target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#F5A623] hover:text-[#b87a00] transition">⬇ Download</a>}
                        <button onClick={() => { setSelectedSubmission(s); setGradeForm({ grade: '', feedback: '' }); setGradeError(''); }} className="text-xs px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] hover:opacity-90 transition">✏️ Grade</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-2 bg-[#f8f9fa] border-t border-gray-100 flex-wrap">
                      {s.assignment?.deadline && <span className="text-[10px] text-gray-500">📅 Deadline: {new Date(s.assignment.deadline).toLocaleDateString()}</span>}
                      {s.assignment?.instructions_url && <a href={s.assignment.instructions_url} download target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#F5A623] hover:underline">📎 Download instructions</a>}
                      {s.notes && <span className="text-[10px] text-gray-500 truncate max-w-xs">💬 Note: {s.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Graded ── */}
        {activeTab === 'Graded' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#202124]">Graded submissions</h3>
              <span className="text-xs bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-medium">{graded.length} graded</span>
            </div>
            {graded.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No graded submissions yet</h4>
                <p className="text-xs text-gray-400">Graded submissions will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {graded.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-[#34a853]/20 overflow-hidden">
                    <div className="flex items-start justify-between gap-4 p-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e6f4ea] rounded-xl flex items-center justify-center text-xl shrink-0">✅</div>
                        <div>
                          <p className="text-sm font-medium text-[#202124]">{s.assignment?.title}</p>
                          <p className="text-xs text-gray-400">{s.student?.first_name} {s.student?.last_name} · {s.assignment?.course?.emoji} {s.assignment?.course?.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Graded {new Date(s.graded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-medium">{s.grade}</span>
                        <span className="text-[10px] bg-[#f0f2f5] text-gray-400 px-2 py-1 rounded-full">🔒 Locked</span>
                      </div>
                    </div>
                    {s.feedback && (
                      <div className="px-4 pb-4">
                        <div className="bg-[#f8f9fa] rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 mb-1">Your feedback</p>
                          <p className="text-xs text-gray-600">{s.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: My Courses ── */}
        {activeTab === 'My Courses' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#202124]">My assigned courses</h3>
            </div>
            {assignedCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📚</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No courses assigned yet</h4>
                <p className="text-xs text-gray-400">Ask your admin to assign you to a course.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assignedCourses.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#F5A623] transition overflow-hidden">
                    <div className="flex items-center justify-between p-4 gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{c.emoji || '📚'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#202124] truncate">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">{c.category}</span>
                            <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.level}</span>
                            <span className="text-[10px] text-[#34a853] font-medium">£{c.price}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/assessor/courses/${c.id}`} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition shrink-0">✏️ Edit course</Link>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-2 bg-[#f8f9fa] border-t border-gray-100 flex-wrap">
                      <span className="text-[10px] text-gray-500">📜 {c.awarding_body}</span>
                      <span className="text-[10px] text-gray-500">⏱ {c.duration}</span>
                      <span className="text-[10px] text-[#34a853]">✅ Assigned to you</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {hasPermission('edit_courses') && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-[#202124] mb-3">All courses (edit permission granted)</h3>
                <AllCoursesForAssessor assessorId={profile.id} />
              </div>
            )}
          </div>
        )}

        {/* ── TAB: My Students ── */}
        {activeTab === 'My Students' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#202124]">Students in my courses</h3>
            </div>
            {assignedCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">No courses assigned</h4>
                <p className="text-xs text-gray-400">Students from your assigned courses will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#f8f9fa] border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Student</th>
                      <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Student ID</th>
                      <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-xs text-gray-400 py-8">No students enrolled yet</td></tr>
                    ) : students.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-medium shrink-0">
                              {`${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#202124]">{s.first_name} {s.last_name}</p>
                              <p className="text-[10px] text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-500 font-mono">{s.student_id}</p></td>
                        <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Messages ── */}
        {activeTab === 'Messages' && (
          <AssessorMessages
            profile={profile}
            assignedCourses={assignedCourses}
            onUnreadChange={setUnreadMessages}
          />
        )}

        {/* ── TAB: Profile ── */}
        {activeTab === 'Profile' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-2xl font-bold shrink-0">{initials}</div>
              <div>
                <h3 className="text-lg font-semibold text-[#202124]">{profile?.first_name} {profile?.last_name}</h3>
                <p className="text-sm text-gray-400">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full border border-[#F5A623]/20">Assessor</span>
                  {profile?.student_id && <span className="text-xs text-gray-400 font-mono">ID: {profile.student_id}</span>}
                </div>
              </div>
            </div>
            {permissions.length > 0 && (
              <div className="bg-[#fff8e8] rounded-xl p-4 mb-6 border border-[#F5A623]/20">
                <p className="text-xs font-semibold text-[#b87a00] mb-2">Your extra permissions</p>
                <div className="flex flex-wrap gap-1">
                  {permissions.map(p => (
                    <span key={p} className="text-[10px] bg-white text-[#b87a00] px-2 py-0.5 rounded-full border border-[#F5A623]/20">{p.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            )}
            <h4 className="text-sm font-semibold text-[#202124] mb-4">Update information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">First name</label>
                <input type="text" defaultValue={profile?.first_name} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Last name</label>
                <input type="text" defaultValue={profile?.last_name} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Phone number</label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Address</label>
                <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Email address</label>
                <input type="email" value={profile?.email} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400 outline-none cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleProfileSave} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {profileSaved && <span className="text-xs text-[#34a853]">✓ Changes saved</span>}
            </div>
          </div>
        )}

        {/* ── EXTRA PERMISSION TABS ── */}
        {activeTab === 'Announcements' && hasPermission('manage_announcements') && <AnnouncementsTab />}
        {activeTab === 'All Students' && hasPermission('view_all_students') && <AllStudentsTab />}
        {activeTab === 'Enrolments' && hasPermission('manage_enrolments') && <EnrolmentsTab profile={profile} />}
        {activeTab === 'Certificates' && hasPermission('upload_certificates') && <CertificatesTab />}

      </main>
    </div>
  );
}