'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';

// ─── GRAY EMOJI ───────────────────────────────────────────────────────────────
const GE = ({ children, size = 'text-base', opacity = 0.6 }) => (
  <span style={{ filter: 'grayscale(1)', opacity }} className={`${size} shrink-0`}>{children}</span>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md', color = 'from-[#4285f4] to-[#34a853]' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [courseId, setCourseId] = useState(null);

  const messagesEndRef = useRef(null);
  const activeChannelRef = useRef(null); // tracks active realtime channel for cleanup
  const router = useRouter();

  // ─── INIT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData) { router.push('/login'); return; }
      setProfile(profileData);

      await buildContactList(profileData);
      setLoading(false);
    };
    init();

    // ── Cleanup realtime on unmount ──
    return () => {
      if (activeChannelRef.current) {
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
    };
  }, []);

  // ─── BUILD CONTACT LIST ────────────────────────────────────────────────────
  const buildContactList = async (profileData) => {
    const contactList = [];

    // ── 1. Support (super_admin) — always first ──
    const { data: supportList } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .eq('role', 'super_admin')
      .limit(1);
    const support = supportList?.[0] || null;
    if (support) {
      contactList.push({
        ...support,
        displayName: 'Support',
        label: 'Support Team',
        color: 'from-[#9e9e9e] to-[#757575]',
        isActive: true,
      });
    }

    // ── 2. Get student's active enrolment course IDs ──
    const { data: enrolments } = await supabase
      .from('enrolments')
      .select('course_id')
      .eq('student_id', profileData.id)
      .eq('is_active', true);

    const courseIds = (enrolments || []).map(e => e.course_id).filter(Boolean);
      if (courseIds.length > 0) setCourseId(courseIds[0]);

    // ── 3. Fetch those courses directly to get assessor_id ──
    let courses = [];
    if (courseIds.length > 0) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, emoji, assessor_id')
        .in('id', courseIds);
      courses = courseData || [];
    }

    const activeAssessorIds = [...new Set(
      courses.map(c => c.assessor_id).filter(Boolean)
    )];

    // ── 4. Fetch past conversation partners (for unallocated history) ──
    const { data: pastMessages } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${profileData.id},receiver_id.eq.${profileData.id}`);

    const conversationPartnerIds = [...new Set(
      (pastMessages || [])
        .map(m => m.sender_id === profileData.id ? m.receiver_id : m.sender_id)
        .filter(id => id !== profileData.id && id !== support?.id)
    )];

    // ── 5. Combine active + past assessor IDs ──
    const allAssessorIds = [...new Set([...activeAssessorIds, ...conversationPartnerIds])];

    if (allAssessorIds.length > 0) {
      const { data: assessors } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', allAssessorIds)
        .eq('role', 'assessor');

      (assessors || []).forEach(a => {
        if (contactList.find(c => c.id === a.id)) return;
        const isActive = activeAssessorIds.includes(a.id);
        const assignedCourse = courses.find(c => c.assessor_id === a.id);
        contactList.push({
          ...a,
          displayName: `${a.first_name} ${a.last_name}`,
          label: isActive
            ? `Assessor${assignedCourse ? ` · ${assignedCourse.emoji || ''} ${assignedCourse.title || ''}` : ''}`
            : 'Former Assessor',
          color: 'from-[#fbbc04] to-[#ea4335]',
          isActive,
        });
      });
    }

    setContacts(contactList);

    // ── Fetch unread counts ──
    await fetchUnreadCounts(profileData.id, contactList);
  };

  // ─── UNREAD COUNTS ────────────────────────────────────────────────────────
  // Single query instead of N queries
  const fetchUnreadCounts = async (userId, contactList) => {
    const contactIds = contactList.map(c => c.id);
    if (contactIds.length === 0) return;

    const { data } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .in('sender_id', contactIds);

    const counts = {};
    (data || []).forEach(m => {
      counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
    });
    setUnreadCounts(counts);
  };

  // ─── OPEN CONVERSATION ────────────────────────────────────────────────────
  const openConversation = async (contact) => {
    setSelectedContact(contact);
    setLoadingMessages(true);

    // ── Unsubscribe from previous channel before subscribing to new one ──
    if (activeChannelRef.current) {
      await supabase.removeChannel(activeChannelRef.current);
      activeChannelRef.current = null;
    }

    // ── Load messages ──
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);

    // ── Mark as read ──
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', contact.id)
      .eq('receiver_id', profile.id);
    setUnreadCounts(prev => ({ ...prev, [contact.id]: 0 }));

    // ── Subscribe to new messages ──
    const channel = supabase
      .channel(`chat_${profile.id}_${contact.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${profile.id}`,
      }, async (payload) => {
        if (payload.new.sender_id === contact.id) {
          setMessages(prev => [...prev, payload.new]);
          await supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      })
      .subscribe();

    activeChannelRef.current = channel;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || sending) return;
    setSending(true);
    const { data } = await supabase
      .from('messages')
      .insert({
        sender_id: profile.id,
        receiver_id: selectedContact.id,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (data) {
      setMessages(prev => [...prev, data]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    setNewMessage('');
    setSending(false);
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : '';

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const formatDay = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group messages by day
  const groupedMessages = messages.reduce((groups, msg) => {
    const day = formatDay(msg.created_at);
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex" style={{ height: '100dvh' }}>
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/dashboard" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs">LA</div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[10px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">{profile?.student_id}</p>
            </div>
          </div>
        </div>
        {[
          { href: '/dashboard', icon: '📊', label: 'Dashboard' },
          { href: `/courses/${courseId}`, icon: '📚', label: 'My Courses' },
          { href: '/announcements', icon: '🔔', label: 'Announcements' },
          { href: '/messages', icon: '💬', label: 'Messages', badge: totalUnread > 0 ? totalUnread : null },
          { href: '/resources', icon: '📁', label: 'Resources' },
          { href: '/profile', icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${item.href === '/messages' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <GE>{item.icon}</GE>
            {item.label}
            {item.badge && <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">
            <GE>🚪</GE> Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden bg-[#0C0E13] px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-[10px]">LA</div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[9px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && <span className="bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{totalUnread}</span>}
          <Link href="/profile" className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</Link>
        </div>
      </div>

      {/* ── Messaging layout ── */}
      <div className="flex-1 md:ml-60 flex overflow-hidden" style={{ height: '100dvh' }}>

        {/* ── LEFT: Contact list ── */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-100 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#202124]">Messages</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {contacts.length === 0 ? 'No contacts yet' : `${contacts.length} contact${contacts.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center mb-3">
                  <GE size="text-3xl" opacity={0.3}>💬</GE>
                </div>
                <p className="text-sm font-medium text-[#202124] mb-1">No contacts yet</p>
                <p className="text-xs text-gray-400 leading-relaxed">Your support team and assessors will appear here once you are enrolled in a course.</p>
              </div>
            ) : contacts.map((contact) => {
              const unread = unreadCounts[contact.id] || 0;
              const isSelected = selectedContact?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => openConversation(contact)}
                  className={`w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 text-left transition hover:bg-[#f8f9fa] ${isSelected ? 'bg-[#e8f0fe] border-l-2 border-l-[#4285f4]' : ''}`}
                >
                  <div className="relative shrink-0">
                    <Avatar name={contact.displayName} color={contact.color} />
                    {/* Online dot for support */}
                    {contact.role === 'super_admin' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#34a853] rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-[#4285f4]' : 'text-[#202124]'}`}>
                        {contact.displayName}
                      </p>
                      {unread > 0 && (
                        <span className="bg-[#4285f4] text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium">{unread}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {!contact.isActive && contact.role !== 'super_admin' && (
                        <span className="text-[9px] bg-[#fff8e1] text-[#f9a825] px-1.5 py-0.5 rounded-full font-medium shrink-0">Unallocated</span>
                      )}
                      <p className="text-[10px] text-gray-400 truncate">{contact.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Chat window ── */}
        <div className={`flex-1 flex flex-col bg-[#f8f9fa] ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
          {!selectedContact ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                <GE size="text-4xl" opacity={0.3}>💬</GE>
              </div>
              <h3 className="text-sm font-semibold text-[#202124] mb-1">Select a conversation</h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Choose a contact from the list to start messaging your support team or assessor.</p>
            </div>
          ) : (
            <>
              {/* ── Chat header ── */}
              <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-3 shadow-sm">
                <button onClick={() => setSelectedContact(null)} className="md:hidden text-gray-400 hover:text-[#202124] transition mr-1 text-lg">←</button>
                <Avatar name={selectedContact.displayName} color={selectedContact.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#202124]">{selectedContact.displayName}</p>
                  <div className="flex items-center gap-1.5">
                    {!selectedContact.isActive && selectedContact.role !== 'super_admin' && (
                      <span className="text-[9px] bg-[#fff8e1] text-[#f9a825] px-1.5 py-0.5 rounded-full font-medium">Unallocated</span>
                    )}
                    <p className="text-[10px] text-gray-400 truncate">{selectedContact.label}</p>
                  </div>
                </div>
              </div>

              {/* ── Unallocated notice ── */}
              {!selectedContact.isActive && selectedContact.role !== 'super_admin' && (
                <div className="mx-4 mt-3 bg-[#fff8e1] border border-[#fbbc04]/30 rounded-xl px-4 py-3 flex items-start gap-2">
                  <GE size="text-sm" opacity={0.8}>⚠️</GE>
                  <p className="text-xs text-[#f9a825]">
                    This assessor is no longer allocated to your course. You can view your chat history but cannot send new messages.
                  </p>
                </div>
              )}

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-gray-200 flex items-center justify-center mb-3">
                      <GE size="text-2xl" opacity={0.3}>👋</GE>
                    </div>
                    <p className="text-sm font-medium text-[#202124] mb-1">Start the conversation</p>
                    <p className="text-xs text-gray-400">Send a message to {selectedContact.displayName}</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([day, dayMessages]) => (
                    <div key={day}>
                      {/* Day separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-white rounded-full border border-gray-100">{day}</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>

                      {dayMessages.map((msg, i) => {
                        const isMine = msg.sender_id === profile.id;
                        const isLast = i === dayMessages.length - 1;
                        const nextMsg = dayMessages[i + 1];
                        const showAvatar = !isMine && (!nextMsg || nextMsg.sender_id !== msg.sender_id);

                        return (
                          <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {/* Spacer for alignment when no avatar */}
                            {!isMine && !showAvatar && <div className="w-8 shrink-0" />}
                            {!isMine && showAvatar && (
                              <Avatar name={selectedContact.displayName} color={selectedContact.color} size="sm" />
                            )}

                            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? 'bg-gradient-to-br from-[#4285f4] to-[#1a73e8] text-white rounded-br-sm'
                                  : 'bg-white text-[#202124] rounded-bl-sm border border-gray-100 shadow-sm'
                              }`}>
                                {msg.message}
                              </div>
                              {(isLast || (nextMsg && nextMsg.sender_id !== msg.sender_id)) && (
                                <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-400' : 'text-gray-400'}`}>
                                  {formatTime(msg.created_at)}
                                </p>
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

              {/* ── Message input ── */}
              {(selectedContact.isActive || selectedContact.role === 'super_admin') ? (
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
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white hover:opacity-90 transition disabled:opacity-40 shrink-0 mb-0.5"
                    >
                      {sending
                        ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      }
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
                </div>
              ) : (
                <div className="bg-white border-t border-gray-100 px-4 py-4 text-center">
                  <p className="text-xs text-gray-400">You cannot send new messages to this assessor as they are no longer allocated to your course.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 flex items-center justify-around px-4 py-2 z-40">
        {[
          { href: '/dashboard', icon: '📊', label: 'Home' },
          { href: '/courses', icon: '📚', label: 'Courses' },
          { href: '/announcements', icon: '📝', label: 'Tasks' },
          { href: '/messages', icon: '💬', label: 'Messages', badge: totalUnread },
          { href: '/profile', icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${item.href === '/messages' ? 'text-[#4285f4]' : 'text-gray-500'}`}>
            <span className="text-xl" style={{ filter: 'grayscale(1)', opacity: 0.6 }}>{item.icon}</span>
            <span className="text-[9px]">{item.label}</span>
            {item.badge > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}