'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AssessorCourseEditor({ params }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [uploadingInstructions, setUploadingInstructions] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', content_text: '', type: 'text' });
  const [materialFile, setMaterialFile] = useState(null);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({});
  const [error, setError] = useState('');
  const router = useRouter();

  // ─── AUTH CHECK ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!data || !['assessor', 'super_admin'].includes(data.role)) { router.push('/dashboard'); return; }
      setProfile(data);
      const courseId = (await params).id;
      await fetchCourse(courseId, data);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ─── DATA FETCHERS ────────────────────────────────────────────────────────────
  const fetchCourse = async (courseId, profileData) => {
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (!courseData) { router.push('/assessor'); return; }
    const isAssigned = courseData.assessor_id === profileData.id;
    const { data: perms } = await supabase.from('assessor_permissions').select('permission').eq('assessor_id', profileData.id);
    const permList = perms?.map(p => p.permission) || [];
    const canEdit = isAssigned || permList.includes('edit_courses') || profileData.role === 'super_admin';
    if (!canEdit) { router.push('/assessor'); return; }
    setCourse(courseData);
    setCourseForm({
      title: courseData.title || '', category: courseData.category || '',
      level: courseData.level || '', awarding_body: courseData.awarding_body || '',
      price: courseData.price || '', duration: courseData.duration || '',
      study_method: courseData.study_method || '', overview: courseData.overview || '',
    });
    await fetchModules(courseId);
  };

  const fetchModules = async (courseId) => {
    const { data } = await supabase.from('course_modules').select('*').eq('course_id', courseId).order('order_number', { ascending: true });
    if (data) {
      setModules(data);
      if (data.length > 0) { setActiveModule(data[0]); await fetchModuleContent(data[0].id); }
    }
  };

  const fetchModuleContent = async (moduleId) => {
    const { data: matData } = await supabase.from('course_materials').select('*').eq('module_id', moduleId).order('order_number', { ascending: true });
    if (matData) setMaterials(matData);
    const { data: assignData } = await supabase.from('assignments').select('*').eq('module_id', moduleId);
    if (assignData) setAssignments(assignData);
  };

  const selectModule = async (mod) => {
    setActiveModule(mod);
    setShowAddMaterial(false);
    setNewMaterial({ title: '', content_text: '', type: 'text' });
    setMaterialFile(null);
    await fetchModuleContent(mod.id);
  };

  // ─── COURSE ACTIONS ───────────────────────────────────────────────────────────
  const saveCourse = async () => {
    setSaving(true);
    await supabase.from('courses').update({
      title: courseForm.title, category: courseForm.category,
      level: courseForm.level, awarding_body: courseForm.awarding_body,
      price: parseFloat(courseForm.price) || 0, duration: courseForm.duration,
      study_method: courseForm.study_method, overview: courseForm.overview,
    }).eq('id', course.id);
    await fetchCourse(course.id, profile);
    setSaving(false); setEditingCourse(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ─── MODULE ACTIONS ───────────────────────────────────────────────────────────
  const addModule = async () => {
    if (!newModule.title.trim()) return;
    await supabase.from('course_modules').insert({
      course_id: course.id, title: newModule.title,
      description: newModule.description, order_number: modules.length + 1,
      is_locked: modules.length > 0,
    });
    setNewModule({ title: '', description: '' }); setShowAddModule(false);
    await fetchModules(course.id);
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this unit and all its materials?')) return;
    await supabase.from('course_modules').delete().eq('id', moduleId);
    if (activeModule?.id === moduleId) setActiveModule(null);
    await fetchModules(course.id);
  };

  const toggleModuleLock = async (mod) => {
    await supabase.from('course_modules').update({
      is_locked: !mod.is_locked,
      unlocked_at: !mod.is_locked ? null : new Date().toISOString(),
    }).eq('id', mod.id);
    await fetchModules(course.id);
    if (activeModule?.id === mod.id) setActiveModule(prev => ({ ...prev, is_locked: !prev.is_locked }));
  };

  // ─── MATERIAL ACTIONS ─────────────────────────────────────────────────────────
  const addMaterial = async () => {
    if (!newMaterial.title.trim()) { setError('Title is required.'); return; }
    setUploadingMaterial(true); setError('');
    let fileUrl = null;
    let fileType = newMaterial.type;
    if (newMaterial.type === 'pdf' && materialFile) {
      const ext = materialFile.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf') { setError('Notes must be PDF only.'); setUploadingMaterial(false); return; }
      const fileName = `material_${course.id}_${activeModule.id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('course-materials').upload(fileName, materialFile, { cacheControl: '3600', upsert: false });
      if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploadingMaterial(false); return; }
      const { data: urlData } = supabase.storage.from('course-materials').getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }
    await supabase.from('course_materials').insert({
      module_id: activeModule.id, course_id: course.id,
      title: newMaterial.title, content_text: newMaterial.type === 'text' ? newMaterial.content_text : null,
      file_url: fileUrl, file_type: fileType,
      order_number: materials.length + 1, uploaded_by: profile.id,
    });
    setNewMaterial({ title: '', content_text: '', type: 'text' }); setMaterialFile(null);
    setShowAddMaterial(false); setUploadingMaterial(false);
    await fetchModuleContent(activeModule.id);
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Delete this note?')) return;
    await supabase.from('course_materials').delete().eq('id', id);
    await fetchModuleContent(activeModule.id);
  };

  // ─── ASSIGNMENT ACTIONS ───────────────────────────────────────────────────────
  const saveAssignment = async (assignmentId, field, value) => {
    await supabase.from('assignments').update({ [field]: value }).eq('id', assignmentId);
    await fetchModuleContent(activeModule.id);
  };

  const uploadInstructions = async (assignmentId, file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) { setError('Instructions must be PDF, DOC or DOCX only.'); return; }
    setUploadingInstructions(true);
    const fileName = `instructions_${assignmentId}_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('assignment-instructions').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploadingInstructions(false); return; }
    const { data: urlData } = supabase.storage.from('assignment-instructions').getPublicUrl(fileName);
    await supabase.from('assignments').update({ instructions_url: urlData.publicUrl, instructions_filename: file.name }).eq('id', assignmentId);
    setUploadingInstructions(false);
    await fetchModuleContent(activeModule.id);
  };

  const addAssignment = async () => {
    await supabase.from('assignments').insert({
      course_id: course.id, module_id: activeModule.id,
      title: `Unit ${activeModule.order_number} Assessment`,
      order_number: assignments.length + 1, is_locked: false,
    });
    await fetchModuleContent(activeModule.id);
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Delete this assessment?')) return;
    await supabase.from('assignments').delete().eq('id', id);
    await fetchModuleContent(activeModule.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] transition';

  return (
    <div className="flex min-h-screen font-sans bg-[#f0f2f5]">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-56 bg-[#0C0E13] flex-col gap-1 p-4 fixed top-0 left-0 h-full z-40 overflow-y-auto">
        <Link href="/assessor" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <p className="text-[10px] text-gray-400 mb-0.5">Editing course</p>
          <p className="text-xs text-white font-medium truncate">{course?.title}</p>
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-3 mb-2">Units</p>
        {modules.map((mod) => (
          <button key={mod.id} onClick={() => selectModule(mod)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left w-full ${activeModule?.id === mod.id ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <span className="text-[10px] w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold">{mod.order_number}</span>
            <span className="truncate flex-1">{mod.title}</span>
            {mod.is_locked && <span className="text-[10px] shrink-0">🔒</span>}
          </button>
        ))}
        <button onClick={() => setShowAddModule(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 text-sm transition text-left w-full mt-1">➕ Add unit</button>
        <div className="mt-auto pt-4">
          <Link href="/assessor" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition w-full">← Back</Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-56 p-4 md:p-8">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Link href="/assessor" className="hover:text-[#4285f4]">Assessor</Link>
              <span>›</span>
              <span className="text-[#202124]">Course Editor</span>
            </div>
            <h1 className="text-xl font-semibold text-[#202124]">{course?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-[#34a853]">✓ Saved</span>}
            {error && <span className="text-xs text-[#ea4335]">{error}</span>}
          </div>
        </div>

        {/* ── Course details ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#202124]">📋 Course details</h2>
            <button onClick={() => setEditingCourse(!editingCourse)} className="text-xs px-3 py-1.5 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#e8f0fe] transition">{editingCourse ? 'Cancel' : '✏️ Edit'}</button>
          </div>
          {editingCourse ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Course title', key: 'title', full: true },
                { label: 'Category', key: 'category' },
                { label: 'Level', key: 'level' },
                { label: 'Awarding body', key: 'awarding_body' },
                { label: 'Price (£)', key: 'price' },
                { label: 'Duration', key: 'duration' },
                { label: 'Study method', key: 'study_method' },
              ].map((f) => (
                <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">{f.label}</label>
                  <input type="text" value={courseForm[f.key] || ''} onChange={(e) => setCourseForm({ ...courseForm, [f.key]: e.target.value })} className={inputCls} />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Overview</label>
                <textarea rows={3} value={courseForm.overview || ''} onChange={(e) => setCourseForm({ ...courseForm, overview: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button onClick={saveCourse} disabled={saving} className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button>
                <button onClick={() => setEditingCourse(false)} className="px-5 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Category', value: course?.category },
                { label: 'Level', value: course?.level },
                { label: 'Awarding body', value: course?.awarding_body },
                { label: 'Price', value: `£${course?.price}` },
                { label: 'Duration', value: course?.duration },
                { label: 'Study method', value: course?.study_method },
              ].map((d) => (
                <div key={d.label}>
                  <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                  <p className="text-xs font-medium text-[#202124]">{d.value || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Add module modal ── */}
        {showAddModule && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6">
              <h3 className="text-sm font-semibold text-[#202124] mb-4">Add new unit</h3>
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Unit title <span className="text-[#ea4335]">*</span></label>
                <input type="text" placeholder="e.g. Introduction to Cyber Security" value={newModule.title} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} className={inputCls} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Description (optional)</label>
                <textarea rows={2} placeholder="Brief description..." value={newModule.description} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddModule(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 transition">Cancel</button>
                <button onClick={addModule} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition">Add unit</button>
              </div>
            </div>
          </div>
        )}

        {/* ── No units state ── */}
        {!activeModule && modules.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <h4 className="text-sm font-semibold text-[#202124] mb-1">No units yet</h4>
            <p className="text-xs text-gray-400 mb-4">Add your first unit to start building this course.</p>
            <button onClick={() => setShowAddModule(true)} className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">➕ Add first unit</button>
          </div>
        )}

        {/* ── Unit content ── */}
        {activeModule && (
          <div className="flex flex-col gap-6">

            {/* ── Unit header ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] flex items-center justify-center text-[#4285f4] font-bold text-sm">{activeModule.order_number}</div>
                  <div>
                    <h2 className="text-base font-semibold text-[#202124]">{activeModule.title}</h2>
                    {activeModule.description && <p className="text-xs text-gray-400 mt-0.5">{activeModule.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleModuleLock(activeModule)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${activeModule.is_locked ? 'border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6]' : 'border-[#34a853] text-[#137333] hover:bg-[#e6f4ea]'}`}>
                    {activeModule.is_locked ? '🔒 Locked — click to unlock' : '🔓 Unlocked — click to lock'}
                  </button>
                  <button onClick={() => deleteModule(activeModule.id)} className="px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] text-xs hover:bg-[#fce8e6] transition">Delete unit</button>
                </div>
              </div>
            </div>

            {/* ── Unit notes ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#202124]">📖 Unit notes</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Students can read only — no download.</p>
                </div>
                <button onClick={() => setShowAddMaterial(!showAddMaterial)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">➕ Add note</button>
              </div>
              {showAddMaterial && (
                <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4 border border-[#4285f4]/20">
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Note title <span className="text-[#ea4335]">*</span></label>
                    <input type="text" placeholder="e.g. Introduction to Networks" value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} className={inputCls} />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Note type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ value: 'text', label: '✏️ Write text', desc: 'Type notes directly' }, { value: 'pdf', label: '📄 Upload PDF', desc: 'PDF viewed inline only' }].map((t) => (
                        <button key={t.value} onClick={() => setNewMaterial({ ...newMaterial, type: t.value })} className={`p-3 rounded-xl border-2 text-left transition ${newMaterial.type === t.value ? 'border-[#4285f4] bg-[#e8f0fe]' : 'border-gray-200 hover:border-gray-300'}`}>
                          <p className="text-xs font-medium text-[#202124]">{t.label}</p>
                          <p className="text-[11px] text-gray-400">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {newMaterial.type === 'text' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-[#202124] mb-1.5">Content</label>
                      <textarea rows={6} placeholder="Write your notes here..." value={newMaterial.content_text} onChange={(e) => setNewMaterial({ ...newMaterial, content_text: e.target.value })} className={`${inputCls} resize-none`} />
                    </div>
                  )}
                  {newMaterial.type === 'pdf' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-[#202124] mb-1.5">Upload PDF <span className="text-[#ea4335]">*</span></label>
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${materialFile ? 'border-[#34a853] bg-[#e6f4ea]' : 'border-gray-200 bg-white'}`}>
                        {materialFile ? (
                          <div>
                            <p className="text-xs font-medium text-[#137333]">✅ {materialFile.name}</p>
                            <button onClick={() => setMaterialFile(null)} className="text-[10px] text-[#ea4335] hover:underline mt-1">Remove</button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">PDF only — students view inline, cannot download</p>
                            <label className="px-3 py-1.5 rounded-lg bg-[#4285f4] text-white text-xs cursor-pointer hover:opacity-90 transition">
                              Choose PDF
                              <input type="file" accept=".pdf" onChange={(e) => setMaterialFile(e.target.files[0])} className="hidden" />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {error && <p className="text-xs text-[#c5221f] mb-3">⚠️ {error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setShowAddMaterial(false); setNewMaterial({ title: '', content_text: '', type: 'text' }); setMaterialFile(null); }} className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 transition">Cancel</button>
                    <button onClick={addMaterial} disabled={uploadingMaterial} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition disabled:opacity-60">{uploadingMaterial ? 'Uploading...' : 'Save note'}</button>
                  </div>
                </div>
              )}
              {materials.length === 0 && !showAddMaterial && <p className="text-xs text-gray-400 text-center py-6">No notes uploaded for this unit yet.</p>}
              <div className="flex flex-col gap-3">
                {materials.map((m) => (
                  <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9fa]">
                      <div className="flex items-center gap-2">
                        <span>{m.file_type === 'pdf' ? '📄' : '📝'}</span>
                        <p className="text-xs font-medium text-[#202124]">{m.title}</p>
                        <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">View only</span>
                      </div>
                      <button onClick={() => deleteMaterial(m.id)} className="text-[10px] text-[#ea4335] hover:underline shrink-0">Delete</button>
                    </div>
                    {m.file_type === 'pdf' && m.file_url && (
                      <div className="h-64 bg-gray-100">
                        <iframe src={`${m.file_url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-0" title={m.title} />
                      </div>
                    )}
                    {m.file_type === 'text' && m.content_text && (
                      <div className="px-4 py-3"><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{m.content_text}</p></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Unit assessment ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#202124]">📋 Unit assessment</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Students download instructions as PDF/DOC. Set deadline and submission guide.</p>
                </div>
                {assignments.length === 0 && (
                  <button onClick={addAssignment} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">➕ Add assessment</button>
                )}
              </div>
              {assignments.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No assessment for this unit yet.</p>}
              {assignments.map((a) => (
                <div key={a.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">Assessment title</label>
                    <input type="text" defaultValue={a.title} onBlur={(e) => saveAssignment(a.id, 'title', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">📅 Submission deadline</label>
                    <input type="datetime-local" defaultValue={a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : ''} onBlur={(e) => saveAssignment(a.id, 'deadline', e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputCls} />
                    {a.deadline && <p className="text-[11px] text-gray-400 mt-1">Deadline: {new Date(a.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">📝 Submission guide</label>
                    <textarea rows={4} defaultValue={a.submission_guide || ''} onBlur={(e) => saveAssignment(a.id, 'submission_guide', e.target.value)} placeholder="e.g. Write a 1000 word report on..." className={`${inputCls} resize-none`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1.5">📎 Assessment instructions (PDF/DOC — students download)</label>
                    {a.instructions_url ? (
                      <div className="flex items-center gap-3 p-3 bg-[#e6f4ea] rounded-xl">
                        <span className="text-lg">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#137333] truncate">{a.instructions_filename || 'Instructions file'}</p>
                          <p className="text-[10px] text-[#137333]">Students can download this</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={a.instructions_url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2.5 py-1 rounded-lg border border-[#34a853] text-[#137333] hover:bg-white transition">Preview</a>
                          <label className="text-[10px] px-2.5 py-1 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#e8f0fe] transition cursor-pointer">
                            Replace
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => uploadInstructions(a.id, e.target.files[0])} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center ${uploadingInstructions ? 'border-[#4285f4] bg-[#e8f0fe]' : 'border-gray-200 bg-[#f8f9fa]'}`}>
                        {uploadingInstructions ? (
                          <div>
                            <div className="w-6 h-6 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-gray-400">Uploading...</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">PDF, DOC or DOCX only</p>
                            <label className="px-3 py-1.5 rounded-lg bg-[#4285f4] text-white text-xs cursor-pointer hover:opacity-90 transition">
                              Upload instructions
                              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => uploadInstructions(a.id, e.target.files[0])} className="hidden" />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {error && <p className="text-xs text-[#c5221f]">⚠️ {error}</p>}
                  <div className="flex justify-end">
                    <button onClick={() => deleteAssignment(a.id)} className="text-xs px-3 py-1.5 rounded-lg border border-[#ea4335] text-[#ea4335] hover:bg-[#fce8e6] transition">Delete assessment</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}