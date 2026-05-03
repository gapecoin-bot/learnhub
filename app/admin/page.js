'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SessionTimeout from '@/app/components/SessionTimeout';

// ─── LOGIN LOGS ───────────────────────────────────────────────────────────────
function LoginLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const getLogs = async () => {
      const { data } = await supabase.from('login_logs').select('*').order('logged_in_at', { ascending: false }).limit(50);
      if (data) setLogs(data);
    };
    getLogs();
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
          ) : logs.map((log) => (
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

const SUPPORT_PERMISSIONS = [
  { key: 'reset_passwords', label: 'Reset passwords', desc: 'Can reset student passwords', icon: '🔑' },
  { key: 'view_students', label: 'View all students', desc: 'Can view full student list', icon: '👥' },
  { key: 'manage_announcements', label: 'Manage announcements', desc: 'Can add and delete announcements', icon: '📢' },
  { key: 'view_login_logs', label: 'View login logs', desc: 'Can view all login activity', icon: '🔐' },
  { key: 'manage_enrolments', label: 'Manage enrolments', desc: 'Can approve and reject enrolments', icon: '📋' },
];
// ─── PERMISSIONS ──────────────────────────────────────────────────────────────
const PERMISSIONS = [
  { key: 'add_courses', label: 'Add courses', desc: 'Can add new courses', icon: '📚' },
  { key: 'edit_courses', label: 'Edit courses', desc: 'Can edit existing course details', icon: '✏️' },
  { key: 'manage_enrolments', label: 'Manage enrolments', desc: 'Can approve and reject enrolments', icon: '📋' },
  { key: 'add_assessors', label: 'Add assessors', desc: 'Can promote users to assessor role', icon: '👨‍🏫' },
  { key: 'upload_certificates', label: 'Upload certificates', desc: 'Can upload certificate templates', icon: '🏆' },
  { key: 'manage_announcements', label: 'Manage announcements', desc: 'Can add and delete announcements', icon: '📢' },
  { key: 'view_all_students', label: 'View all students', desc: 'Can view the full student list', icon: '👥' },
  { key: 'view_login_logs', label: 'View login logs', desc: 'Can view all login activity', icon: '🔐' },
];

// ─── RECORD PAYMENT ───────────────────────────────────────────────────────────
function RecordPayment({ student, enrolments, profile, onSaved }) {
  const [form, setForm] = useState({ course_id: '', amount: '', notes: '', payment_type: 'full' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!form.course_id || !form.amount) return;
    setSaving(true);
    await supabase.from('student_payments').insert({
      student_id: student.id,
      course_id: parseInt(form.course_id),
      amount: parseFloat(form.amount),
      payment_type: form.payment_type,
      notes: form.notes,
      recorded_by: profile.id,
      paid_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setForm({ course_id: '', amount: '', notes: '', payment_type: 'full' });
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Course</label>
          <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#202124] outline-none focus:border-[#F5A623]">
            <option value="">Select course...</option>
            {enrolments.map(e => <option key={e.course_id} value={e.course_id}>{e.course?.emoji} {e.course?.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Amount (£)</label>
          <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#202124] outline-none focus:border-[#F5A623]" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-gray-400 mb-1">Notes (optional)</label>
        <input type="text" placeholder="e.g. Monthly instalment 1 of 3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#202124] outline-none focus:border-[#F5A623]" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving || !form.course_id || !form.amount} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Record payment'}
        </button>
        {saved && <span className="text-xs text-[#34a853]">✓ Payment recorded</span>}
      </div>
    </div>
  );
}

// ─── CERTIFICATES MANAGER ─────────────────────────────────────────────────────
function CertificatesManager({ profile, students, courses }) {
  const [templates, setTemplates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [uploadingTemplate, setUploadingTemplate] = useState(null);
  const [issueForm, setIssueForm] = useState({ student_id: '', course_id: '', grade: '' });
  const [issuing, setIssuing] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const [issueError, setIssueError] = useState('');
  const [activeSection, setActiveSection] = useState('templates');

  useEffect(() => { fetchTemplates(); fetchCertificates(); }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('certificate_templates').select('*, course:courses(id, title, emoji)').order('created_at', { ascending: false });
    if (data) setTemplates(data);
  };

  const fetchCertificates = async () => {
    const { data } = await supabase.from('certificates').select(`*, student:profiles!certificates_student_id_fkey(first_name, last_name, email, student_id), course:courses(id, title, emoji)`).order('issued_at', { ascending: false });
    if (data) setCertificates(data);
  };

  const uploadTemplate = async (courseId, file) => {
    if (!file) return;
    if (file.name.split('.').pop().toLowerCase() !== 'pdf') { alert('Template must be a PDF.'); return; }
    setUploadingTemplate(courseId);
    const fileName = `template_${courseId}_${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage.from('certificate-templates').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (upErr) { alert(`Upload failed: ${upErr.message}`); setUploadingTemplate(null); return; }
    const { data: urlData } = supabase.storage.from('certificate-templates').getPublicUrl(fileName);
    await supabase.from('certificate_templates').insert({ course_id: courseId, template_url: urlData.publicUrl, template_filename: file.name, uploaded_by: profile.id });
    await fetchTemplates();
    setUploadingTemplate(null);
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return;
    await supabase.from('certificate_templates').delete().eq('id', id);
    await fetchTemplates();
  };

  const issueCertificate = async () => {
    setIssueError('');
    if (!issueForm.student_id || !issueForm.course_id || !issueForm.grade) { setIssueError('Please fill in all fields.'); return; }
    setIssuing(true);
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: issueForm.student_id, course_id: parseInt(issueForm.course_id), grade: issueForm.grade, issued_by: profile.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setIssueError(data.error || 'Failed to generate certificate.'); }
      else { setIssueResult(data); await fetchCertificates(); }
    } catch (err) { setIssueError(err.message || 'Unexpected error.'); }
    setIssuing(false);
  };

  const templateForCourse = (courseId) => templates.find(t => t.course_id === courseId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-[#202124]">Certificates</h3>
        <div className="flex gap-2 flex-wrap">
          {[{ key: 'templates', label: '📄 Templates' }, { key: 'issue', label: '🏆 Issue' }, { key: 'issued', label: `📋 Issued (${certificates.length})` }].map((s) => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} className={`px-4 py-2 rounded-lg text-xs font-medium border transition ${activeSection === s.key ? 'bg-[#F5A623] text-[#0C0E13] border-[#F5A623]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#F5A623]'}`}>{s.label}</button>
          ))}
        </div>
      </div>

      {activeSection === 'templates' && (
        <div>
          <div className="bg-[#fff8e8] rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-[#b87a00] mb-2">Placeholder guide</p>
            <div className="flex flex-wrap gap-2">
              {['{{student_name}}', '{{student_id}}', '{{course_title}}', '{{awarding_body}}', '{{level}}', '{{grade}}', '{{date}}', '{{year}}'].map(p => (
                <span key={p} className="font-mono text-[10px] bg-white border border-[#F5A623]/30 text-[#b87a00] px-2 py-1 rounded-lg">{p}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {courses.length === 0 && <p className="text-xs text-gray-400 text-center py-8">No courses yet.</p>}
            {courses.map((c) => {
              const tmpl = templateForCourse(c.id);
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#F5A623] transition">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xl shrink-0">{c.emoji || '📚'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#202124] truncate">{c.title}</p>
                      {tmpl ? <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">✓ Template uploaded</span>
                        : <span className="text-[10px] bg-[#fce8e6] text-[#c5221f] px-2 py-0.5 rounded-full">No template yet</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {tmpl && (
                      <>
                        <a href={tmpl.template_url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2.5 py-1 rounded-lg border border-[#F5A623] text-[#b87a00] hover:bg-[#fff8e8] transition">Preview</a>
                        <button onClick={() => deleteTemplate(tmpl.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Delete</button>
                      </>
                    )}
                    <label className={`text-[10px] px-3 py-1.5 rounded-lg text-[#0C0E13] font-medium cursor-pointer hover:opacity-90 transition ${uploadingTemplate === c.id ? 'bg-gray-400' : 'bg-[#F5A623]'}`}>
                      {uploadingTemplate === c.id ? 'Uploading...' : tmpl ? '🔄 Replace' : '⬆ Upload'}
                      <input type="file" accept=".pdf" onChange={(e) => uploadTemplate(c.id, e.target.files[0])} className="hidden" disabled={uploadingTemplate === c.id} />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSection === 'issue' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <h4 className="text-sm font-semibold text-[#202124] mb-4">Issue a certificate</h4>
            {issueResult ? (
              <div>
                <div className="bg-[#e6f4ea] rounded-xl p-5 mb-4 text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-sm font-semibold text-[#137333]">Certificate issued!</p>
                </div>
                <div className="flex gap-3 mb-3">
                  <a href={issueResult.certificate_url} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-sm font-medium hover:bg-[#fff8e8] transition text-center">👁 Preview</a>
                  <a href={issueResult.certificate_url} download className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition text-center">⬇ Download</a>
                </div>
                <button onClick={() => { setIssueResult(null); setIssueForm({ student_id: '', course_id: '', grade: '' }); }} className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Issue another</button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Student <span className="text-[#ea4335]">*</span></label>
                    <select value={issueForm.student_id} onChange={(e) => setIssueForm({ ...issueForm, student_id: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition">
                      <option value="">Select student...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} — {s.student_id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Course <span className="text-[#ea4335]">*</span></label>
                    <select value={issueForm.course_id} onChange={(e) => setIssueForm({ ...issueForm, course_id: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition">
                      <option value="">Select course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.title}{!templateForCourse(c.id) ? ' (no template)' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Final grade <span className="text-[#ea4335]">*</span></label>
                    <select value={issueForm.grade} onChange={(e) => setIssueForm({ ...issueForm, grade: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition">
                      <option value="">Select grade...</option>
                      {['Distinction', 'Merit', 'Pass', '100%', '95%', '90%', '85%', '80%', '75%', '70%'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                {issueError && <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><span>⚠️</span><span>{issueError}</span></div>}
                <button onClick={issueCertificate} disabled={issuing || !issueForm.student_id || !issueForm.course_id || !issueForm.grade} className="w-full py-3 rounded-xl bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed">
                  {issuing ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-[#0C0E13] border-t-transparent rounded-full animate-spin"></span>Generating...</span> : '🏆 Generate & issue certificate'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {activeSection === 'issued' && (
        <div className="flex flex-col gap-3">
          {certificates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-xs text-gray-400">No certificates issued yet.</p>
            </div>
          ) : certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#F5A623] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#e6f4ea] rounded-xl flex items-center justify-center text-xl shrink-0">🏆</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#202124]">{cert.student?.first_name} {cert.student?.last_name}</p>
                  <p className="text-xs text-gray-400">{cert.course?.emoji} {cert.course?.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-mono">{cert.student?.student_id}</span>
                    {cert.grade && <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">{cert.grade}</span>}
                  </div>
                </div>
              </div>
              {cert.certificate_url && (
                <div className="flex items-center gap-2 shrink-0">
                  <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] hover:bg-[#fff8e8] transition">👁 Preview</a>
                  <a href={cert.certificate_url} download className="text-[10px] px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] hover:opacity-90 transition">⬇ Download</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}export default function AdminPanel() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('tab') || 'Overview';
    }
    return 'Overview';
  });

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    const handlePop = () => {
      const tab = new URLSearchParams(window.location.search).get('tab') || 'Overview';
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const [courses, setCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', category: '', level: '', price: '', original_price: '', awarding_body: '', payment_model: 'full', installment_amount: '', installment_months: '', installment_note: '' });
  const [savingCourse, setSavingCourse] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editAnnouncementText, setEditAnnouncementText] = useState('');

  const [students, setStudents] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [assessors, setAssessors] = useState([]);
  const [showAddAssessor, setShowAddAssessor] = useState(false);
  const [newAssessor, setNewAssessor] = useState({ first_name: '', last_name: '', email: '' });
  const [addingAssessor, setAddingAssessor] = useState(false);
  const [addAssessorError, setAddAssessorError] = useState('');
  const [addAssessorSuccess, setAddAssessorSuccess] = useState('');
  const [selectedAssessor, setSelectedAssessor] = useState(null);
  const [assessorPermissions, setAssessorPermissions] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState(null);
  const [viewingAssessor, setViewingAssessor] = useState(null);

  const [supportStaff, setSupportStaff] = useState([]);
  const [showAddSupport, setShowAddSupport] = useState(false);
  const [newSupport, setNewSupport] = useState({ first_name: '', last_name: '', email: '' });
  const [addingSupport, setAddingSupport] = useState(false);
  const [addSupportError, setAddSupportError] = useState('');
  const [addSupportSuccess, setAddSupportSuccess] = useState('');
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [supportPermissions, setSupportPermissions] = useState([]);
  const [savingSupportPermissions, setSavingSupportPermissions] = useState(false);

  const [enrolmentRequests, setEnrolmentRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [approveResult, setApproveResult] = useState(null);
  const [approvePayment, setApprovePayment] = useState({ amount: '', payment_type: 'full', notes: '' });

  const [stats, setStats] = useState({ students: 0, courses: 0, submissions: 0, certificates: 0, pending: 0 });

  const [siteSettings, setSiteSettings] = useState({
    bank_name: '', bank_account: '', bank_sort_code: '', bank_iban: '',
    whatsapp_number: '', payment_methods: 'bank_transfer,card', custom_payment_methods: '[]',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!data || data.role !== 'super_admin') { router.push('/dashboard'); return; }
      setProfile(data);
      setLoading(false);
      fetchAll();
    };
    checkAuth();
  }, []);

  const fetchAll = () => { fetchCourses(); fetchAnnouncements(); fetchStudents(); fetchStats(); fetchEnrolmentRequests(); fetchAssessors(); fetchSiteSettings(); fetchSupportStaff(); };

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data) setCourses(data);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  const fetchAssessors = async () => {
    const { data: assessorData, error } = await supabase.from('profiles').select('*').eq('role', 'assessor').order('created_at', { ascending: false });
    if (error || !assessorData?.length) { setAssessors([]); return; }
    const ids = assessorData.map(a => a.id);
    const { data: permsData } = await supabase.from('assessor_permissions').select('assessor_id, permission').in('assessor_id', ids);
    setAssessors(assessorData.map(a => ({
      ...a,
      assessor_permissions: (permsData || []).filter(p => p.assessor_id === a.id).map(p => ({ permission: p.permission })),
    })));
  };

  const fetchEnrolmentRequests = async () => {
    const { data } = await supabase.from('enrolment_requests').select('*, course:courses(id, title, emoji, category)').order('created_at', { ascending: false });
    if (data) setEnrolmentRequests(data);
  };

  const fetchStats = async () => {
    const [{ count: sc }, { count: cc }, { count: subc }, { count: certc }, { count: pc }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
      supabase.from('enrolment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    setStats({ students: sc || 0, courses: cc || 0, submissions: subc || 0, certificates: certc || 0, pending: pc || 0 });
  };

  const fetchSiteSettings = async () => {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data) {
      const map = {};
      data.forEach(s => { map[s.key] = s.value || ''; });
      setSiteSettings(prev => ({ ...prev, ...map }));
    }
  };

  const fetchStudentDetails = async (student) => {
    setLoadingStudent(true);
    setViewingStudent(student);
    const [{ data: enrolments }, { data: payments }, { data: submissions }, { data: certs }] = await Promise.all([
      supabase.from('enrolments').select('*, course:courses(id, title, emoji, price, original_price, payment_model, installment_amount, installment_months)').eq('student_id', student.id).order('enrolled_at', { ascending: false }),
      supabase.from('student_payments').select('*').eq('student_id', student.id).order('paid_at', { ascending: false }),
      supabase.from('submissions').select('*, assignment:assignments(title)').eq('student_id', student.id).order('submitted_at', { ascending: false }),
      supabase.from('certificates').select('*, course:courses(title, emoji)').eq('student_id', student.id),
    ]);
    const totalPaid = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const enrolmentsWithBalance = (enrolments || []).map(e => {
      const coursePaid = (payments || []).filter(p => p.course_id === e.course_id).reduce((sum, p) => sum + (p.amount || 0), 0);
      return { ...e, paid: coursePaid, outstanding: Math.max(0, (e.course?.price || 0) - coursePaid) };
    });
    setStudentDetails({ enrolments: enrolmentsWithBalance, payments: payments || [], submissions: submissions || [], certificates: certs || [], totalPaid });
    setLoadingStudent(false);
  };

  const saveSiteSettings = async () => {
    setSavingSettings(true);
    for (const [key, value] of Object.entries(siteSettings)) {
      await supabase.from('site_settings').upsert({ key, value, updated_by: profile.id, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const addCourse = async () => {
    if (!newCourse.title.trim()) return;
    setSavingCourse(true);
    const price = parseFloat(newCourse.price?.replace('£', '') || 0);
    const originalPrice = parseFloat(newCourse.original_price?.replace('£', '') || 0);
    await supabase.from('courses').insert({
      title: newCourse.title, category: newCourse.category, level: newCourse.level,
      price, original_price: originalPrice || null, awarding_body: newCourse.awarding_body,
      payment_model: newCourse.payment_model || 'full',
      installment_amount: newCourse.payment_model === 'installment' ? parseFloat(newCourse.installment_amount || 0) : null,
      installment_months: newCourse.payment_model === 'installment' ? parseInt(newCourse.installment_months || 0) : null,
      installment_note: newCourse.installment_note || null,
      created_by: profile.id, price_updated_by: profile.id, price_updated_at: new Date().toISOString(),
    });
    await fetchCourses();
    setNewCourse({ title: '', category: '', level: '', price: '', original_price: '', awarding_body: '', payment_model: 'full', installment_amount: '', installment_months: '', installment_note: '' });
    setShowAddCourse(false);
    setSavingCourse(false);
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    await supabase.from('courses').delete().eq('id', id);
    await fetchCourses();
  };

  const addAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    setSavingAnnouncement(true);
    await supabase.from('announcements').insert({ title: newAnnouncement, body: newAnnouncement, is_published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    await fetchAnnouncements();
    setNewAnnouncement('');
    setShowAddAnnouncement(false);
    setSavingAnnouncement(false);
  };

  const saveEditAnnouncement = async () => {
    if (!editingAnnouncement || !editAnnouncementText.trim()) return;
    await supabase.from('announcements').update({ title: editAnnouncementText, body: editAnnouncementText, updated_at: new Date().toISOString() }).eq('id', editingAnnouncement.id);
    setEditingAnnouncement(null);
    setEditAnnouncementText('');
    await fetchAnnouncements();
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    await fetchAnnouncements();
  };

  const deleteStudent = async (student) => {
    if (!confirm(`Remove ${student.first_name} ${student.last_name}? This will permanently delete their account.`)) return;
    try {
      const res = await fetch('/api/students/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: student.id }) });
      const data = await res.json();
      if (!res.ok || data.error) { alert(`Failed: ${data.error}`); return; }
      if (viewingStudent?.id === student.id) { setViewingStudent(null); setStudentDetails(null); }
      await fetchStudents(); await fetchStats();
    } catch (err) { alert(`Failed: ${err.message}`); }
  };

  const addAssessor = async () => {
    if (!newAssessor.first_name.trim() || !newAssessor.email.trim()) { setAddAssessorError('First name and email are required.'); return; }
    setAddingAssessor(true); setAddAssessorError(''); setAddAssessorSuccess('');
    const email = newAssessor.email.trim().toLowerCase();
    const { data: existing } = await supabase.from('profiles').select('id, role').eq('email', email).maybeSingle();
    if (existing) {
      if (existing.role === 'super_admin') { setAddAssessorError('This user is a super admin.'); setAddingAssessor(false); return; }
      if (existing.role === 'assessor') { setAddAssessorError('Already an assessor.'); setAddingAssessor(false); return; }
      await supabase.from('profiles').update({ role: 'assessor' }).eq('id', existing.id);
    } else {
      const newId = crypto.randomUUID();
      const studentId = `LH-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;
      const { error: insertErr } = await supabase.from('profiles').insert({ id: newId, first_name: newAssessor.first_name.trim(), last_name: newAssessor.last_name.trim() || '', email, role: 'assessor', student_id: studentId });
      if (insertErr) { setAddAssessorError(`Failed: ${insertErr.message}`); setAddingAssessor(false); return; }
    }
    const firstName = newAssessor.first_name.trim();
    setNewAssessor({ first_name: '', last_name: '', email: '' });
    setShowAddAssessor(false); setAddingAssessor(false);
    await fetchAssessors();
    setAddAssessorSuccess(`${firstName} added as assessor!`);
    setTimeout(() => setAddAssessorSuccess(''), 3000);
  };

  const removeAssessor = async (assessor) => {
    if (!confirm('Remove this assessor?')) return;
    await supabase.from('profiles').update({ role: 'student' }).eq('id', assessor.id);
    await supabase.from('assessor_permissions').delete().eq('assessor_id', assessor.id);
    await fetchAssessors();
  };

  const fetchSupportStaff = async () => {
  const { data: supportData } = await supabase.from('profiles').select('*').eq('role', 'support').order('created_at', { ascending: false });
  if (!supportData?.length) { setSupportStaff([]); return; }
  const ids = supportData.map(s => s.id);
  const { data: permsData } = await supabase.from('support_permissions').select('support_id, permission').in('support_id', ids);
  setSupportStaff(supportData.map(s => ({
    ...s,
    support_permissions: (permsData || []).filter(p => p.support_id === s.id).map(p => ({ permission: p.permission })),
  })));
};

const addSupportMember = async () => {
  if (!newSupport.first_name.trim() || !newSupport.email.trim()) { setAddSupportError('First name and email are required.'); return; }
  setAddingSupport(true); setAddSupportError(''); setAddSupportSuccess('');
  const email = newSupport.email.trim().toLowerCase();
  const { data: existing } = await supabase.from('profiles').select('id, role').eq('email', email).maybeSingle();
  if (existing) {
    if (existing.role === 'super_admin') { setAddSupportError('This user is a super admin.'); setAddingSupport(false); return; }
    await supabase.from('profiles').update({ role: 'support' }).eq('id', existing.id);
  } else {
    const newId = crypto.randomUUID();
    const { error: insertErr } = await supabase.from('profiles').insert({ id: newId, first_name: newSupport.first_name.trim(), last_name: newSupport.last_name.trim() || '', email, role: 'support' });
    if (insertErr) { setAddSupportError(`Failed: ${insertErr.message}`); setAddingSupport(false); return; }
  }
  setNewSupport({ first_name: '', last_name: '', email: '' });
  setShowAddSupport(false); setAddingSupport(false);
  await fetchSupportStaff();
  setAddSupportSuccess(`${newSupport.first_name.trim()} added to support team!`);
  setTimeout(() => setAddSupportSuccess(''), 3000);
};

const removeSupportMember = async (member) => {
  if (!confirm('Remove this support member?')) return;
  await supabase.from('profiles').update({ role: 'student' }).eq('id', member.id);
  await supabase.from('support_permissions').delete().eq('support_id', member.id);
  await fetchSupportStaff();
};

const openSupportPermissionsModal = async (member) => {
  setSelectedSupport(member);
  const { data } = await supabase.from('support_permissions').select('permission').eq('support_id', member.id);
  setSupportPermissions(data?.map(p => p.permission) || []);
};

const saveSupportPermissions = async () => {
  if (!selectedSupport) return;
  setSavingSupportPermissions(true);
  await supabase.from('support_permissions').delete().eq('support_id', selectedSupport.id);
  if (supportPermissions.length > 0) {
    await supabase.from('support_permissions').insert(supportPermissions.map(p => ({ support_id: selectedSupport.id, permission: p, granted_by: profile.id })));
  }
  await fetchSupportStaff();
  setSavingSupportPermissions(false);
  setSelectedSupport(null);
  setSupportPermissions([]);
};

const toggleSupportPermission = (key) => setSupportPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);

  const openPermissionsModal = async (assessor) => {
    setSelectedAssessor(assessor);
    const { data } = await supabase.from('assessor_permissions').select('permission').eq('assessor_id', assessor.id);
    setAssessorPermissions(data?.map(p => p.permission) || []);
  };

  const togglePermission = (key) => setAssessorPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);

  const savePermissions = async () => {
    if (!selectedAssessor) return;
    setSavingPermissions(true);
    await supabase.from('assessor_permissions').delete().eq('assessor_id', selectedAssessor.id);
    if (assessorPermissions.length > 0) {
      await supabase.from('assessor_permissions').insert(assessorPermissions.map(p => ({ assessor_id: selectedAssessor.id, permission: p, granted_by: profile.id })));
    }
    await fetchAssessors();
    setSavingPermissions(false);
    setSelectedAssessor(null);
    setAssessorPermissions([]);
  };

  const assignCourseToAssessor = async (courseId, assessorId) => {
    setAssigningCourse(courseId);
    await supabase.from('courses').update({ assessor_id: assessorId || null }).eq('id', courseId);
    await fetchCourses();
    setAssigningCourse(null);
  };

  const openApproveModal = (req) => {
    setApproveResult(null);
    setApprovePayment({ amount: '', payment_type: 'full', notes: '' });
    setShowApproveModal(req);
  };

  const approveEnrolment = async () => {
    const req = showApproveModal;
    if (!req) return;
    setProcessingId(req.id);
    try {
      const res = await fetch('/api/enrolments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: req.id, approved_by: profile.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApproveResult({ success: false, message: data.error });
      } else {
        let paymentRecorded = false;
        if (approvePayment.amount && parseFloat(approvePayment.amount) > 0 && data.student_id) {
          const { error: payErr } = await supabase.from('student_payments').insert({
            student_id: data.student_id,
            course_id: req.course_id,
            amount: parseFloat(approvePayment.amount),
            payment_type: approvePayment.payment_type,
            notes: approvePayment.notes || null,
            recorded_by: profile.id,
            paid_at: new Date().toISOString(),
          });
          if (!payErr) paymentRecorded = true;
        }
        setApproveResult({
          success: true,
          studentId: data.student_id,
          schoolId: data.school_id,
          username: data.username,
          password: data.password,
          personalEmail: data.personal_email,
          firstName: data.first_name,
          lastName: data.last_name,
          isExistingUser: data.is_existing_user,
          paymentRecorded,
          paymentAmount: approvePayment.amount,
        });
        await fetchEnrolmentRequests();
        await fetchStats();
        await fetchStudents();
      }
    } catch (err) {
      setApproveResult({ success: false, message: err.message });
    }
    setProcessingId(null);
  };

  const rejectEnrolment = async (req) => {
    setProcessingId(req.id);
    try {
      const res = await fetch('/api/enrolments/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: req.id, reviewed_by: profile.id, notes: rejectNotes }) });
      const data = await res.json();
      if (!res.ok || data.error) { alert(`Rejection failed: ${data.error}`); }
    } catch (err) { alert(`Rejection failed: ${err.message}`); }
    await fetchEnrolmentRequests(); await fetchStats();
    setShowRejectModal(null); setRejectNotes(''); setProcessingId(null);
  };

  const recallDecision = async (id) => {
    if (!confirm('Recall this decision? The student will lose portal access but all their progress will be preserved.')) return;
    try {
      const res = await fetch('/api/enrolments/recall', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: id }) });
      const data = await res.json();
      if (!res.ok || data.error) { alert(`Recall failed: ${data.error}`); return; }
      await fetchEnrolmentRequests(); await fetchStats();
    } catch (err) { alert(`Recall failed: ${err.message}`); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };
  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';
  const tabs = ['Overview', 'Enrolments', 'Courses', 'Students', 'Assessors', 'Support', 'Submissions', 'Certificates', 'Announcements', 'Login Logs', 'Settings'];
  const tabIcons = { Overview:'📊', Enrolments:'📋', Courses:'📚', Students:'👥', Assessors:'👨‍🏫', Support:'🎧', Submissions:'📝', Certificates:'🏆', Announcements:'📢', 'Login Logs':'🔐', Settings:'⚙️' };
  const pending = enrolmentRequests.filter(r => r.status === 'pending');
  const approved = enrolmentRequests.filter(r => r.status === 'approved');
  const rejected = enrolmentRequests.filter(r => r.status === 'rejected');
  const customMethods = (() => { try { return JSON.parse(siteSettings.custom_payment_methods || '[]'); } catch { return []; } })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }return (
    <div className="flex min-h-screen font-sans">
      <SessionTimeout />

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/admin" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0C0E13] font-bold text-xs shrink-0">LA</div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight">Learners Association</span>
            <span className="text-[10px] text-[#F5A623]/70">London · Admin</span>
          </div>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-bold shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-[#F5A623]/70">Super Admin</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Management</p>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => switchTab(tab)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeTab === tab ? 'text-white bg-white/10 border-l-2 border-[#F5A623]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <span style={{ filter: 'grayscale(1)', opacity: activeTab === tab ? 1 : 0.6 }} className="text-base shrink-0">{tabIcons[tab]}</span>
            {tab}
            {tab === 'Enrolments' && stats.pending > 0 && (
              <span className="ml-auto bg-[#ea4335] text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.pending}</span>
            )}
          </button>
        ))}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-1">Support</p>
          <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-gray-400 hover:text-white hover:bg-white/5 w-full">
            <span style={{ filter: 'grayscale(1)', opacity: 0.6 }} className="text-base shrink-0">👤</span>
            My Profile
          </Link>
          
        </div>
        <div className="mt-auto pt-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">
            <span style={{ filter: 'grayscale(1)', opacity: 0.6 }} className="text-base shrink-0">🚪</span>
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-60 bg-[#f0f2f5] p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400">Welcome back,</p>
            <h2 className="text-xl font-semibold text-[#202124]">{profile?.first_name} {profile?.last_name} 👋</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[#202124]">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-[#F5A623]">Super Admin</p>
            </div>
            <Link href="/admin/profile" className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-sm font-bold hover:opacity-90 transition">{initials}</Link>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 md:hidden">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => switchTab(tab)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${activeTab === tab ? 'bg-[#F5A623] text-[#0C0E13] border-[#F5A623]' : 'bg-white text-gray-500 border-gray-200'}`}>
              {tab}{tab === 'Enrolments' && stats.pending > 0 ? ` (${stats.pending})` : ''}
            </button>
          ))}
        </div>

        {/* ── MODAL: Permissions ── */}
        {selectedAssessor && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#202124]">Manage permissions</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedAssessor.first_name} {selectedAssessor.last_name} · {selectedAssessor.email}</p>
                </div>
                <button onClick={() => setSelectedAssessor(null)} className="text-gray-400 hover:text-[#202124] text-lg">✕</button>
              </div>
              <div className="bg-[#fff8e1] rounded-xl p-3 mb-4">
                <p className="text-[11px] text-[#f9a825]">All permissions are <strong>off by default</strong>. Toggle to grant or revoke.</p>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {PERMISSIONS.map((p) => {
                  const isOn = assessorPermissions.includes(p.key);
                  return (
                    <div key={p.key} onClick={() => togglePermission(p.key)} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition select-none ${isOn ? 'border-[#F5A623] bg-[#fff8e8]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{p.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-[#202124]">{p.label}</p>
                          <p className="text-[11px] text-gray-400">{p.desc}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ml-3 ${isOn ? 'bg-[#F5A623]' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAssessorPermissions([])} className="px-4 py-2.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-sm hover:bg-[#fce8e6] transition">Clear all</button>
                <button onClick={() => setSelectedAssessor(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Cancel</button>
                <button onClick={savePermissions} disabled={savingPermissions} className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                  {savingPermissions ? 'Saving...' : 'Save permissions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Support Permissions ── */}
        {selectedSupport && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#202124]">Support permissions</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedSupport.first_name} {selectedSupport.last_name} · {selectedSupport.email}</p>
                </div>
                <button onClick={() => setSelectedSupport(null)} className="text-gray-400 hover:text-[#202124] text-lg">✕</button>
              </div>
              <div className="bg-[#fff8e1] rounded-xl p-3 mb-4">
                <p className="text-[11px] text-[#f9a825]">All permissions are <strong>off by default</strong>. Toggle to grant or revoke.</p>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {SUPPORT_PERMISSIONS.map((p) => {
                  const isOn = supportPermissions.includes(p.key);
                  return (
                    <div key={p.key} onClick={() => toggleSupportPermission(p.key)} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition select-none ${isOn ? 'border-[#F5A623] bg-[#fff8e8]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{p.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-[#202124]">{p.label}</p>
                          <p className="text-[11px] text-gray-400">{p.desc}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ml-3 ${isOn ? 'bg-[#F5A623]' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSupportPermissions([])} className="px-4 py-2.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-sm hover:bg-[#fce8e6] transition">Clear all</button>
                <button onClick={() => setSelectedSupport(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Cancel</button>
                <button onClick={saveSupportPermissions} disabled={savingSupportPermissions} className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                  {savingSupportPermissions ? 'Saving...' : 'Save permissions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Approve ── */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#202124]">Approve enrolment</h3>
                {!approveResult && (
                  <button onClick={() => { setShowApproveModal(null); setApprovePayment({ amount: '', payment_type: 'full', notes: '' }); }} className="text-gray-400 hover:text-[#202124] text-lg">✕</button>
                )}
              </div>
              {!approveResult ? (
                <>
                  <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
                    <p className="text-xs font-medium text-[#202124]">{showApproveModal.full_name}</p>
                    <p className="text-[10px] text-gray-400">{showApproveModal.email}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{showApproveModal.course?.emoji} {showApproveModal.course?.title}</p>
                  </div>
                  <div className="bg-[#fff8e8] rounded-xl p-4 mb-4 border border-[#F5A623]/20">
                    <p className="text-xs font-semibold text-[#b87a00] mb-3">💰 Record initial payment (optional)</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Amount (£)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={approvePayment.amount}
                          onChange={e => setApprovePayment({ ...approvePayment, amount: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#202124] outline-none focus:border-[#F5A623]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Payment type</label>
                        <select
                          value={approvePayment.payment_type}
                          onChange={e => setApprovePayment({ ...approvePayment, payment_type: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#202124] outline-none focus:border-[#F5A623]"
                        >
                          <option value="full">Full payment</option>
                          <option value="installment">Installment</option>
                          <option value="deposit">Deposit</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. First installment"
                        value={approvePayment.notes}
                        onChange={e => setApprovePayment({ ...approvePayment, notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#202124] outline-none focus:border-[#F5A623]"
                      />
                    </div>
                  </div>
                  <div className="bg-[#fff8e8] rounded-xl p-3 mb-4">
                    <p className="text-[11px] text-[#b87a00]">✨ School ID, username and password will be generated automatically and emailed to the student.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowApproveModal(null); setApprovePayment({ amount: '', payment_type: 'full', notes: '' }); }} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Cancel</button>
                    <button onClick={approveEnrolment} disabled={processingId === showApproveModal.id} className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                      {processingId === showApproveModal.id ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-[#0C0E13] border-t-transparent rounded-full animate-spin"></span>Creating...</span> : '✅ Approve & create account'}
                    </button>
                  </div>
                </>
              ) : approveResult.success ? (
                <div>
                  <div className="bg-[#e6f4ea] rounded-xl p-4 mb-4 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm font-semibold text-[#137333]">{approveResult.isExistingUser ? 'Re-approved! Access restored.' : 'Approved! Account created.'}</p>
                  </div>
                  <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-[#202124] mb-3">Student credentials:</p>
                    {[
                      { label: 'Name', value: `${approveResult.firstName} ${approveResult.lastName}` },
                      { label: 'Personal email', value: approveResult.personalEmail },
                      { label: 'School ID', value: approveResult.schoolId },
                      { label: 'Username', value: approveResult.username },
                      !approveResult.isExistingUser && { label: 'Password', value: approveResult.password },
                    ].filter(Boolean).map((d) => (
                      <div key={d.label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2">
                        <span className="text-xs text-gray-400 shrink-0">{d.label}</span>
                        <span className="text-xs font-mono font-medium text-[#202124] text-right break-all">{d.value}</span>
                      </div>
                    ))}
                  </div>
                  {approveResult.paymentRecorded && (
                    <div className="bg-[#e6f4ea] rounded-xl p-3 mb-4">
                      <p className="text-[11px] text-[#137333]">💰 Payment of £{approveResult.paymentAmount} recorded successfully.</p>
                    </div>
                  )}
                  {!approveResult.isExistingUser && (
                    <>
                      <div className="bg-[#fff8e8] rounded-xl p-3 mb-4">
                        <p className="text-[11px] text-[#b87a00]">📧 Welcome email sent to student's personal email.</p>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(`Name: ${approveResult.firstName} ${approveResult.lastName}\nSchool ID: ${approveResult.schoolId}\nUsername: ${approveResult.username}\nPassword: ${approveResult.password}\nLogin: learnersassociation.co.uk/login`); alert('Copied!'); }} className="w-full mb-3 py-2.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-sm font-medium hover:bg-[#fff8e8] transition">📋 Copy credentials</button>
                    </>
                  )}
                  <button onClick={() => { setShowApproveModal(null); setApprovePayment({ amount: '', payment_type: 'full', notes: '' }); }} className="w-full py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition">Done</button>
                </div>
              ) : (
                <div>
                  <div className="bg-[#fce8e6] rounded-xl p-4 mb-4">
                    <p className="text-xs text-[#c5221f] font-medium mb-1">Something went wrong</p>
                    <p className="text-xs text-[#c5221f]">{approveResult.message}</p>
                  </div>
                  <button onClick={() => setApproveResult(null)} className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Try again</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL: Reject ── */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-2">Reject enrolment</h3>
              <div className="bg-[#f8f9fa] rounded-xl p-3 mb-4">
                <p className="text-xs font-medium text-[#202124]">{showRejectModal.full_name}</p>
                <p className="text-[10px] text-gray-400">{showRejectModal.email} · {showRejectModal.course?.title}</p>
              </div>
              <textarea rows={3} value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} placeholder="Reason for rejection..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition resize-none mb-4" />
              <div className="bg-[#fff8e1] rounded-xl p-3 mb-4">
                <p className="text-[11px] text-[#f9a825]">Contact student: <strong>{showRejectModal.whatsapp || showRejectModal.phone}</strong></p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowRejectModal(null); setRejectNotes(''); }} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Cancel</button>
                <button onClick={() => rejectEnrolment(showRejectModal)} disabled={processingId === showRejectModal.id} className="flex-1 py-2.5 rounded-lg bg-[#ea4335] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                  {processingId === showRejectModal.id ? 'Rejecting...' : 'Confirm reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Edit announcement ── */}
        {editingAnnouncement && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-4">Edit announcement</h3>
              <input type="text" value={editAnnouncementText} onChange={e => setEditAnnouncementText(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setEditingAnnouncement(null); setEditAnnouncementText(''); }} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Cancel</button>
                <button onClick={saveEditAnnouncement} className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition">Save changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Overview ── */}
        {activeTab === 'Overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total students', value: stats.students, color: 'text-[#F5A623]' },
                { label: 'Active courses', value: stats.courses, color: 'text-[#34a853]' },
                { label: 'Pending submissions', value: stats.submissions, color: 'text-[#ea4335]' },
                { label: 'Certificates issued', value: stats.certificates, color: 'text-[#fbbc04]' },
                { label: 'Pending enrolments', value: stats.pending, color: 'text-[#ea4335]' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-[#202124] mb-3">Quick actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Review enrolments', icon: '📋', color: 'bg-[#fce8e6] text-[#ea4335]', tab: 'Enrolments' },
                { label: 'Add new course', icon: '➕', color: 'bg-[#fff8e8] text-[#b87a00]', tab: 'Courses' },
                { label: 'Manage assessors', icon: '👨‍🏫', color: 'bg-[#fff8e1] text-[#f9a825]', tab: 'Assessors' },
                { label: 'Site settings', icon: '⚙️', color: 'bg-[#e6f4ea] text-[#34a853]', tab: 'Settings' },
              ].map((a) => (
                <button key={a.label} onClick={() => switchTab(a.tab)} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#F5A623] transition text-left">
                  <div className={`w-9 h-9 ${a.color} rounded-xl flex items-center justify-center text-lg mb-2`}>{a.icon}</div>
                  <p className="text-xs font-medium text-[#202124]">{a.label}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#202124]">Recent students</h3>
                  <button onClick={() => switchTab('Students')} className="text-xs text-[#F5A623] hover:underline">View all</button>
                </div>
                {students.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-xs font-medium shrink-0">
                      {`${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#202124] truncate">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] text-gray-400 font-mono truncate">{s.student_id}</p>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No students yet</p>}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#202124]">Pending enrolments</h3>
                  <button onClick={() => switchTab('Enrolments')} className="text-xs text-[#F5A623] hover:underline">View all</button>
                </div>
                {pending.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#202124] truncate">{r.full_name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.course?.title}</p>
                    </div>
                    <button onClick={() => switchTab('Enrolments')} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#F5A623] text-[#0C0E13] hover:opacity-90 transition shrink-0">Review</button>
                  </div>
                ))}
                {pending.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No pending enrolments</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Enrolments ── */}
        {activeTab === 'Enrolments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Enrolment Requests</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-medium">{pending.length} pending</span>
                <span className="text-xs bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-medium">{approved.length} approved</span>
                <span className="text-xs bg-[#f0f2f5] text-gray-500 px-3 py-1 rounded-full font-medium">{rejected.length} rejected</span>
              </div>
            </div>
            {enrolmentRequests.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-xs text-gray-400">No enrolment requests yet.</p>
              </div>
            )}
            {['pending', 'approved', 'rejected'].map((statusGroup) => {
              const group = enrolmentRequests.filter(r => r.status === statusGroup);
              if (group.length === 0) return null;
              return (
                <div key={statusGroup} className="mb-8">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">
                    {statusGroup === 'pending' ? '⏳ Pending review' : statusGroup === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {group.map((r) => (
                      <div key={r.id} className={`bg-white rounded-xl border p-4 md:p-5 transition ${statusGroup === 'pending' ? 'border-[#fbbc04]/30 hover:border-[#F5A623]' : statusGroup === 'approved' ? 'border-[#34a853]/20' : 'border-[#ea4335]/20'}`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#202124]">{r.full_name}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusGroup === 'pending' ? 'bg-[#fff8e1] text-[#f9a825]' : statusGroup === 'approved' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>{statusGroup}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-3">
                              <p className="text-xs text-gray-500">📧 {r.email}</p>
                              <p className="text-xs text-gray-500">📞 {r.phone}</p>
                              {r.whatsapp && <p className="text-xs text-gray-500">💬 {r.whatsapp}</p>}
                              <p className="text-xs text-gray-500">🎂 {r.dob}</p>
                              <p className="text-xs text-gray-500 sm:col-span-2">📍 {r.address}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="text-xs bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">{r.course?.emoji} {r.course?.title}</span>
                              <span className="text-xs bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{r.payment_method?.replace('_', ' ')}</span>
                              <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            {statusGroup === 'rejected' && r.notes && <p className="text-xs text-[#c5221f] bg-[#fce8e6] px-3 py-1.5 rounded-lg mt-1">Note: {r.notes}</p>}
                            {statusGroup === 'approved' && r.generated_student_id && (
                              <span className="text-xs bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-mono">ID: {r.generated_student_id}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {r.payment_proof_url && <a href={r.payment_proof_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-xs font-medium hover:bg-[#fff8e8] transition text-center">📄 View proof</a>}
                            {statusGroup === 'pending' && (
                              <>
                                <button onClick={() => openApproveModal(r)} disabled={processingId === r.id} className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">✅ Approve</button>
                                <button onClick={() => setShowRejectModal(r)} disabled={processingId === r.id} className="px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs font-medium hover:bg-[#fce8e6] transition disabled:opacity-60">❌ Reject</button>
                              </>
                            )}
                            {(statusGroup === 'approved' || statusGroup === 'rejected') && (
                              <button onClick={() => recallDecision(r.id)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-[#fbbc04] hover:text-[#f9a825] transition">↩ Recall</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: Courses ── */}
        {activeTab === 'Courses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Manage Courses</h3>
              <button onClick={() => setShowAddCourse(!showAddCourse)} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">➕ Add course</button>
            </div>
            {showAddCourse && (
              <div className="bg-white rounded-xl border border-[#F5A623]/30 p-5 mb-6">
                <h4 className="text-sm font-semibold text-[#202124] mb-4">New course</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Title', key: 'title', placeholder: 'e.g. Level 3 Diploma in Health and Social Care' },
                    { label: 'Category', key: 'category', placeholder: 'e.g. Health & Social Care' },
                    { label: 'Level', key: 'level', placeholder: 'e.g. Level 3' },
                    { label: 'Awarding body', key: 'awarding_body', placeholder: 'e.g. TQUK' },
                    { label: 'Current price (£)', key: 'price', placeholder: 'e.g. 10' },
                    { label: 'Original / cancelled price (£)', key: 'original_price', placeholder: 'e.g. 449 — shows as strikethrough' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-[#202124] mb-1.5">{f.label}</label>
                      <input type="text" placeholder={f.placeholder} value={newCourse[f.key] || ''} onChange={(e) => setNewCourse({ ...newCourse, [f.key]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition" />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Payment model</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'full', label: '💰 Full payment', desc: 'Student pays the full amount upfront' },
                        { value: 'installment', label: '📅 Installment plan', desc: 'Student pays in monthly instalments' },
                      ].map(m => (
                        <button key={m.value} type="button" onClick={() => setNewCourse({ ...newCourse, payment_model: m.value })} className={`p-3 rounded-xl border-2 text-left transition ${newCourse.payment_model === m.value ? 'border-[#F5A623] bg-[#fff8e8]' : 'border-gray-200 hover:border-gray-300'}`}>
                          <p className="text-xs font-medium text-[#202124]">{m.label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {newCourse.payment_model === 'installment' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[#202124] mb-1.5">Monthly instalment (£)</label>
                        <input type="number" placeholder="e.g. 50" value={newCourse.installment_amount || ''} onChange={(e) => setNewCourse({ ...newCourse, installment_amount: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#202124] mb-1.5">Number of months</label>
                        <input type="number" placeholder="e.g. 3" value={newCourse.installment_months || ''} onChange={(e) => setNewCourse({ ...newCourse, installment_months: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-[#202124] mb-1.5">Instalment note (shown to student)</label>
                        <input type="text" placeholder="e.g. Pay £50/month for 3 months" value={newCourse.installment_note || ''} onChange={(e) => setNewCourse({ ...newCourse, installment_note: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition" />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={addCourse} disabled={savingCourse} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">{savingCourse ? 'Saving...' : 'Save course'}</button>
                  <button onClick={() => setShowAddCourse(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {courses.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No courses yet.</p>}
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#F5A623] transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#202124] truncate">{c.emoji} {c.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">{c.category}</span>
                      <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.level}</span>
                      <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.awarding_body}</span>
                      {c.original_price && <span className="text-[10px] text-gray-400 line-through">£{c.original_price}</span>}
                      <span className="text-[10px] text-[#34a853] font-medium">£{c.price}</span>
                      {c.payment_model === 'installment' && <span className="text-[10px] bg-[#fff8e1] text-[#f9a825] px-2 py-0.5 rounded-full">📅 Instalment</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/courses/${c.id}`} className="text-[10px] px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] hover:bg-[#fff8e8] transition">Edit</Link>
                    <button onClick={() => deleteCourse(c.id)} className="text-[10px] px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Students ── */}
        {activeTab === 'Students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Manage Students</h3>
              <span className="text-xs text-gray-400">{students.length} total</span>
            </div>
            {viewingStudent && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-sm font-bold shrink-0">
                        {`${viewingStudent.first_name?.[0] || ''}${viewingStudent.last_name?.[0] || ''}`.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#202124]">{viewingStudent.first_name} {viewingStudent.last_name}</p>
                        <p className="text-xs text-gray-400">{viewingStudent.email}</p>
                      </div>
                    </div>
                    <button onClick={() => { setViewingStudent(null); setStudentDetails(null); }} className="text-gray-400 hover:text-[#202124] text-lg">✕</button>
                  </div>
                  {loadingStudent ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs text-gray-400">Loading student details...</p>
                    </div>
                  ) : studentDetails && (
                    <div className="p-5 flex flex-col gap-5">
                      <div className="bg-[#f8f9fa] rounded-xl p-4">
                        <p className="text-xs font-semibold text-[#202124] mb-3">Account details</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'School ID', value: viewingStudent.student_id },
                            { label: 'Username', value: viewingStudent.username },
                            { label: 'Phone', value: viewingStudent.phone || '—' },
                            { label: 'Date of birth', value: viewingStudent.dob || '—' },
                            { label: 'Address', value: viewingStudent.address || '—' },
                            { label: 'Joined', value: new Date(viewingStudent.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                          ].map(d => (
                            <div key={d.label} className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                              <p className="text-xs font-medium text-[#202124] break-all">{d.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#e6f4ea] rounded-xl p-4 text-center">
                          <p className="text-xs text-[#137333] mb-1">Total paid</p>
                          <p className="text-xl font-bold text-[#137333]">£{studentDetails.totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="bg-[#fce8e6] rounded-xl p-4 text-center">
                          <p className="text-xs text-[#c5221f] mb-1">Outstanding</p>
                          <p className="text-xl font-bold text-[#c5221f]">£{studentDetails.enrolments.reduce((sum, e) => sum + e.outstanding, 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#202124] mb-3">Enrolled courses</p>
                        {studentDetails.enrolments.length === 0 ? (
                          <p className="text-xs text-gray-400">No enrolments</p>
                        ) : studentDetails.enrolments.map(e => (
                          <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-[#202124]">{e.course?.emoji} {e.course?.title}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${e.is_active ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>{e.is_active ? 'Active' : 'Suspended'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div><p className="text-[10px] text-gray-400">Enrolled</p><p className="text-xs text-[#202124]">{new Date(e.enrolled_at).toLocaleDateString('en-GB')}</p></div>
                              <div><p className="text-[10px] text-gray-400">Completed</p><p className="text-xs text-[#202124]">{e.completed_at ? new Date(e.completed_at).toLocaleDateString('en-GB') : '—'}</p></div>
                              <div><p className="text-[10px] text-gray-400">Progress</p><p className="text-xs text-[#202124]">{e.progress || 0}%</p></div>
                              <div><p className="text-[10px] text-gray-400">Course price</p><p className="text-xs text-[#202124]">£{e.course?.price}</p></div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                              <div><p className="text-[10px] text-gray-400">Paid</p><p className="text-xs font-semibold text-[#34a853]">£{e.paid.toFixed(2)}</p></div>
                              <div className="text-right"><p className="text-[10px] text-gray-400">Outstanding</p><p className="text-xs font-semibold text-[#ea4335]">£{e.outstanding.toFixed(2)}</p></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#f8f9fa] rounded-xl p-4">
                        <p className="text-xs font-semibold text-[#202124] mb-3">Record a payment</p>
                        <RecordPayment student={viewingStudent} enrolments={studentDetails.enrolments} profile={profile} onSaved={() => fetchStudentDetails(viewingStudent)} />
                      </div>
                      {studentDetails.payments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#202124] mb-3">Payment history</p>
                          <div className="flex flex-col gap-2">
                            {studentDetails.payments.map(p => (
                              <div key={p.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-2.5">
                                <div>
                                  <p className="text-xs font-medium text-[#202124]">£{p.amount}</p>
                                  <p className="text-[10px] text-gray-400">{p.notes || p.payment_type} · {new Date(p.paid_at).toLocaleDateString('en-GB')}</p>
                                </div>
                                <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">Paid</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {studentDetails.certificates.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#202124] mb-3">Certificates</p>
                          {studentDetails.certificates.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-2.5 mb-2">
                              <p className="text-xs text-[#202124]">{c.course?.emoji} {c.course?.title}</p>
                              <div className="flex items-center gap-2">
                                {c.grade && <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full">{c.grade}</span>}
                                {c.certificate_url && <a href={c.certificate_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#F5A623] hover:underline">Download</a>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">School ID</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Username</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Joined</th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-8">No students yet</td></tr>
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
                      <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-400 font-mono truncate max-w-[160px]">{s.username || '—'}</p></td>
                      <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => fetchStudentDetails(s)} className="text-[10px] px-2.5 py-1 rounded-lg border border-[#F5A623] text-[#b87a00] hover:bg-[#fff8e8] transition">View</button>
                          <button onClick={() => deleteStudent(s)} className="text-[10px] px-2.5 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Assessors ── */}
      {activeTab === 'Assessors' && (
        <div>
          {/* ── Assessor Detail Modal ── */}
          {viewingAssessor && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* ── Header ── */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-sm font-bold shrink-0">
                      {`${viewingAssessor.first_name?.[0] || ''}${viewingAssessor.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#202124]">{viewingAssessor.first_name} {viewingAssessor.last_name}</p>
                      <p className="text-xs text-gray-400">{viewingAssessor.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingAssessor(null)} className="text-gray-400 hover:text-[#202124] text-lg">✕</button>
                </div>

                <div className="p-5 flex flex-col gap-6">

                  {/* ── Permissions summary ── */}
                  <div className="bg-[#f8f9fa] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#202124]">Permissions</p>
                      <button
                        onClick={() => { setViewingAssessor(null); openPermissionsModal(viewingAssessor); }}
                        className="text-[10px] px-3 py-1 rounded-lg border border-[#F5A623] text-[#b87a00] hover:bg-[#fff8e8] transition"
                      >
                        🔑 Manage
                      </button>
                    </div>
                    {viewingAssessor.assessor_permissions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {viewingAssessor.assessor_permissions.map(p => {
                          const perm = PERMISSIONS.find(x => x.key === p.permission);
                          return (
                            <span key={p.permission} className="text-[10px] bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">
                              {perm?.icon} {perm?.label}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Standard assessor — no extra permissions</p>
                    )}
                  </div>

                  {/* ── Assigned courses ── */}
                  <div>
                    <p className="text-xs font-semibold text-[#202124] mb-3">✅ Assigned courses</p>
                    {courses.filter(c => c.assessor_id === viewingAssessor.id).length === 0 ? (
                      <div className="bg-[#f8f9fa] rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400">No courses assigned yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {courses.filter(c => c.assessor_id === viewingAssessor.id).map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-white rounded-xl border border-[#34a853]/30 px-4 py-3 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-lg shrink-0">{c.emoji || '📚'}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#202124] truncate">{c.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.level}</span>
                                  <span className="text-[10px] text-[#34a853] font-medium">£{c.price}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                await assignCourseToAssessor(c.id, null);
                                setViewingAssessor(prev => ({ ...prev }));
                              }}
                              disabled={assigningCourse === c.id}
                              className="text-[10px] px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition shrink-0 disabled:opacity-60"
                            >
                              {assigningCourse === c.id ? '...' : '✕ Unassign'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Unassigned courses ── */}
                  <div>
                    <p className="text-xs font-semibold text-[#202124] mb-3">📋 Unassigned courses</p>
                    {courses.filter(c => !c.assessor_id).length === 0 ? (
                      <div className="bg-[#f8f9fa] rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400">All courses are assigned.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {courses.filter(c => !c.assessor_id).map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 gap-3 hover:border-[#F5A623] transition">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-lg shrink-0">{c.emoji || '📚'}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#202124] truncate">{c.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.level}</span>
                                  <span className="text-[10px] text-[#34a853] font-medium">£{c.price}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                await assignCourseToAssessor(c.id, viewingAssessor.id);
                                setViewingAssessor(prev => ({ ...prev }));
                              }}
                              disabled={assigningCourse === c.id}
                              className="text-[10px] px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#0C0E13] hover:opacity-90 transition shrink-0 disabled:opacity-60"
                            >
                              {assigningCourse === c.id ? '...' : '+ Assign'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Courses assigned to other assessors ── */}
                  {courses.filter(c => c.assessor_id && c.assessor_id !== viewingAssessor.id).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#202124] mb-3">🔒 Assigned to other assessors</p>
                      <div className="flex flex-col gap-2">
                        {courses.filter(c => c.assessor_id && c.assessor_id !== viewingAssessor.id).map(c => {
                          const otherAssessor = assessors.find(a => a.id === c.assessor_id);
                          return (
                            <div key={c.id} className="flex items-center justify-between bg-[#f8f9fa] rounded-xl border border-gray-100 px-4 py-3 gap-3 opacity-60">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-lg shrink-0">{c.emoji || '📚'}</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-[#202124] truncate">{c.title}</p>
                                  <p className="text-[10px] text-gray-400">
                                    Assigned to {otherAssessor ? `${otherAssessor.first_name} ${otherAssessor.last_name}` : 'another assessor'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">—</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Remove assessor ── */}
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => { setViewingAssessor(null); removeAssessor(viewingAssessor); }}
                      className="px-4 py-2 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs font-medium hover:bg-[#fce8e6] transition"
                    >
                      Remove assessor
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-[#202124]">Manage Assessors</h3>
      <button onClick={() => { setShowAddAssessor(!showAddAssessor); setAddAssessorError(''); }} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">➕ Add assessor</button>
    </div>
    {addAssessorSuccess && <div className="bg-[#e6f4ea] text-[#137333] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><span>✓</span><span>{addAssessorSuccess}</span></div>}
    {showAddAssessor && (
      <div className="bg-white rounded-xl border border-[#F5A623]/30 p-5 mb-6">
        <h4 className="text-sm font-semibold text-[#202124] mb-1">Add new assessor</h4>
        <p className="text-xs text-gray-400 mb-4">They will be added instantly and active immediately.</p>
        {addAssessorError && <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-3 flex items-center gap-2"><span>⚠️</span><span>{addAssessorError}</span></div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">First name <span className="text-[#ea4335]">*</span></label>
            <input type="text" placeholder="e.g. James" value={newAssessor.first_name} onChange={(e) => setNewAssessor({ ...newAssessor, first_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">Last name</label>
            <input type="text" placeholder="e.g. Mitchell" value={newAssessor.last_name} onChange={(e) => setNewAssessor({ ...newAssessor, last_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">Email address <span className="text-[#ea4335]">*</span></label>
            <input type="email" placeholder="e.g. james@example.com" value={newAssessor.email} onChange={(e) => setNewAssessor({ ...newAssessor, email: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addAssessor()} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addAssessor} disabled={addingAssessor || !newAssessor.first_name.trim() || !newAssessor.email.trim()} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">
            {addingAssessor ? 'Adding...' : 'Add assessor'}
          </button>
          <button onClick={() => { setShowAddAssessor(false); setAddAssessorError(''); setNewAssessor({ first_name: '', last_name: '', email: '' }); }} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
        </div>
      </div>
    )}
    {assessors.length === 0 ? (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">👨‍🏫</div>
        <h4 className="text-sm font-semibold text-[#202124] mb-1">No assessors yet</h4>
        <p className="text-xs text-gray-400">Add assessors above to start grading student submissions.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {assessors.map((a, index) => (
          <div
            key={a.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-[#F5A623] transition overflow-hidden cursor-pointer"
            onClick={() => setViewingAssessor(a)}
          >
            <div className="flex items-center gap-4 p-4 md:p-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fff8e8] text-[#b87a00] text-xs font-bold shrink-0">{index + 1}</div>
              <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-sm font-bold shrink-0">
                {`${a.first_name?.[0] || ''}${a.last_name?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#202124]">{a.first_name} {a.last_name}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
                {a.assessor_permissions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.assessor_permissions.map(p => {
                      const perm = PERMISSIONS.find(x => x.key === p.permission);
                      return <span key={p.permission} className="text-[10px] bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">{perm?.icon} {perm?.label}</span>;
                    })}
                  </div>
                ) : <p className="text-[10px] text-gray-400 italic mt-0.5">Standard assessor — no extra permissions</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => openPermissionsModal(a)} className="px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-xs font-medium hover:bg-[#fff8e8] transition">🔑 Permissions</button>
                <button onClick={() => removeAssessor(a)} className="px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs font-medium hover:bg-[#fce8e6] transition">Remove</button>
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 md:px-5 py-3 bg-[#f8f9fa]" onClick={e => e.stopPropagation()}>
              <p className="text-xs font-medium text-[#202124] mb-2">📚 Course assignments</p>
              <div className="flex flex-wrap gap-2">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
                    <span>{c.emoji || '📚'}</span>
                    <span className="text-gray-600 max-w-[100px] truncate">{c.title}</span>
                    {c.assessor_id === a.id ? (
                      <button onClick={() => assignCourseToAssessor(c.id, null)} disabled={assigningCourse === c.id} className="text-[10px] text-[#ea4335] hover:underline disabled:opacity-60 shrink-0">✕</button>
                    ) : (
                      <button onClick={() => assignCourseToAssessor(c.id, a.id)} disabled={assigningCourse === c.id || (c.assessor_id && c.assessor_id !== a.id)} className={`text-[10px] shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${c.assessor_id && c.assessor_id !== a.id ? 'text-gray-300' : 'text-[#F5A623] hover:underline'}`}>
                        {c.assessor_id && c.assessor_id !== a.id ? '—' : assigningCourse === c.id ? '...' : '+ Assign'}
                      </button>
                    )}
                  </div>
                ))}
                {courses.length === 0 && <p className="text-xs text-gray-400">No courses available</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}  
        {/* ── TAB: Support ── */}
{activeTab === 'Support' && (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-[#202124]">Support Team</h3>
      <button onClick={() => { setShowAddSupport(!showAddSupport); setAddSupportError(''); }} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">➕ Add support member</button>
    </div>
    {addSupportSuccess && <div className="bg-[#e6f4ea] text-[#137333] text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><span>✓</span><span>{addSupportSuccess}</span></div>}
    {showAddSupport && (
      <div className="bg-white rounded-xl border border-[#F5A623]/30 p-5 mb-6">
        <h4 className="text-sm font-semibold text-[#202124] mb-1">Add new support member</h4>
        <p className="text-xs text-gray-400 mb-4">They will be added instantly. All permissions are off by default.</p>
        {addSupportError && <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-3 flex items-center gap-2"><span>⚠️</span><span>{addSupportError}</span></div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">First name <span className="text-[#ea4335]">*</span></label>
            <input type="text" placeholder="e.g. Sarah" value={newSupport.first_name} onChange={e => setNewSupport({ ...newSupport, first_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">Last name</label>
            <input type="text" placeholder="e.g. Jones" value={newSupport.last_name} onChange={e => setNewSupport({ ...newSupport, last_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202124] mb-1.5">Email address <span className="text-[#ea4335]">*</span></label>
            <input type="email" placeholder="e.g. sarah@example.com" value={newSupport.email} onChange={e => setNewSupport({ ...newSupport, email: e.target.value })} onKeyDown={e => e.key === 'Enter' && addSupportMember()} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addSupportMember} disabled={addingSupport || !newSupport.first_name.trim() || !newSupport.email.trim()} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">
            {addingSupport ? 'Adding...' : 'Add member'}
          </button>
          <button onClick={() => { setShowAddSupport(false); setAddSupportError(''); setNewSupport({ first_name: '', last_name: '', email: '' }); }} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
        </div>
      </div>
    )}
    {supportStaff.length === 0 ? (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">🎧</div>
        <h4 className="text-sm font-semibold text-[#202124] mb-1">No support members yet</h4>
        <p className="text-xs text-gray-400">Add support members above to start managing student queries.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {supportStaff.map((s, index) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#F5A623] transition overflow-hidden">
            <div className="flex items-center gap-4 p-4 md:p-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fff8e8] text-[#b87a00] text-xs font-bold shrink-0">{index + 1}</div>
              <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0C0E13] text-sm font-bold shrink-0">
                {`${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#202124]">{s.first_name} {s.last_name}</p>
                <p className="text-xs text-gray-400">{s.email}</p>
                {s.support_permissions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.support_permissions.map(p => {
                      const perm = SUPPORT_PERMISSIONS.find(x => x.key === p.permission);
                      return <span key={p.permission} className="text-[10px] bg-[#fff8e8] text-[#b87a00] px-2 py-0.5 rounded-full">{perm?.icon} {perm?.label}</span>;
                    })}
                  </div>
                ) : <p className="text-[10px] text-gray-400 italic mt-0.5">No permissions granted</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openSupportPermissionsModal(s)} className="px-3 py-1.5 rounded-lg border border-[#F5A623] text-[#b87a00] text-xs font-medium hover:bg-[#fff8e8] transition">🔑 Permissions</button>
                <button onClick={() => removeSupportMember(s)} className="px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs font-medium hover:bg-[#fce8e6] transition">Remove</button>
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 md:px-5 py-3 bg-[#f8f9fa]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Role', value: 'Support Team' },
                  { label: 'Email', value: s.email },
                  { label: 'Joined', value: new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                ].map(d => (
                  <div key={d.label}>
                    <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                    <p className="text-xs text-[#202124] truncate">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* ── TAB: Submissions ── */}
        {activeTab === 'Submissions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Submissions</h3>
              <span className="text-xs bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full font-medium">{stats.submissions} pending</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-xs text-gray-400">Student submissions are managed by assigned assessors.</p>
            </div>
          </div>
        )}

        {/* ── TAB: Certificates ── */}
        {activeTab === 'Certificates' && <CertificatesManager profile={profile} students={students} courses={courses} />}

        {/* ── TAB: Announcements ── */}
        {activeTab === 'Announcements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Announcements</h3>
              <button onClick={() => setShowAddAnnouncement(!showAddAnnouncement)} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">➕ New announcement</button>
            </div>
            {showAddAnnouncement && (
              <div className="bg-white rounded-xl border border-[#F5A623]/30 p-5 mb-6">
                <input type="text" placeholder="Announcement title..." value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#F5A623] transition mb-3" />
                <div className="flex gap-3">
                  <button onClick={addAnnouncement} disabled={savingAnnouncement} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">{savingAnnouncement ? 'Publishing...' : 'Publish'}</button>
                  <button onClick={() => setShowAddAnnouncement(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
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
                        <p className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}{a.updated_at && a.updated_at !== a.created_at ? ' · edited' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setEditingAnnouncement(a); setEditAnnouncementText(a.title); }} className="text-[10px] px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-[#F5A623] hover:text-[#b87a00] transition">Edit</button>
                      <button onClick={() => deleteAnnouncement(a.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Login Logs ── */}
        {activeTab === 'Login Logs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Login Activity</h3>
              <span className="text-xs text-gray-400">All attempts tracked</span>
            </div>
            <LoginLogs />
          </div>
        )}

        {/* ── TAB: Settings ── */}
        {activeTab === 'Settings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#202124]">Site Settings</h3>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 mb-6">
              <h4 className="text-sm font-semibold text-[#202124] mb-1">🏦 Bank details</h4>
              <p className="text-xs text-gray-400 mb-5">These appear on the student enrolment payment page.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {[
                  { label: 'Account name', key: 'bank_name', placeholder: 'e.g. Learners Association LWM Ltd' },
                  { label: 'Account number', key: 'bank_account', placeholder: 'e.g. 12345678' },
                  { label: 'Sort code', key: 'bank_sort_code', placeholder: 'e.g. 12-34-56' },
                  { label: 'IBAN', key: 'bank_iban', placeholder: 'e.g. GB00XXXX00000012345678' },
                  { label: 'WhatsApp number', key: 'whatsapp_number', placeholder: 'e.g. +447700900000' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} value={siteSettings[f.key] || ''} onChange={(e) => setSiteSettings({ ...siteSettings, [f.key]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] outline-none focus:border-[#F5A623] transition" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={saveSiteSettings} disabled={savingSettings} className="px-6 py-2.5 rounded-lg bg-[#F5A623] text-[#0C0E13] text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
                  {savingSettings ? 'Saving...' : 'Save settings'}
                </button>
                {settingsSaved && <span className="text-xs text-[#34a853]">✓ Settings saved</span>}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 mb-6">
              <h4 className="text-sm font-semibold text-[#202124] mb-1">💳 Payment methods</h4>
              <p className="text-xs text-gray-400 mb-4">Toggle which payment methods students can select on the enrolment form.</p>
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { value: 'bank_transfer', icon: '🏦', label: 'Bank Transfer', desc: 'Student transfers directly to your bank account' },
                  { value: 'card', icon: '💳', label: 'Card Payment', desc: 'Student contacts you via WhatsApp to pay by card' },
                  { value: 'paypal', icon: '🅿️', label: 'PayPal', desc: 'Student pays via PayPal' },
                  { value: 'online_banking', icon: '🌐', label: 'Online Banking', desc: 'Student pays via their online banking app' },
                  { value: 'cash', icon: '💵', label: 'Cash', desc: 'Student pays in cash in person' },
                ].map((m) => {
                  const currentMethods = (siteSettings.payment_methods || 'bank_transfer,card').split(',').filter(Boolean);
                  const isEnabled = currentMethods.includes(m.value);
                  return (
                    <div key={m.value} onClick={() => {
                      const methods = isEnabled ? currentMethods.filter(x => x !== m.value) : [...currentMethods, m.value];
                      setSiteSettings({ ...siteSettings, payment_methods: methods.join(',') });
                    }} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition select-none ${isEnabled ? 'border-[#F5A623] bg-[#fff8e8]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-[#202124]">{m.label}</p>
                          <p className="text-xs text-gray-400">{m.desc}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ${isEnabled ? 'bg-[#F5A623]' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-[#202124] mb-3">➕ Add custom payment method</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Icon (emoji)</label>
                    <input type="text" placeholder="e.g. 🏧" id="custom_icon" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#F5A623]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Label</label>
                    <input type="text" placeholder="e.g. Stripe" id="custom_label" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#F5A623]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Description</label>
                    <input type="text" placeholder="e.g. Pay via Stripe link" id="custom_desc" className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#F5A623]" />
                  </div>
                </div>
                <button onClick={() => {
                  const icon = document.getElementById('custom_icon').value.trim();
                  const label = document.getElementById('custom_label').value.trim();
                  const desc = document.getElementById('custom_desc').value.trim();
                  if (!label) return;
                  const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  const currentMethods = (siteSettings.payment_methods || '').split(',').filter(Boolean);
                  const currentCustom = customMethods;
                  if (currentCustom.find(m => m.value === key)) return;
                  const updated = [...currentCustom, { value: key, icon: icon || '💳', label, desc }];
                  setSiteSettings({ ...siteSettings, payment_methods: [...currentMethods, key].join(','), custom_payment_methods: JSON.stringify(updated) });
                  document.getElementById('custom_icon').value = '';
                  document.getElementById('custom_label').value = '';
                  document.getElementById('custom_desc').value = '';
                }} className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition">Add method</button>
              </div>
              {customMethods.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  <p className="text-xs font-semibold text-[#202124] mb-1">Custom methods</p>
                  {customMethods.map((m) => {
                    const currentMethods = (siteSettings.payment_methods || '').split(',').filter(Boolean);
                    const isEnabled = currentMethods.includes(m.value);
                    return (
                      <div key={m.value} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{m.icon}</span>
                          <div>
                            <p className="text-xs font-medium text-[#202124]">{m.label}</p>
                            <p className="text-[10px] text-gray-400">{m.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div onClick={() => {
                            const methods = isEnabled ? currentMethods.filter(x => x !== m.value) : [...currentMethods, m.value];
                            setSiteSettings({ ...siteSettings, payment_methods: methods.join(',') });
                          }} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer ${isEnabled ? 'bg-[#F5A623]' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                          <button onClick={() => {
                            const custom = customMethods.filter(x => x.value !== m.value);
                            const methods = (siteSettings.payment_methods || '').split(',').filter(x => x !== m.value);
                            setSiteSettings({ ...siteSettings, payment_methods: methods.join(','), custom_payment_methods: JSON.stringify(custom) });
                          }} className="text-[10px] px-2 py-1 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={saveSiteSettings} disabled={savingSettings} className="px-5 py-2 rounded-lg bg-[#F5A623] text-[#0C0E13] text-xs font-medium hover:opacity-90 transition disabled:opacity-60">
                {savingSettings ? 'Saving...' : 'Save payment methods'}
              </button>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-5 border border-gray-200">
              <p className="text-xs font-semibold text-[#202124] mb-3">Preview — what students see on the enrolment page</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Account name', value: siteSettings.bank_name },
                  { label: 'Account number', value: siteSettings.bank_account },
                  { label: 'Sort code', value: siteSettings.bank_sort_code },
                  { label: 'IBAN', value: siteSettings.bank_iban },
                  { label: 'WhatsApp', value: siteSettings.whatsapp_number },
                  { label: 'Active payment methods', value: (siteSettings.payment_methods || '').split(',').filter(Boolean).join(' · ') || '—' },
                ].map((d) => (
                  <div key={d.label} className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                    <p className="text-sm font-semibold text-[#202124]">{d.value || '—'}</p>
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