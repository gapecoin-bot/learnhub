'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const btnPrimary = 'px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition';
const btnGreen = 'inline-block px-5 py-2 rounded-lg bg-[#25d366] text-white text-xs font-medium hover:opacity-90 transition';
const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] text-sm text-[#202124] placeholder-gray-400 outline-none focus:border-[#4285f4] transition';

export default function EnrolPage({ params }) {
  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [proofName, setProofName] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    bank_name: 'Learnify Academy LWM Ltd',
    bank_account: '—',
    bank_sort_code: '—',
    bank_iban: '—',
    whatsapp_number: '+447700900000',
    payment_methods: 'bank_transfer,card',
    custom_payment_methods: '[]',
  });
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    dob: '',
    address: '',
    payment_method: 'bank_transfer',
  });

  useEffect(() => {
    const init = async () => {
      const id = parseInt((await params).id);

      // ── Fetch course ──
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      if (courseErr || !courseData) { setCourse(null); setLoading(false); return; }
      setCourse(courseData);

      // ── Fetch settings ──
      const { data: settingsData } = await supabase.from('site_settings').select('key, value');
      if (settingsData) {
        const map = {};
        settingsData.forEach(s => { map[s.key] = s.value; });
        setSettings(prev => ({ ...prev, ...map }));

        // ── Default to first enabled payment method ──
        const methods = (map.payment_methods || 'bank_transfer,card').split(',').filter(Boolean);
        if (methods.length > 0) {
          setForm(prev => ({ ...prev, payment_method: methods[0] }));
        }
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'].includes(ext)) {
      setError('File type not supported. Please upload JPG, PNG, PDF or DOC.');
      setUploading(false);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      setUploading(false);
      return;
    }
    const name = `proof_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('payment-proofs').upload(name, file, { cacheControl: '3600', upsert: false });
    if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(name);
    setProofUrl(urlData.publicUrl);
    setProofName(file.name);
    setUploading(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!proofUrl) { setError('Please upload your payment proof before submitting.'); return; }
    setSubmitting(true);

    // ── Duplicate check ──
    const { data: existing } = await supabase
      .from('enrolment_requests')
      .select('id, status')
      .eq('email', form.email.trim().toLowerCase())
      .eq('course_id', course.id)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      setError(existing.status === 'approved'
        ? 'You are already enrolled in this course. Please log in to access your course.'
        : 'You already have a pending application. Our team will review it within 24-48 hours.');
      setSubmitting(false);
      return;
    }

    const { error: err } = await supabase.from('enrolment_requests').insert({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || form.phone.trim(),
      dob: form.dob,
      address: form.address.trim(),
      course_id: course.id,
      payment_method: form.payment_method,
      payment_proof_url: proofUrl,
      status: 'pending',
    });
    setSubmitting(false);
    if (err) { setError('Something went wrong. Please contact us on WhatsApp.'); return; }
    setSubmitted(true);
  };

  const step1Valid = form.full_name && form.email && form.phone && form.dob && form.address;
  const WA = settings.whatsapp_number || '+447700900000';
  const enabledMethods = (settings.payment_methods || 'bank_transfer,card').split(',').filter(Boolean);

  // ── All payment methods (built-in + custom) ──
  const builtInMethods = [
    { value: 'bank_transfer', icon: '🏦', label: 'Bank Transfer', desc: 'Transfer directly to our bank account' },
    { value: 'card', icon: '💳', label: 'Card Payment', desc: 'Contact us to process card payment' },
    { value: 'paypal', icon: '🅿️', label: 'PayPal', desc: 'Pay via PayPal' },
    { value: 'online_banking', icon: '🌐', label: 'Online Banking', desc: 'Pay via your online banking app' },
    { value: 'cash', icon: '💵', label: 'Cash', desc: 'Pay in cash in person' },
  ];
  const customMethods = (() => {
    try { return JSON.parse(settings.custom_payment_methods || '[]'); }
    catch { return []; }
  })();
  const allMethods = [...builtInMethods, ...customMethods].filter(m => enabledMethods.includes(m.value));
  const selectedMethod = allMethods.find(m => m.value === form.payment_method);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-lg font-semibold text-[#202124] mb-2">Course not found</h2>
          <p className="text-sm text-gray-400 mb-4">This course may have been removed or the link is incorrect.</p>
          <Link href="/browse" className={btnPrimary}>Browse all courses</Link>
        </div>
      </div>
    );
  }return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-[#0C0E13] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs px-3 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white transition">Log in</Link>
          <a href={`https://wa.me/${WA.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-block text-xs px-3 py-2 rounded-lg bg-[#25d366] text-white hover:opacity-90 transition">💬 WhatsApp us</a>
        </div>
      </nav>

      {/* ── Course hero ── */}
      <div className="bg-[#0C0E13] px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-[#4285f4]">Home</Link>
            <span>›</span>
            <Link href="/browse" className="hover:text-[#4285f4]">Courses</Link>
            <span>›</span>
            <span className="text-gray-300 truncate">{course.title}</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.banner_from || 'from-[#e8f0fe]'} ${course.banner_to || 'to-[#d2e3fc]'} flex items-center justify-center text-3xl shrink-0`}>
              {course.emoji || '📚'}
            </div>
            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.badge_bg || 'bg-[#e8f0fe]'} ${course.badge_text || 'text-[#1a73e8]'} mb-1 inline-block`}>{course.category}</span>
              <h1 className="text-lg md:text-2xl font-bold text-white leading-snug">{course.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {course.duration && <span className="text-xs text-gray-400">⏱ {course.duration}</span>}
            {course.awarding_body && <span className="text-xs text-gray-400">📜 {course.awarding_body}</span>}
            {course.learners_count > 0 && <span className="text-xs text-gray-400">👥 {course.learners_count} enrolled</span>}
            <span className="flex items-center gap-2">
              {course.original_price && <span className="text-xs text-gray-500 line-through">£{course.original_price}</span>}
              <span className="text-xs text-[#34a853] font-medium">💰 £{course.price}</span>
            </span>
            {course.payment_model === 'installment' && course.installment_note && (
              <span className="text-xs bg-[#e8f0fe] text-[#4285f4] px-2 py-0.5 rounded-full">📅 {course.installment_note}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Step indicator ── */}
      {!submitted && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center">
            {[{ num: 1, label: 'Your details' }, { num: 2, label: 'Payment' }, { num: 3, label: 'Confirmation' }].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step >= s.num ? 'bg-gradient-to-br from-[#4285f4] to-[#34a853] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-[#202124]' : 'text-gray-400'}`}>{s.label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-[#4285f4]' : 'bg-gray-100'}`}></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── Submitted ── */}
        {submitted && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🎉</div>
            <h2 className="text-xl font-bold text-[#202124] mb-2">Application submitted!</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Thank you <strong>{form.full_name}</strong>! Your enrolment for <strong>{course.title}</strong> has been received. We will review your payment and contact you within 24–48 hours.
            </p>
            <div className="bg-[#f8f9fa] rounded-xl p-5 mb-6 text-left">
              <h4 className="text-sm font-semibold text-[#202124] mb-3">What happens next?</h4>
              {[
                { icon: '🔍', text: 'Our admin team reviews your payment proof' },
                { icon: '✅', text: 'Your enrolment is approved and your account is created' },
                { icon: '📧', text: 'Your School ID, username and password are sent to your email' },
                { icon: '🚀', text: 'Log in with your username and start your course!' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                  <span className="text-lg shrink-0">{s.icon}</span>
                  <p className="text-xs text-gray-500">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#e8f5e9] rounded-xl p-4 mb-6">
              <p className="text-xs text-[#137333] font-medium mb-1">Need help or want to follow up?</p>
              <p className="text-xs text-[#137333] mb-3">Contact us on WhatsApp — we respond within minutes.</p>
              <a href={`https://wa.me/${WA.replace('+', '')}?text=Hi, I submitted my enrolment for ${course.title}. My name is ${form.full_name}.`} target="_blank" rel="noopener noreferrer" className={btnGreen}>💬 Message us on WhatsApp</a>
            </div>
            <Link href="/" className="text-xs text-[#4285f4] hover:underline">Back to home</Link>
          </div>
        )}{/* ── Step 1 — Your details ── */}
        {!submitted && step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#202124] mb-1">Your details</h2>
            <p className="text-xs text-gray-400 mb-6">Fill in your personal information to proceed with enrolment.</p>

            {error && (
              <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-5 flex items-center gap-2">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Full name <span className="text-[#ea4335]">*</span></label>
                <input type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="e.g. John Smith" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Email address <span className="text-[#ea4335]">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">Your login credentials will be sent here.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Phone number <span className="text-[#ea4335]">*</span></label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+44 7700 900000" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">WhatsApp number</label>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="If different from phone" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Date of birth <span className="text-[#ea4335]">*</span></label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Home address <span className="text-[#ea4335]">*</span></label>
                <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Postcode, Country" className={inputCls} />
              </div>
            </div>

            {/* Course summary */}
            <div className="bg-[#f8f9fa] rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">{course.emoji || '📚'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#202124] truncate">{course.title}</p>
                <p className="text-[10px] text-gray-400">{course.level} · {course.awarding_body}</p>
                {course.payment_model === 'installment' && course.installment_note && (
                  <p className="text-[10px] text-[#4285f4] mt-0.5">📅 {course.installment_note}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                {course.original_price && <p className="text-[10px] text-gray-400 line-through">£{course.original_price}</p>}
                <p className="text-sm font-bold text-[#202124]">£{course.price}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href="/browse" className="text-xs text-gray-400 hover:text-[#4285f4] transition">Back to courses</Link>
              <button
                onClick={() => {
                  setError('');
                  if (!step1Valid) { setError('Please fill in all required fields.'); return; }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address.'); return; }
                  setStep(2);
                }}
                className={btnPrimary}
              >
                Next: Payment
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 — Payment ── */}
        {!submitted && step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-[#202124] mb-1">Payment</h2>
              <p className="text-xs text-gray-400 mb-6">Choose your payment method and upload proof of payment.</p>

              {error && (
                <div className="bg-[#fce8e6] text-[#c5221f] text-xs px-4 py-3 rounded-lg mb-5 flex items-center gap-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              {/* ── Payment method picker ── */}
              {allMethods.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {allMethods.map((m) => (
                    <button key={m.value} onClick={() => setForm({ ...form, payment_method: m.value })} className={`p-4 rounded-xl border-2 text-left transition ${form.payment_method === m.value ? 'border-[#4285f4] bg-[#e8f0fe]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <span className="text-2xl mb-2 block">{m.icon}</span>
                      <p className="text-sm font-medium text-[#202124]">{m.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Bank Transfer ── */}
              {form.payment_method === 'bank_transfer' && (
                <div className="bg-[#f8f9fa] rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-[#202124] mb-3">🏦 Bank transfer details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Account name', value: settings.bank_name },
                      { label: 'Account number', value: settings.bank_account },
                      { label: 'Sort code', value: settings.bank_sort_code },
                      { label: 'IBAN', value: settings.bank_iban },
                      { label: 'Amount', value: `£${course.price}` },
                      { label: 'Reference', value: form.full_name || 'Your full name' },
                    ].map((d) => (
                      <div key={d.label} className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                        <p className="text-sm font-semibold text-[#202124]">{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">⚠️ Use your full name as the payment reference so we can identify your transfer.</p>
                  {course.payment_model === 'installment' && course.installment_note && (
                    <div className="mt-3 bg-[#e8f0fe] rounded-lg p-3">
                      <p className="text-[11px] text-[#1a73e8]">📅 Payment plan: <strong>{course.installment_note}</strong>. Transfer £{course.installment_amount || course.price} now for your first payment.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Online Banking ── */}
              {form.payment_method === 'online_banking' && (
                <div className="bg-[#f8f9fa] rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-[#202124] mb-3">🌐 Online banking details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Account name', value: settings.bank_name },
                      { label: 'Account number', value: settings.bank_account },
                      { label: 'Sort code', value: settings.bank_sort_code },
                      { label: 'IBAN', value: settings.bank_iban },
                      { label: 'Amount', value: `£${course.price}` },
                      { label: 'Reference', value: form.full_name || 'Your full name' },
                    ].map((d) => (
                      <div key={d.label} className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-0.5">{d.label}</p>
                        <p className="text-sm font-semibold text-[#202124]">{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">⚠️ Use your full name as the payment reference.</p>
                </div>
              )}

              {/* ── Card ── */}
              {form.payment_method === 'card' && (
                <div className="bg-[#e8f5e9] rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-[#202124] mb-2">💳 Card payment</h4>
                  <p className="text-xs text-gray-500 mb-3">Contact us on WhatsApp and we will process your card payment securely.</p>
                  <a href={`https://wa.me/${WA.replace('+', '')}?text=Hi, I would like to pay by card for ${course.title}.`} target="_blank" rel="noopener noreferrer" className={btnGreen}>💬 Contact us on WhatsApp</a>
                </div>
              )}

              {/* ── PayPal ── */}
              {form.payment_method === 'paypal' && (
                <div className="bg-[#e8f0fe] rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-[#202124] mb-2">🅿️ PayPal</h4>
                  <p className="text-xs text-gray-500 mb-3">Contact us on WhatsApp and we will send you a PayPal payment link.</p>
                  <a href={`https://wa.me/${WA.replace('+', '')}?text=Hi, I would like to pay via PayPal for ${course.title}.`} target="_blank" rel="noopener noreferrer" className={btnGreen}>💬 Get PayPal link</a>
                </div>
              )}

              {/* ── Cash ── */}
              {form.payment_method === 'cash' && (
                <div className="bg-[#e8f5e9] rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-[#202124] mb-2">💵 Cash payment</h4>
                  <p className="text-xs text-gray-500 mb-3">Contact us on WhatsApp to arrange a cash payment in person.</p>
                  <a href={`https://wa.me/${WA.replace('+', '')}?text=Hi, I would like to pay in cash for ${course.title}.`} target="_blank" rel="noopener noreferrer" className={btnGreen}>💬 Arrange cash payment</a>
                </div>
              )}

              {/* ── Custom methods ── */}
              {customMethods.filter(m => m.value === form.payment_method).map(m => (
                <div key={m.value} className="bg-[#e8f0fe] rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-[#202124] mb-2">{m.icon} {m.label}</h4>
                  <p className="text-xs text-gray-500 mb-3">{m.desc}</p>
                  <a href={`https://wa.me/${WA.replace('+', '')}?text=Hi, I would like to pay via ${m.label} for ${course.title}.`} target="_blank" rel="noopener noreferrer" className={btnGreen}>💬 Contact us on WhatsApp</a>
                </div>
              ))}

              {/* ── Upload proof ── */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-[#202124] mb-1.5">Upload payment proof <span className="text-[#ea4335]">*</span></label>
                <p className="text-[11px] text-gray-400 mb-3">Upload a screenshot or photo of your payment confirmation or receipt.</p>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${proofUrl ? 'border-[#34a853] bg-[#e6f4ea]' : 'border-gray-200 bg-[#f8f9fa]'}`}>
                  {proofUrl ? (
                    <div>
                      <div className="text-3xl mb-2">✅</div>
                      <p className="text-xs font-medium text-[#137333]">{proofName}</p>
                      <p className="text-[10px] text-[#137333] mt-0.5">Uploaded successfully</p>
                      <button onClick={() => { setProofUrl(''); setProofName(''); }} className="mt-2 text-[10px] text-[#ea4335] hover:underline">Remove and re-upload</button>
                    </div>
                  ) : uploading ? (
                    <div>
                      <div className="w-8 h-8 border-2 border-[#4285f4] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs text-gray-400">Uploading...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📤</div>
                      <p className="text-xs text-gray-500 mb-1">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-gray-400 mb-3">JPG, PNG, PDF, DOC up to 10MB</p>
                      <label className="px-4 py-2 rounded-lg bg-[#4285f4] text-white text-xs font-medium cursor-pointer hover:opacity-90 transition">
                        Choose file
                        <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Order summary ── */}
              <div className="bg-[#f8f9fa] rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-[#202124] mb-3">Order summary</h4>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500 truncate mr-2">{course.title}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {course.original_price && <span className="text-xs text-gray-400 line-through">£{course.original_price}</span>}
                    <span className="text-xs font-medium text-[#202124]">£{course.price}</span>
                  </span>
                </div>
                {course.payment_model === 'installment' && course.installment_note && (
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Payment plan</span>
                    <span className="text-xs font-medium text-[#4285f4]">{course.installment_note}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500">Student</span>
                  <span className="text-xs font-medium text-[#202124]">{form.full_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500">Email</span>
                  <span className="text-xs font-medium text-[#202124] truncate ml-2">{form.email}</span>
                </div>
                {selectedMethod && (
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Payment method</span>
                    <span className="text-xs font-medium text-[#202124]">{selectedMethod.icon} {selectedMethod.label}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-[#202124]">
                    {course.payment_model === 'installment' ? 'First payment' : 'Total'}
                  </span>
                  <span className="text-sm font-bold text-[#34a853]">
                    £{course.payment_model === 'installment' ? (course.installment_amount || course.price) : course.price}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => { setStep(1); setError(''); }} className="text-xs text-gray-400 hover:text-[#4285f4] transition">Back to details</button>
                <button onClick={handleSubmit} disabled={submitting || !proofUrl} className={`${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed`}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </span>
                  ) : 'Submit application'}
                </button>
              </div>
            </div>

            {/* ── WhatsApp help ── */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#e8f5e9] rounded-xl flex items-center justify-center text-xl shrink-0">💬</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#202124]">Need help enrolling?</p>
                <p className="text-xs text-gray-400">Our team is available on WhatsApp to assist you.</p>
              </div>
              <a href={`https://wa.me/${WA.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#25d366] text-white text-xs font-medium hover:opacity-90 transition shrink-0">{WA}</a>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <footer className="bg-[#0C0E13] border-t border-white/5 px-6 py-8 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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