'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = async (userId) => {
    const { data: roleData } = await supabase
      .rpc('get_user_role', { user_id: userId });
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();
    return {
      role: roleData || 'student',
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
    };
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoaded(true);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const initials = profile?.first_name || profile?.last_name
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  const dashboardLink = profile?.role === 'super_admin'
    ? '/admin'
    : profile?.role === 'assessor'
    ? '/assessor'
    : '/dashboard';

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">

      {/* Navbar */}
      <nav className="bg-[#0C0E13] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <a href="#features" className="hidden md:block text-sm text-[#9aa0a6] hover:text-white transition">Features</a>
          <a href="#courses" className="hidden md:block text-sm text-[#9aa0a6] hover:text-white transition">Courses</a>
          <a href="#about" className="hidden md:block text-sm text-[#9aa0a6] hover:text-white transition">About</a>

          {!loaded ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
          ) : user && profile ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardLink} className="hidden md:block text-xs text-[#9aa0a6] hover:text-white transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:block text-xs px-3 py-2 rounded-lg border border-white/10 text-[#9aa0a6] hover:text-white hover:border-white/30 transition"
              >
                Log out
              </button>
              <Link href={dashboardLink}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition">
                  {initials}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white transition">
                Log in
              </Link>
              <Link href="/login" className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white hover:opacity-90 transition">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero — full width with background image */}
      <section className="relative min-h-[620px] flex items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80')`,
          }}
        ></div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0C0E13]/70"></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
          <span className="inline-block text-xs bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full mb-5 font-medium backdrop-blur-sm">
            🎓 Trusted by 10,000+ learners worldwide
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
            Learn. Grow. <br />
            <span className="bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#34a853] bg-clip-text text-transparent">
              Achieve More.
            </span>
          </h2>
          <p className="text-sm md:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Access hundreds of professional courses, submit assignments, and earn recognised qualifications — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href={user ? dashboardLink : '/login'} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white font-medium hover:opacity-90 transition text-sm text-center">
              {user ? 'Go to dashboard →' : 'Start learning today →'}
            </Link>
            <a href="#courses" className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 bg-white/10 text-white font-medium hover:bg-white/20 transition text-sm text-center backdrop-blur-sm">
              Browse courses
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '500+', label: 'Courses available', color: 'text-[#4285f4]' },
              { value: '10k+', label: 'Active learners', color: 'text-[#34a853]' },
              { value: '50+', label: 'Qualifications', color: 'text-[#ea4335]' },
              { value: '98%', label: 'Satisfaction rate', color: 'text-[#fbbc04]' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16 scroll-mt-16">
        <h3 className="text-xl md:text-2xl font-bold text-[#202124] text-center mb-2">Everything you need to succeed</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Built for serious learners and professional development</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '📚', title: 'Rich Course Library', desc: 'Browse hundreds of professional courses across Health, Business, Technology and more.', color: 'bg-[#e8f0fe]' },
            { icon: '📝', title: 'Easy Assignments', desc: 'Download briefs, submit your work and track your grades all from one dashboard.', color: 'bg-[#e6f4ea]' },
            { icon: '🏆', title: 'Recognised Certificates', desc: 'Earn certificates and diplomas accredited by TQUK, OTHM, Qualifi and more.', color: 'bg-[#fce8e6]' },
            { icon: '📊', title: 'Track Your Progress', desc: 'Visual progress bars and completion stats keep you motivated and on track.', color: 'bg-[#fff8e1]' },
            { icon: '👨‍🏫', title: 'Expert Tutors', desc: 'Get support from dedicated tutors who are specialists in their fields.', color: 'bg-[#f3e5f5]' },
            { icon: '📱', title: 'Learn Anywhere', desc: 'Access your courses on any device — desktop, tablet or mobile.', color: 'bg-[#e8f5e9]' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#4285f4] transition">
              <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center text-xl mb-3`}>{f.icon}</div>
              <h4 className="text-sm font-semibold text-[#202124] mb-1">{f.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="max-w-5xl mx-auto px-6 py-16 scroll-mt-16">
        <h3 className="text-xl md:text-2xl font-bold text-[#202124] text-center mb-2">Popular courses</h3>
        <p className="text-sm text-gray-400 text-center mb-8">Join thousands of learners already enrolled</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { id: 6, emoji: '📋', title: 'Level 3 Diploma in Health and Social Care', category: 'Health & Social Care', learners: '2,400+', badge: 'bg-[#e6f4ea] text-[#137333]', banner: 'from-[#e8f0fe] to-[#d2e3fc]' },
            { id: 7, emoji: '💼', title: 'Level 5 Diploma in Business Management', category: 'Business', learners: '1,800+', badge: 'bg-[#e8f0fe] text-[#1a73e8]', banner: 'from-[#fce8e6] to-[#fad2cf]' },
            { id: 3, emoji: '🛡️', title: 'Qualifi Cyber Security Level 4', category: 'Technology', learners: '950+', badge: 'bg-[#fce8e6] text-[#c5221f]', banner: 'from-[#e6f4ea] to-[#ceead6]' },
            { id: 4, emoji: '🏆', title: 'Level 7 Diploma in Leadership and Management', category: 'Leadership', learners: '1,200+', badge: 'bg-[#fff8e1] text-[#f9a825]', banner: 'from-[#fff8e1] to-[#fff3cd]' },
            { id: 5, emoji: '📊', title: 'Level 4 Diploma in Project Management', category: 'Project Management', learners: '870+', badge: 'bg-[#f3e5f5] text-[#7b1fa2]', banner: 'from-[#f3e5f5] to-[#e1bee7]' },
            { id: 8, emoji: '💰', title: 'Level 5 Diploma in Accounting and Finance', category: 'Accounting', learners: '640+', badge: 'bg-[#e8f5e9] text-[#2e7d32]', banner: 'from-[#e8f5e9] to-[#c8e6c9]' },
          ].map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#4285f4] transition">
              <div className={`h-28 bg-gradient-to-br ${c.banner} flex items-center justify-center text-4xl`}>{c.emoji}</div>
              <div className="p-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.badge} mb-2 inline-block`}>{c.category}</span>
                <p className="text-sm font-semibold text-[#202124] mb-2 leading-snug">{c.title}</p>
                <p className="text-xs text-gray-400 mb-3">👥 {c.learners} learners enrolled</p>
                <Link href={`/enrol/${c.id}`} className="block w-full py-2 text-center rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                  Enrol now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-16 scroll-mt-16">
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <span className="inline-block text-xs bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full mb-4 font-medium">About LearnHub</span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#202124] mb-4 leading-snug">
                Empowering learners <br className="hidden md:block" /> since 2013
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                LearnHub is the UK's leading specialist provider of distance learning professional and vocational courses. We are a distinguished global distance and online learning platform dedicated to providing quality online courses worldwide.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Our courses are accredited by leading awarding bodies including TQUK, OTHM, Qualifi, NOCN and iCQ — ensuring your qualification is recognised by employers globally.
              </p>
              <Link href={user ? dashboardLink : '/login'} className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-sm font-medium hover:opacity-90 transition">
                {user ? 'Go to dashboard →' : 'Join LearnHub today →'}
              </Link>
            </div>
            <div className="bg-[#0C0E13] p-8 md:p-12 flex flex-col justify-center gap-6">
              {[
                { icon: '🎓', title: 'Accredited Qualifications', desc: 'All courses meet strict quality standards set by UK awarding bodies.' },
                { icon: '🌍', title: 'Global Reach', desc: 'Learners from over 50 countries have studied with LearnHub.' },
                { icon: '💬', title: 'Dedicated Support', desc: 'Our student support team is available Monday to Friday 10am–5pm.' },
              ].map((i) => (
                <div key={i.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{i.icon}</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{i.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{i.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-[#0C0E13] rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to start learning?</h3>
          <p className="text-gray-400 text-sm mb-6">Join thousands of learners advancing their careers with LearnHub.</p>
          <Link href={user ? dashboardLink : '/login'} className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white font-medium hover:opacity-90 transition text-sm">
            {user ? 'Go to dashboard →' : 'Create your free account →'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C0E13] border-t border-white/5 px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
              <span className="text-base font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              The UK's leading specialist provider of distance learning professional and vocational courses — worldwide.
            </p>
            <div className="text-xs text-gray-500 mb-1">📍 First Floor, Fairlawn High Street, Southall, London UB1 3HB</div>
            <div className="text-xs text-gray-500 mb-1">📞 +44 (0) 20 7101 9543</div>
            <div className="text-xs text-gray-500 mb-4">✉ info@learnhub.co.uk</div>
            <div className="flex gap-2">
              {['f', 'in', '▶', '📷'].map((s) => (
                <div key={s} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition">{s}</div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Popular Categories</h4>
            {['Health & Social Care', 'Business Management', 'Project Management', 'Accounting & Finance', 'Education & Training', 'Cyber Security', 'Leadership & Management'].map((c) => (
              <a key={c} href="#courses" className="block text-xs text-gray-500 mb-2 hover:text-white transition">{c}</a>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Platforms</h4>
            {['VLE — Student Portal', 'Moodle Learning', 'Mobile App', 'Corporate Training'].map((p) => (
              <p key={p} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{p}</p>
            ))}
            <h4 className="text-xs font-semibold text-white mt-5 mb-4 pb-2 border-b border-white/5">Quick Links</h4>
            {[
              { label: 'All Courses', href: '#courses' },
              { label: 'Features', href: '#features' },
              { label: 'About Us', href: '#about' },
              { label: user ? 'Dashboard' : 'Log in', href: user ? dashboardLink : '/login' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="block text-xs text-gray-500 mb-2 hover:text-white transition">{l.label}</a>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Award Bodies</h4>
            <div className="flex flex-wrap gap-2 mb-5">
              {['TQUK', 'OTHM', 'Qualifi', 'NOCN', 'iCQ', 'Step Ahead CPD'].map((a) => (
                <span key={a} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10">{a}</span>
              ))}
            </div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Legal</h4>
            {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy'].map((l) => (
              <p key={l} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{l}</p>
            ))}
          </div>
        </div>
        <div className="max-w-5xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
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