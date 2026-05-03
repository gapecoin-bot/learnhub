'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';

const SUPPORT_PERMISSIONS = [
  { key: 'reset_passwords', label: 'Reset passwords', desc: 'Can reset student passwords', icon: '🔑' },
  { key: 'view_students', label: 'View all students', desc: 'Can view full student list', icon: '👥' },
  { key: 'manage_announcements', label: 'Manage announcements', desc: 'Can add and delete announcements', icon: '📢' },
  { key: 'view_login_logs', label: 'View login logs', desc: 'Can view all login activity', icon: '🔐' },
  { key: 'manage_enrolments', label: 'Manage enrolments', desc: 'Can approve and reject enrolments', icon: '📋' },
];

export default function SupportPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Messages');
  const [permissions, setPermissions] = useState([]);

  // ── Messages state ──
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [unreadTotal, setUnreadTotal] = useState(0);
  const messagesEndRef = useRef(null);
  const activeChannelRef = useRef(null);

  // ── Students state ──
  const [students, setStudents] = useState([]);
  const [resettingPassword, setResettingPassword] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  // ── Announcements state ──
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);

  // ── Enrolments state ──
  const [enrolmentRequests, setEnrolmentRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData || profileData.role !== 'support') { router.push('/login'); return; }
      setProfile(profileData);
      await fetchPermissions(session.user.id);
      await buildContactList(profileData);
      setLoading(false);
    };
    init();
    return () => {
      if (activeChannelRef.current) supabase.removeChannel(activeChannelRef.current);
    };
  }, []);

  const fetchPermissions = async (userId) => {
    const { data } = await supabase.from('support_permissions').select('permission').eq('support_id', userId);
    if (data) setPermissions(data.map(p => p.permission));
  };

  const hasPermission = (key) => permissions.includes(key);

  // ── Build contact list: super_admins + assessors by default, students only if they messaged support ──
  const buildContactList = async (profileData) => {
    const contactList = [];

    // 1. Super admins
    const { data: admins } = await supabase.from('profiles').select('id, first_name, last_name, role').eq('role', 'super_admin');
    (admins || []).forEach(a => {
      contactList.push({
        ...a,
        displayName: `${a.first_name} ${a.last_name}`,
        label: 'Super Admin',
        color: 'from-[#F5A623] to-[#e09400]',
        isActive: true,
        category: 'admin',
      });
    });

    // 2. Assessors
    const { data: assessors } = await supabase.from('profiles').select('id, first_name, last_name, role').eq('role', 'assessor');
    (assessors || []).forEach(a => {
      contactList.push({
        ...a,
        displayName: `${a.first_name} ${a.last_name}`,
        label: 'Assessor',
        color: 'from-[#fbbc04] to-[#ea4335]',
        isActive: true,
        category: 'assessor',
      });
    });

    // 3. Students who have messaged this support account
    const { data: studentMessages } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', profileData.id);
    const studentIds = [...new Set((studentMessages || []).map(m => m.sender_id))];
    if (studentIds.length > 0) {
      const { data: studentProfiles } = await supabase.from('profiles').select('id, first_name, last_name, role, student_id').in('id', studentIds).eq('role', 'student');
      (studentProfiles || []).forEach(s => {
        contactList.push({
          ...s,
          displayName: `${s.first_name} ${s.last_name}`,
          label: `Student · ${s.student_id || ''}`,
          color: 'from-[#34a853] to-[#1e8e3e]',
          isActive: true,
          category: 'student',
        });
      });
    }

    setContacts(contactList);
    await fetchUnreadCounts(profileData.id, contactList);
  };

  const fetchUnreadCounts = async (userId, contactList) => {
    const contactIds = contactList.map(c => c.id);
    if (!contactIds.length) return;
    const { data } = await supabase.from('messages').select('sender_id').eq('receiver_id', userId).eq('is_read', false).in('sender_id', contactIds);
    const counts = {};
    (data || []).forEach(m => { counts[m.sender_id] = (counts[m.sender_id] || 0) + 1; });
    setUnreadCounts(counts);
    setUnreadTotal(Object.values(counts).reduce((a, b) => a + b, 0));
  };

  const openConversation = async (contact) => {
    setSelectedContact(contact);
    setLoadingMessages(true);
    if (activeChannelRef.current) { await supabase.removeChannel(activeChannelRef.current); activeChannelRef.current = null; }
    const { data } = await supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', contact.id).eq('receiver_id', profile.id);
    const updatedCounts = { ...unreadCounts, [contact.id]: 0 };
    setUnreadCounts(updatedCounts);
    setUnreadTotal(Object.values(updatedCounts).reduce((a, b) => a + b, 0));
    const channel = supabase.channel(`support_chat_${profile.id}_${contact.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, async (payload) => {
        if (payload.new.sender_id === contact.id) {
          setMessages(prev => [...prev, payload.new]);
          await supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      }).subscribe();
    activeChannelRef.current = channel;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || sending) return;
    setSending(true);
    const { data } = await supabase.from('messages').insert({ sender_id: profile.id, receiver_id: selectedContact.id, message: newMessage.trim(), created_at: new Date().toISOString() }).select().single();
    if (data) { setMessages(prev => [...prev, data]); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }
    setNewMessage(''); setSending(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  const resetPassword = async (student) => {
    setResettingPassword(student.id);
    setResetResult(null);
    try {
      const res = await fetch('/api/support/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student.id, reset_by: profile.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setResetResult({ error: data.error, studentId: student.id }); }
      else { setResetResult({ success: true, studentId: student.id, newPassword: data.new_password, email: data.email }); }
    } catch (err) { setResetResult({ error: err.message, studentId: student.id }); }
    setResettingPassword(null);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  const addAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    setSavingAnnouncement(true);
    await supabase.from('announcements').insert({ title: newAnnouncement, body: newAnnouncement, is_published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    await fetchAnnouncements();
    setNewAnnouncement(''); setShowAddAnnouncement(false); setSavingAnnouncement(false);
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    await fetchAnnouncements();
  };

  const fetchEnrolments = async () => {
    const { data } = await supabase.from('enrolment_requests').select('*, course:courses(id, title, emoji)').order('created_at', { ascending: false });
    if (data) setEnrolmentRequests(data);
  };

  useEffect(() => {
    if (activeTab === 'Students' && hasPermission('view_students')) fetchStudents();
    if (activeTab === 'Announcements' && hasPermission('manage_announcements')) fetchAnnouncements();
    if (activeTab === 'Enrolments' && hasPermission('manage_enrolments')) fetchEnrolments();
  }, [activeTab, permissions]);

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDay = (ts) => {
    const d = new Date(ts); const today = new Date(); const yesterday = new Date(today);
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

  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';

  const baseTabs = ['Messages', 'Profile'];
  const permissionTabs = [
    hasPermission('view_students') && 'Students',
    hasPermission('manage_announcements') && 'Announcements',
    hasPermission('manage_enrolments') && 'Enrolments',
    hasPermission('view_login_logs') && 'Login Logs',
  ].filter(Boolean);

  const tabIcons = { Messages: '💬', Students: '👥', Announcements: '📢', Enrolments: '📋', 'Login Logs': '🔐', Profile: '👤' };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }// ── Contact categories for display ──
  const adminContacts = contacts.filter(c => c.category === 'admin');
  const assessorContacts = contacts.filter(c => c.category === 'assessor');
  const studentContacts = contacts.filter(c => c.category === 'student');

  return (
    <div className="flex min-h-screen font-sans">
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/support" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs shrink-0">LA</div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[10px] text-[#F5A623]/70">London · Support</span>
          </div>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">Support Team</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Support Panel</p>
        {[...baseTabs.slice(0, 1), ...permissionTabs, ...baseTabs.slice(1)].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === tab ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <span style={{ filter: 'grayscale(1)', opacity: activeTab === tab ? 1 : 0.6 }} className="text-base shrink-0">{tabIcons[tab]}</span>
            {tab}
            {tab === 'Messages' && unreadTotal > 0 && <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadTotal}</span>}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">
            <span style={{ filter: 'grayscale(1)', opacity: 0.6 }} className="text-base shrink-0">🚪</span>
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-60 bg-[#f0f2f5]">

        {/* ── TAB: Messages ── */}
        {activeTab === 'Messages' && (
          <div className="flex h-screen">
            {/* Contact list */}
            <div className={`w-full md:w-80 bg-white border-r border-gray-100 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-[#202124]">Messages</h2>
                <p className="text-xs text-gray-400 mt-0.5">{contacts.length} contacts</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Admin contacts */}
                {adminContacts.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-[#f8f9fa] border-b border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Admin</p>
                    </div>
                    {adminContacts.map(contact => {
                      const unread = unreadCounts[contact.id] || 0;
                      const isSelected = selectedContact?.id === contact.id;
                      return (
                        <button key={contact.id} onClick={() => openConversation(contact)}
                          className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition hover:bg-[#f8f9fa] ${isSelected ? 'bg-[#fff8e8] border-l-2 border-l-[#F5A623]' : ''}`}>
                          <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">
                            {contact.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#b87a00]' : 'text-[#202124]'}`}>{contact.displayName}</p>
                              {unread > 0 && <span className="bg-[#F5A623] text-[#0C0E13] text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-bold">{unread}</span>}
                            </div>
                            <p className="text-[10px] text-gray-400">{contact.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
                {/* Assessor contacts */}
                {assessorContacts.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-[#f8f9fa] border-b border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Assessors</p>
                    </div>
                    {assessorContacts.map(contact => {
                      const unread = unreadCounts[contact.id] || 0;
                      const isSelected = selectedContact?.id === contact.id;
                      return (
                        <button key={contact.id} onClick={() => openConversation(contact)}
                          className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition hover:bg-[#f8f9fa] ${isSelected ? 'bg-[#fff8e8] border-l-2 border-l-[#F5A623]' : ''}`}>
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fbbc04] to-[#ea4335] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {contact.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#b87a00]' : 'text-[#202124]'}`}>{contact.displayName}</p>
                              {unread > 0 && <span className="bg-[#F5A623] text-[#0C0E13] text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-bold">{unread}</span>}
                            </div>
                            <p className="text-[10px] text-gray-400">{contact.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
                {/* Student contacts — only those who messaged support */}
                {studentContacts.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-[#f8f9fa] border-b border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Students</p>
                    </div>
                    {studentContacts.map(contact => {
                      const unread = unreadCounts[contact.id] || 0;
                      const isSelected = selectedContact?.id === contact.id;
                      return (
                        <button key={contact.id} onClick={() => openConversation(contact)}
                          className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition hover:bg-[#f8f9fa] ${isSelected ? 'bg-[#fff8e8] border-l-2 border-l-[#F5A623]' : ''}`}>
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#34a853] to-[#1e8e3e] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {contact.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#b87a00]' : 'text-[#202124]'}`}>{contact.displayName}</p>
                              {unread > 0 && <span className="bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-bold">{unread}</span>}
                            </div>
                            <p className="text-[10px] text-gray-400">{contact.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
                {contacts.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm font-medium text-[#202124] mb-1">No contacts yet</p>
                    <p className="text-xs text-gray-400">Admin and assessors will appear here. Students appear when they message you.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat window */}
            <div className={`flex-1 flex flex-col bg-[#f8f9fa] ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
              {!selectedContact ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="text-sm font-semibold text-[#202124] mb-1">Select a conversation</h3>
                  <p className="text-xs text-gray-400">Choose a contact to start messaging.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-3 shadow-sm">
                    <button onClick={() => setSelectedContact(null)} className="md:hidden text-gray-400 hover:text-[#202124] transition mr-1 text-lg">←</button>
                    <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">
                      {selectedContact.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#202124]">{selectedContact.displayName}</p>
                      <p className="text-[10px] text-gray-400">{selectedContact.label}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                      </div>

                      
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="text-3xl mb-2">👋</div>
                        <p className="text-sm font-medium text-[#202124] mb-1">Start the conversation</p>
                        <p className="text-xs text-gray-400">Send a message to {selectedContact.displayName}</p>
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
                                    {selectedContact.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
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
                        placeholder={`Message ${selectedContact.displayName}...`}
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-[#202124] placeholder-gray-400 outline-none resize-none py-1 max-h-32"
                        style={{ minHeight: '24px' }}
                      />
                      <button onClick={sendMessage} disabled={sending || !newMessage.trim()}
                        className="w-8 h-8 rounded-xl bg-[#F5A623] flex items-center justify-center text-[#0C0E13] hover:opacity-90 transition disabled:opacity-40 shrink-0 mb-0.5">
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
        )}{/* ── TAB: Students ── */}
        {activeTab === 'Students' && hasPermission('view_students') && (
          <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Students</h3>
              <span className="text-xs text-gray-400">{students.length} total</span>
            </div>
            {resetResult?.success && (
              <div className="bg-[#e6f4ea] rounded-xl p-4 mb-4 border border-[#34a853]/20">
                <p className="text-xs font-semibold text-[#137333] mb-2">✓ Password reset successfully</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Email', value: resetResult.email },
                    { label: 'New password', value: resetResult.newPassword },
                  ].map(d => (
                    <div key={d.label} className="bg-white rounded-lg p-2 border border-gray-100">
                      <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                      <p className="text-xs font-mono font-medium text-[#202124]">{d.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#137333] mt-2">📧 New password emailed to student. Keep this as backup.</p>
                <button onClick={() => setResetResult(null)} className="text-[10px] text-gray-400 hover:underline mt-1">Dismiss</button>
              </div>
            )}
            {resetResult?.error && (
              <div className="bg-[#fce8e6] rounded-xl p-3 mb-4">
                <p className="text-xs text-[#c5221f]">⚠️ {resetResult.error}</p>
                <button onClick={() => setResetResult(null)} className="text-[10px] text-gray-400 hover:underline mt-1">Dismiss</button>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">School ID</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Username</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-8">No students yet</td></tr>
                  ) : students.map(s => (
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
                      <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-400 font-mono truncate max-w-[160px]">{s.username || '—'}</p></td>
                      <td className="px-4 py-3">
                        {hasPermission('reset_passwords') && (
                          <button
                            onClick={() => resetPassword(s)}
                            disabled={resettingPassword === s.id}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-[#F5A623] text-[#0C0E13] hover:opacity-90 transition disabled:opacity-60"
                          >
                            {resettingPassword === s.id ? '...' : '🔑 Reset password'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Announcements ── */}
        {activeTab === 'Announcements' && hasPermission('manage_announcements') && (
          <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Announcements</h3>
              <button onClick={() => setShowAddAnnouncement(!showAddAnnouncement)} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">➕ New</button>
            </div>
            {showAddAnnouncement && (
              <div className="bg-white rounded-xl border border-[#F5A623]/30 p-4 mb-4">
                <input type="text" placeholder="Announcement title..." value={newAnnouncement} onChange={e => setNewAnnouncement(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition mb-3" />
                <div className="flex gap-3">
                  <button onClick={addAnnouncement} disabled={savingAnnouncement} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">{savingAnnouncement ? 'Publishing...' : 'Publish'}</button>
                  <button onClick={() => setShowAddAnnouncement(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {announcements.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No announcements yet</p>}
              <div className="flex flex-col gap-3">
                {announcements.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#F5A623] transition gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#F5A623] shrink-0"></div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#202124] truncate">{a.title}</p>
                        <p className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteAnnouncement(a.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition shrink-0">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Enrolments ── */}
        {activeTab === 'Enrolments' && hasPermission('manage_enrolments') && (
          <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Enrolment Requests</h3>
              <span className="text-xs bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-medium">{enrolmentRequests.filter(r => r.status === 'pending').length} pending</span>
            </div>
            <div className="flex flex-col gap-3">
              {enrolmentRequests.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#202124]">{r.full_name}</p>
                      <p className="text-xs text-gray-400">{r.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.course?.emoji} {r.course?.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${r.status === 'pending' ? 'bg-[#fff8e1] text-[#f9a825]' : r.status === 'approved' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>{r.status}</span>
                    </div>
                    {r.payment_proof_url && (
                      <a href={r.payment_proof_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-xs hover:bg-[#fff8e8] transition">📄 View proof</a>
                    )}
                  </div>
                </div>
              ))}
              {enrolmentRequests.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-xs text-gray-400">No enrolment requests yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Login Logs ── */}
        {activeTab === 'Login Logs' && hasPermission('view_login_logs') && (
          <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Login Activity</h3>
              <span className="text-xs text-gray-400">All attempts tracked</span>
            </div>
            <LoginLogsTab />
          </div>
        )}

        {/* ── TAB: Profile ── */}
        {activeTab === 'Profile' && (
          <div className="p-4 md:p-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-2xl font-bold shrink-0">{initials}</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#202124]">{profile?.first_name} {profile?.last_name}</h3>
                  <p className="text-sm text-gray-400">{profile?.email}</p>
                  <span className="text-xs bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full border border-[#F5A623]/20 mt-1 inline-block">Support Team</span>
                </div>
              </div>
              {permissions.length > 0 && (
                <div className="bg-[#fff8e8] rounded-xl p-4 border border-[#F5A623]/20">
                  <p className="text-xs font-semibold text-[#b87a00] mb-2">Your permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map(p => (
                      <span key={p} className="text-[10px] bg-white text-[#b87a00] px-2 py-0.5 rounded-full border border-[#F5A623]/20">{p.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>
              )}
              {permissions.length === 0 && (
                <div className="bg-[#f8f9fa] rounded-xl p-4">
                  <p className="text-xs text-gray-400 italic">No extra permissions granted yet. Contact your admin.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ─── LOGIN LOGS TAB ───────────────────────────────────────────────────────────
function LoginLogsTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    supabase.from('login_logs').select('*').order('logged_in_at', { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setLogs(data); });
  }, []);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#f8f9fa] border-b border-gray-200">
          <tr>
            <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Email / Username</th>
            <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">IP</th>
            <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Status</th>
            <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-8">No login logs yet</td></tr>
          ) : logs.map(log => (
            <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3"><p className="text-xs text-[#202124] font-mono">{log.email}</p></td>
              <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-500 font-mono">{log.ip_address}</p></td>
              <td className="px-4 py-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${log.status === 'success' ? 'bg-[#e6f4ea] text-[#137333]' : log.status === 'suspended' ? 'bg-[#fff8e1] text-[#f9a825]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>{log.status}</span>
              </td>
              <td className="px-4 py-3"><p className="text-xs text-gray-400">{new Date(log.logged_in_at).toLocaleString()}</p></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}