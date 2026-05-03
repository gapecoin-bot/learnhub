'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';
import WebPattern from '@/app/components/WebPattern';

const GE = ({ children, size = 'text-base', opacity = 0.6 }) => (
  <span style={{ filter: 'grayscale(1)', opacity }} className={`${size} shrink-0`}>{children}</span>
);

export default function CoursePage({ params }) {
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [enrolment, setEnrolment] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [notes, setNotes] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeSection, setActiveSection] = useState('content');
  const [unitProgress, setUnitProgress] = useState({});
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profileData || profileData.role !== 'student') { router.push('/login'); return; }
      setProfile(profileData);
      const courseId = parseInt((await params).id);

      const { data: enrolData } = await supabase.from('enrolments').select('*').eq('student_id', session.user.id).eq('course_id', courseId).eq('is_active', true).maybeSingle();
      if (!enrolData) { router.push('/courses'); return; }
      setEnrolment(enrolData);

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      setCourse(courseData);

      const { data: moduleData } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('order_number', { ascending: true });
      setModules(moduleData || []);

      const { data: materialData } = await supabase.from('course_materials').select('*').eq('course_id', courseId).order('order_number', { ascending: true });
      setMaterials(materialData || []);

      const { data: assignmentData } = await supabase.from('assignments').select('*').eq('course_id', courseId).not('instructions_url', 'is', null).order('order_number', { ascending: true });
      setAssignments(assignmentData || []);

      const { data: submissionData } = await supabase.from('submissions').select('*').eq('student_id', session.user.id).order('submitted_at', { ascending: false });
      const subs = submissionData || [];
      setSubmissions(subs);

      const { data: moduleProgressData } = await supabase.from('module_progress').select('*').eq('student_id', session.user.id);
      const dbProgressByModule = {};
      (moduleProgressData || []).forEach(mp => { dbProgressByModule[mp.module_id] = mp; });

      // ── Fetch ALL assignments for this course (not just with instructions) to catch all submissions ──
      const { data: allAssignData } = await supabase
        .from('assignments')
        .select('id, module_id')
        .eq('course_id', courseId);

      const progressMap = {};
      (moduleData || []).forEach(mod => {
        // Use all assignments for submission check, not just those with instructions
        const modAllAssignIds = (allAssignData || []).filter(a => a.module_id === mod.id).map(a => a.id);
        const hasSubmission = subs.some(s => modAllAssignIds.includes(s.assignment_id));
        const dbRow = dbProgressByModule[mod.id];
        progressMap[mod.id] = {
          viewed: !!dbRow,
          submitted: hasSubmission || dbRow?.completed === true,
        };
      });

      const correctedProgress = (() => {
        if ((moduleData || []).length === 0) return 0;
        const unitShare = 100 / moduleData.length;
        let total = 0;
        (moduleData || []).forEach(mod => {
          const up = progressMap[mod.id] || { viewed: false, submitted: false };
          const modMats = (materialData || []).filter(m => m.module_id === mod.id);
          const modAssigns = (assignmentData || []).filter(a => a.module_id === mod.id);
          const hasContent = modMats.length > 0;
          const hasAssignment = modAssigns.length > 0;
          if (!hasContent && !hasAssignment) { if (up.viewed) total += unitShare; }
          else if (!hasAssignment) { if (up.viewed) total += unitShare; }
          else if (!hasContent) { if (up.submitted) total += unitShare; }
          else {
            if (up.viewed) total += unitShare * 0.5;
            if (up.submitted) total += unitShare * 0.5;
          }
        });
        return Math.min(100, Math.round(total));
      })();

      await supabase.from('enrolments').update({ progress: correctedProgress }).eq('id', enrolData.id);
      setUnitProgress(progressMap);

      if (moduleData?.length > 0) {
        const firstUnlocked = moduleData.find(m => !m.is_locked) || moduleData[0];
        setActiveModule(firstUnlocked);

        // ── Auto-mark first unlocked module as viewed if it has materials ──
        const firstHasMaterials = (materialData || []).some(m => m.module_id === firstUnlocked.id);
        if (firstHasMaterials && !dbProgressByModule[firstUnlocked.id]) {
          await supabase.from('module_progress').insert({
            student_id: session.user.id,
            module_id: firstUnlocked.id,
            completed: false,
          });
          progressMap[firstUnlocked.id] = {
            ...progressMap[firstUnlocked.id],
            viewed: true,
          };
        }
      }

      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', session.user.id).eq('is_read', false);
      setUnreadMessages(count || 0);
      setLoading(false);
    };
    init();
  }, []);

  const calculateProgress = useCallback(() => {
    if (modules.length === 0) return 0;
    const unitShare = 100 / modules.length;
    let total = 0;
    modules.forEach(mod => {
      const up = unitProgress[mod.id] || { viewed: false, submitted: false };
      const modMaterials = materials.filter(m => m.module_id === mod.id);
      const modAssignments = assignments.filter(a => a.module_id === mod.id);
      const hasContent = modMaterials.length > 0;
      const hasAssignment = modAssignments.length > 0;
      if (!hasContent && !hasAssignment) { if (up.viewed) total += unitShare; }
      else if (!hasAssignment) { if (up.viewed) total += unitShare; }
      else if (!hasContent) { if (up.submitted) total += unitShare; }
      else {
        if (up.viewed) total += unitShare * 0.5;
        if (up.submitted) total += unitShare * 0.5;
      }
    });
    return Math.min(100, Math.round(total));
  }, [modules, materials, assignments, unitProgress]);

  const saveProgress = useCallback(async (newProgress) => {
    if (!enrolment) return;
    await supabase.from('enrolments').update({ progress: newProgress }).eq('id', enrolment.id);
  }, [enrolment]);

  useEffect(() => {
    if (!enrolment || modules.length === 0 || loading) return;
    const newProgress = calculateProgress();
    saveProgress(newProgress);
  }, [unitProgress]);

  const selectModule = async (mod) => {
    if (mod.is_locked) return;
    setActiveModule(mod);
    setUploadedFiles({});
    setNotes('');
    const modMaterials = materials.filter(m => m.module_id === mod.id);
    if (modMaterials.length > 0) {
      setUnitProgress(prev => {
        if (prev[mod.id]?.viewed) return prev;
        return { ...prev, [mod.id]: { ...prev[mod.id], viewed: true } };
      });
      if (!unitProgress[mod.id]?.viewed) {
        const { data: existing } = await supabase.from('module_progress').select('id').eq('student_id', profile.id).eq('module_id', mod.id).maybeSingle();
        if (!existing) {
          await supabase.from('module_progress').insert({ student_id: profile.id, module_id: mod.id, completed: false });
        }
      }
    }
  };

  const getModuleMaterials = (moduleId) => materials.filter(m => m.module_id === moduleId);
  const getModuleAssignments = (moduleId) => assignments.filter(a => a.module_id === moduleId);
  const getSubmissionsFor = (assignmentId) => submissions.filter(s => s.assignment_id === assignmentId);
  const getLatestSubmission = (assignmentId) => { const subs = getSubmissionsFor(assignmentId); return subs.length > 0 ? subs[0] : null; };
  const getAttemptCount = (assignmentId) => getSubmissionsFor(assignmentId).length;

  const handleUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip'].includes(ext)) { alert('Unsupported file type.'); setUploading(false); return; }
    if (file.size > 20 * 1024 * 1024) { alert('File too large. Maximum 20MB.'); setUploading(false); return; }
    const name = `submission_${assignmentId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('submissions').upload(name, file, { cacheControl: '3600', upsert: false });
    if (upErr) { alert(`Upload failed: ${upErr.message}`); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(name);
    setUploadedFiles(prev => ({ ...prev, [assignmentId]: { url: urlData.publicUrl, name: file.name } }));
    setUploading(false);
  };

  const handleSubmit = async (assignmentId) => {
    const fileData = uploadedFiles[assignmentId];
    if (!fileData) { alert('Please upload a file first.'); return; }
    const attemptCount = getAttemptCount(assignmentId);
    if (attemptCount >= 3) { alert('Maximum 3 attempts reached. Contact your assessor.'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('submissions').insert({
      student_id: profile.id, assignment_id: assignmentId,
      file_url: fileData.url, notes: notes, status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
    if (error) { alert(`Submission failed: ${error.message}`); setSubmitting(false); return; }
    const { data: updatedSubs } = await supabase.from('submissions').select('*').eq('student_id', profile.id).order('submitted_at', { ascending: false });
    setSubmissions(updatedSubs || []);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setUnitProgress(prev => ({ ...prev, [assignment.module_id]: { ...prev[assignment.module_id], submitted: true } }));
      const { data: existing } = await supabase.from('module_progress').select('id').eq('student_id', profile.id).eq('module_id', assignment.module_id).maybeSingle();
      if (existing) {
        await supabase.from('module_progress').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('module_progress').insert({ student_id: profile.id, module_id: assignment.module_id, completed: true, completed_at: new Date().toISOString() });
      }
    }
    setUploadedFiles(prev => { const n = { ...prev }; delete n[assignmentId]; return n; });
    setNotes('');
    setSubmitting(false);
  };

  const fileIcon = (type) => {
    if (!type) return '📄';
    if (type === 'pdf' || type.includes('pdf')) return '📕';
    if (type.includes('video')) return '🎬';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('doc')) return '📝';
    return '📄';
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();

  // ─── SUBMIT PANEL ─────────────────────────────────────────────────────────
  const SubmitPanel = ({ a }) => {
    const latestSub = getLatestSubmission(a.id);
    const attemptCount = getAttemptCount(a.id);
    const attemptsLeft = 3 - attemptCount;
    const fileData = uploadedFiles[a.id];
    const isMyFile = !!fileData;
    // Fix: only show submit section if not submitted OR if resubmitting after graded
    const canShowSubmitForm = attemptsLeft > 0 && latestSub?.status !== 'graded' && latestSub?.status !== 'submitted';
    const canResubmit = attemptsLeft > 0 && latestSub?.status === 'submitted';

    return (
      <div className="bg-white rounded-2xl border border-[#F5A623]/30 p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#FFF3E0] rounded-xl flex items-center justify-center shrink-0">
            <GE size="text-sm">📋</GE>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#202124]">{a.title}</p>
            {a.deadline && (
              <p className="text-[10px] text-gray-400">Deadline: {new Date(a.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            )}
          </div>
        </div>

        {a.description && <p className="text-xs text-gray-500 mb-3 leading-relaxed">{a.description}</p>}

        {/* Submission guide */}
        {a.submission_guide && (
          <div className="bg-[#e8f0fe] border border-[#4285f4]/20 rounded-xl p-3 mb-3">
            <p className="text-[11px] text-[#1a73e8] font-medium mb-1">📋 Submission guide</p>
            <p className="text-[11px] text-[#1a73e8] leading-relaxed whitespace-pre-wrap">{a.submission_guide}</p>
          </div>
        )}

        {/* Download instructions — styled as amber button */}
        {a.instructions_url && (
          <a href={a.instructions_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-semibold hover:opacity-90 transition mb-3">
            <GE size="text-sm" opacity={1}>📥</GE> Download assignment brief
          </a>
        )}

        {/* Attempts */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            {[1, 2, 3].map(n => (
              <div key={n} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${n <= attemptCount ? 'bg-[#F5A623] border-[#F5A623] text-[#0C0E13]' : 'border-gray-200 text-gray-300'}`}>{n}</div>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">{attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining</span>
        </div>

        {/* Graded - clickable to feedback page */}
        {latestSub?.status === 'graded' && (
          <Link href={`/assignments/feedback?submission_id=${latestSub.id}`}
            className="block bg-[#e6f4ea] rounded-xl p-3 mb-3 hover:bg-[#34a853]/20 transition cursor-pointer">
            <p className="text-xs font-semibold text-[#137333]"><GE size="text-sm">🏆</GE> Grade: {latestSub.grade} <span className="text-[10px] font-normal ml-1">→ View full feedback</span></p>
            {latestSub.feedback && <p className="text-xs text-[#137333] mt-1 line-clamp-2">💬 {latestSub.feedback}</p>}
          </Link>
        )}

        {/* Submitted awaiting — show file link + option to resubmit */}
        {latestSub?.status === 'submitted' && (
          <div className="bg-[#e8f0fe] rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-[#1a73e8]">⏳ Submitted — awaiting review by your assessor.</p>
              {latestSub.file_url && (
                <a href={latestSub.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] px-2.5 py-1 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-white transition shrink-0">
                  View file
                </a>
              )}
            </div>
          </div>
        )}

        {/* Submit / Resubmit form — only when not already submitted awaiting */}
        {canShowSubmitForm && (
          <div className="border-t border-gray-100 pt-3 mt-1">
            <textarea rows={2} placeholder="Add a note to your assessor (optional)..." value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[#f8f9fa] text-xs text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition resize-none mb-2" />
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition mb-3 ${isMyFile ? 'border-[#34a853] bg-[#e6f4ea]' : 'border-gray-200 bg-[#f8f9fa]'}`}>
              {isMyFile ? (
                <div>
                  <GE size="text-xl">✅</GE>
                  <p className="text-xs font-medium text-[#137333] mt-1">{fileData.name}</p>
                  <button onClick={() => setUploadedFiles(prev => { const n = { ...prev }; delete n[a.id]; return n; })} className="text-[10px] text-[#ea4335] hover:underline mt-1">Remove</button>
                </div>
              ) : uploading ? (
                <div>
                  <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                  <p className="text-xs text-gray-400">Uploading...</p>
                </div>
              ) : (
                <div>
                  <GE size="text-xl">📤</GE>
                  <p className="text-xs text-gray-500 mt-1 mb-2">PDF, DOC, DOCX, ZIP — max 20MB</p>
                  <label className="px-4 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-semibold cursor-pointer hover:opacity-90 transition">
                    Choose file
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" onChange={e => handleUpload(e, a.id)} className="hidden" />
                  </label>
                </div>
              )}
            </div>
            <button onClick={() => handleSubmit(a.id)} disabled={!isMyFile || submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#1a73e8] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Submitting...
                </span>
              ) : `Submit assignment (attempt ${attemptCount + 1} of 3)`}
            </button>
          </div>
        )}

        {/* Resubmit option — shown separately after submission returned */}
        {canResubmit && (
          <div className="border-t border-gray-100 pt-3 mt-1">
            <p className="text-[10px] text-gray-400 mb-2">You can resubmit while awaiting review ({attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left)</p>
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition mb-3 ${isMyFile ? 'border-[#34a853] bg-[#e6f4ea]' : 'border-gray-200 bg-[#f8f9fa]'}`}>
              {isMyFile ? (
                <div>
                  <GE size="text-xl">✅</GE>
                  <p className="text-xs font-medium text-[#137333] mt-1">{fileData.name}</p>
                  <button onClick={() => setUploadedFiles(prev => { const n = { ...prev }; delete n[a.id]; return n; })} className="text-[10px] text-[#ea4335] hover:underline mt-1">Remove</button>
                </div>
              ) : uploading ? (
                <div>
                  <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                  <p className="text-xs text-gray-400">Uploading...</p>
                </div>
              ) : (
                <div>
                  <GE size="text-xl">📤</GE>
                  <p className="text-xs text-gray-500 mt-1 mb-2">Upload a new version to resubmit</p>
                  <label className="px-4 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-semibold cursor-pointer hover:opacity-90 transition">
                    Choose file
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" onChange={e => handleUpload(e, a.id)} className="hidden" />
                  </label>
                </div>
              )}
            </div>
            <button onClick={() => handleSubmit(a.id)} disabled={!isMyFile || submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#1a73e8] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Submitting...' : `Resubmit (attempt ${attemptCount + 1} of 3)`}
            </button>
          </div>
        )}

        {/* Max attempts */}
        {attemptsLeft === 0 && latestSub?.status !== 'graded' && (
          <div className="bg-[#fff8e1] rounded-xl p-3 mt-2">
            <p className="text-xs font-semibold text-[#f9a825] mb-1">⚠️ Maximum attempts reached</p>
            <p className="text-xs text-gray-500 mb-2">Please contact your assessor for further guidance.</p>
            <Link href="/messages" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-semibold hover:opacity-90 transition">
              <GE size="text-xs">💬</GE> Contact assessor
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans relative pb-20 md:pb-0">
      <WebPattern />
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
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">{profile?.student_id}</p>
            </div>
          </div>
        </div>
        {[
          { href: '/dashboard', icon: '📊', label: 'Dashboard' },
          { href: `/courses/${enrolment?.course_id}`, icon: '📚', label: 'My Courses' },
          { href: '/announcements', icon: '🔔', label: 'Announcements' },
          { href: '/messages', icon: '💬', label: 'Messages', badge: unreadMessages > 0 ? unreadMessages : null },
          { href: '/resources', icon: '📁', label: 'Resources' },
          { href: '/profile', icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${item.href === `/courses/${enrolment?.course_id}` ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
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
      <div className="md:hidden bg-[#0C0E13] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-[10px]">LA</div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[9px] text-[#F5A623]/70">London</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {unreadMessages > 0 && (
            <Link href="/messages" className="relative">
              <GE size="text-xl">💬</GE>
              <span className="absolute -top-1 -right-1 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>
            </Link>
          )}
          <Link href="/profile" className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold">{initials}</Link>
        </div>
      </div>

      <main className="md:ml-60 relative z-10">

        {/* ── Course hero ── */}
        <div className={`bg-gradient-to-br ${course?.banner_from || 'from-[#0C0E13]'} ${course?.banner_to || 'to-[#1a1f2e]'} px-4 md:px-8 py-6 md:py-8`}>
          <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <span>›</span>
            <Link href={`/courses/${enrolment?.course_id}`} className="hover:text-white transition">My Courses</Link>
            <span>›</span>
            <span className="text-white/80 truncate">{course?.title}</span>
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <GE size="text-3xl" opacity={0.7}>{course?.emoji || '📚'}</GE>
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${course?.badge_bg || 'bg-[#F5A623]/20'} ${course?.badge_text || 'text-[#F5A623]'} mb-2 inline-block`}>{course?.category}</span>
              <h1 className="text-lg md:text-2xl font-bold text-white leading-snug">{course?.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {course?.awarding_body && <span className="text-xs text-white/60"><GE size="text-xs">📜</GE> {course.awarding_body}</span>}
                {course?.level && <span className="text-xs text-white/60"><GE size="text-xs">🎓</GE> {course.level}</span>}
                <span className="text-xs text-white/60"><GE size="text-xs">📚</GE> {modules.length} units</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/70">Course progress</p>
              <p className="text-xs font-bold text-[#F5A623]">{progress}%</p>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-[#F5A623] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] text-white/50 mt-1">
              {modules.length > 0 ? `${modules.length} units · view notes + submit to progress` : 'No units yet'}
              {progress === 100 && <span className="text-[#F5A623] font-medium ml-2">✓ Complete!</span>}
            </p>
          </div>
        </div>

        {/* ── Section tabs ── */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: 'content', label: 'Course Content' },
              { key: 'assignments', label: `Assignments (${assignments.length})` },
              { key: 'resources', label: `Resources (${materials.length})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                className={`px-4 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition ${activeSection === tab.key ? 'border-[#F5A623] text-[#F5A623]' : 'border-transparent text-gray-500 hover:text-[#202124]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* ── Course content ── */}
          {activeSection === 'content' && (
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Units list */}
              <div className="w-full lg:w-72 shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-4">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#202124]">Course Units</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{modules.length} units total</p>
                    </div>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {modules.length === 0 ? (
                      <div className="p-6 text-center"><GE size="text-3xl" opacity={0.3}>📚</GE><p className="text-xs text-gray-400 mt-2">No units yet</p></div>
                    ) : modules.map((mod, i) => {
                      const up = unitProgress[mod.id] || {};
                      const modMats = materials.filter(m => m.module_id === mod.id);
                      const modAssigns = assignments.filter(a => a.module_id === mod.id);
                      let unitPct = 0;
                      if (up.viewed && modMats.length > 0) unitPct += 50;
                      if (up.submitted && modAssigns.length > 0) unitPct += 50;
                      if (modMats.length === 0 && modAssigns.length === 0 && up.viewed) unitPct = 100;
                      if (modMats.length > 0 && modAssigns.length === 0 && up.viewed) unitPct = 100;
                      if (modMats.length === 0 && modAssigns.length > 0 && up.submitted) unitPct = 100;
                      return (
                        <button key={mod.id} onClick={() => selectModule(mod)}
                          className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 text-left transition ${mod.is_locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FFF8E7]'} ${activeModule?.id === mod.id ? 'bg-[#FFF8E7]' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${mod.is_locked ? 'bg-gray-100 text-gray-400' : activeModule?.id === mod.id ? 'bg-[#F5A623] text-[#0C0E13]' : 'bg-[#FFF3E0] text-[#F5A623]'}`}>
                            {mod.is_locked ? <GE size="text-xs" opacity={0.5}>🔒</GE> : i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${mod.is_locked ? 'text-gray-400' : 'text-[#202124]'}`}>{mod.title}</p>
                            {!mod.is_locked && (
                              <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden w-full">
                                <div className="h-full bg-[#F5A623] rounded-full transition-all duration-300" style={{ width: `${unitPct}%` }} />
                              </div>
                            )}
                          </div>
                          {!mod.is_locked && unitPct === 100 && <span className="text-[10px] text-[#F5A623] shrink-0 font-bold">✓</span>}
                          {!mod.is_locked && unitPct > 0 && unitPct < 100 && <span className="text-[10px] text-[#F5A623]/60 shrink-0">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Unit content */}
              <div className="flex-1 min-w-0">
                {!activeModule ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <GE size="text-4xl" opacity={0.3}>📖</GE>
                    <p className="text-sm text-gray-400 mt-3">Select a unit to view its content</p>
                  </div>
                ) : activeModule.is_locked ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-4">
                      <GE size="text-3xl" opacity={0.4}>🔒</GE>
                    </div>
                    <h3 className="text-sm font-semibold text-[#202124] mb-2">Unit locked</h3>
                    <p className="text-xs text-gray-400 mb-4">This unit will unlock after you complete the previous unit's assignment.</p>
                    {activeModule.unlocked_at && (
                      <p className="text-xs text-[#F5A623]">Unlocks on {new Date(activeModule.unlocked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">

                    {/* Unit header */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h2 className="text-base font-semibold text-[#202124] mb-1">{activeModule.title}</h2>
                          {activeModule.description && <p className="text-sm text-gray-500 leading-relaxed">{activeModule.description}</p>}
                        </div>
                        {(() => {
                          const up = unitProgress[activeModule.id] || {};
                          const modMats = materials.filter(m => m.module_id === activeModule.id);
                          const modAssigns = assignments.filter(a => a.module_id === activeModule.id);
                          return (
                            <div className="flex items-center gap-2 text-[10px]">
                              {modMats.length > 0 && (
                                <span className={`px-2 py-1 rounded-full border ${up.viewed ? 'bg-[#FFF8E7] border-[#F5A623]/40 text-[#B8780A]' : 'bg-[#f0f2f5] border-transparent text-gray-400'}`}>
                                  {up.viewed ? '✓' : '○'} Notes
                                </span>
                              )}
                              {modAssigns.length > 0 && (() => {
                                const modAssign = modAssigns[0];
                                const latestSub = getLatestSubmission(modAssign.id);
                                if (up.submitted && latestSub?.status === 'graded' && latestSub?.id) {
                                  return (
                                    <Link href={`/assignments/feedback?submission_id=${latestSub.id}`}
                                      className="px-2 py-1 rounded-full border bg-[#e6f4ea] border-[#34a853]/40 text-[#137333] hover:bg-[#34a853] hover:text-white transition">
                                      ✓ View feedback
                                    </Link>
                                  );
                                }
                                return (
                                  <span className={`px-2 py-1 rounded-full border ${up.submitted ? 'bg-[#FFF8E7] border-[#F5A623]/40 text-[#B8780A]' : 'bg-[#f0f2f5] border-transparent text-gray-400'}`}>
                                    {up.submitted ? '✓' : '○'} Assignment
                                  </span>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Materials */}
                    {getModuleMaterials(activeModule.id).length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {getModuleMaterials(activeModule.id).map((mat) => {
                          const isPdf = mat.file_type === 'pdf' || mat.file_type?.includes('pdf');
                          return (
                            <div key={mat.id} className={`bg-white rounded-2xl border p-5 transition ${isPdf ? 'border-[#ea4335]/20 hover:border-[#ea4335]/40' : 'border-gray-200 hover:border-[#F5A623]/40'}`}>
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? 'bg-[#fce8e6]' : 'bg-[#f0f2f5]'}`}>
                                  <span style={{ filter: 'none', opacity: 1 }} className="text-xl">{isPdf ? '📕' : fileIcon(mat.file_type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold ${isPdf ? 'text-[#c5221f]' : 'text-[#202124]'}`}>{mat.title}</p>
                                  <p className={`text-[10px] capitalize ${isPdf ? 'text-[#ea4335]/70' : 'text-gray-400'}`}>{mat.file_type || 'Document'}</p>
                                </div>
                              </div>
                              {mat.content_text && (
                                <div className="bg-[#f8f9fa] rounded-xl p-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-3">{mat.content_text}</div>
                              )}
                              {mat.file_url && (
                                <a href={mat.file_url} target="_blank" rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${isPdf ? 'bg-[#fce8e6] text-[#c5221f] border border-[#ea4335]/30 hover:bg-[#ea4335] hover:text-white' : 'border border-[#F5A623] text-[#B8780A] hover:bg-[#FFF8E7]'}`}>
                                  <GE size="text-sm">{isPdf ? '📕' : '📥'}</GE>
                                  {isPdf ? 'View PDF' : 'Open / Download'}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <GE size="text-3xl" opacity={0.3}>📄</GE>
                        <p className="text-xs text-gray-400 mt-2">No materials uploaded for this unit yet.</p>
                      </div>
                    )}

                    {/* Assignments */}
                    {getModuleAssignments(activeModule.id).map((a) => (
                      <SubmitPanel key={a.id} a={a} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Assignments tab ── */}
          {activeSection === 'assignments' && (
            <div>
              {assignments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-4"><GE size="text-3xl" opacity={0.4}>📝</GE></div>
                  <h3 className="text-sm font-semibold text-[#202124] mb-1">No assignments yet</h3>
                  <p className="text-xs text-gray-400">Your assessor will upload assignments here when ready.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {assignments.map((a) => <SubmitPanel key={a.id} a={a} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Resources tab ── */}
          {activeSection === 'resources' && (
            <div>
              {materials.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-4"><GE size="text-3xl" opacity={0.4}>📁</GE></div>
                  <h3 className="text-sm font-semibold text-[#202124] mb-1">No resources yet</h3>
                  <p className="text-xs text-gray-400">Your admin and assessor will upload materials here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((mat) => {
                    const isPdf = mat.file_type === 'pdf' || mat.file_type?.includes('pdf');
                    return (
                      <div key={mat.id} className={`bg-white rounded-xl border p-4 transition ${isPdf ? 'border-[#ea4335]/20 hover:border-[#ea4335]/40' : 'border-gray-200 hover:border-[#F5A623]/40'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? 'bg-[#fce8e6]' : 'bg-[#f0f2f5]'}`}>
                            <span style={{ filter: 'none', opacity: 1 }} className="text-xl">{isPdf ? '📕' : fileIcon(mat.file_type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isPdf ? 'text-[#c5221f]' : 'text-[#202124]'}`}>{mat.title}</p>
                            <p className="text-[10px] text-gray-400">{new Date(mat.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                        {mat.file_url && (
                          <a href={mat.file_url} target="_blank" rel="noopener noreferrer"
                            className={`block w-full py-2 text-center rounded-lg text-xs font-medium transition ${isPdf ? 'bg-[#fce8e6] text-[#c5221f] border border-[#ea4335]/30 hover:bg-[#ea4335] hover:text-white' : 'border border-[#F5A623] text-[#B8780A] hover:bg-[#FFF8E7]'}`}>
                            {isPdf ? 'View PDF' : 'Download / View'}
                          </a>
                        )}
                        {mat.content_text && !mat.file_url && (
                          <p className="text-xs text-gray-500 line-clamp-3">{mat.content_text}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0E13] border-t border-white/10 flex items-center justify-around px-4 py-2 z-40">
        {[
          { href: '/dashboard', icon: '📊', label: 'Home' },
          { href: `/courses/${enrolment?.course_id}`, icon: '📚', label: 'Courses' },
          { href: '/announcements', icon: '🔔', label: 'Alerts' },
          { href: '/messages', icon: '💬', label: 'Messages', badge: unreadMessages },
          { href: '/profile', icon: '👤', label: 'Profile' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${item.href === `/courses/${enrolment?.course_id}` ? 'text-[#F5A623]' : 'text-gray-500'}`}>
            <span className="text-xl" style={{ filter: 'grayscale(1)', opacity: 0.6 }}>{item.icon}</span>
            <span className="text-[9px]">{item.label}</span>
            {item.badge > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#ea4335] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}