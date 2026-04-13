'use client';
import { useState } from 'react';
import Link from 'next/link';

const allCourses = [
  { id: 1, title: 'Level 3 Diploma in Health and Social Care', category: 'Health & Social Care', level: 'Level 3', awarding: 'TQUK', price: '£10', originalPrice: '£349', learners: '2,400+', emoji: '📋', banner: 'from-[#e8f0fe] to-[#d2e3fc]', badge: 'bg-[#e6f4ea] text-[#137333]' },
  { id: 2, title: 'Level 5 Diploma in Business Management', category: 'Business', level: 'Level 5', awarding: 'Qualifi', price: '£10', originalPrice: '£399', learners: '1,800+', emoji: '💼', banner: 'from-[#fce8e6] to-[#fad2cf]', badge: 'bg-[#e8f0fe] text-[#1a73e8]' },
  { id: 3, title: 'Qualifi Cyber Security Level 4', category: 'Technology', level: 'Level 4', awarding: 'Qualifi', price: '£10', originalPrice: '£449', learners: '950+', emoji: '🛡️', banner: 'from-[#e6f4ea] to-[#ceead6]', badge: 'bg-[#fce8e6] text-[#c5221f]' },
  { id: 4, title: 'Level 7 Diploma in Leadership and Management', category: 'Leadership', level: 'Level 7', awarding: 'OTHM', price: '£10', originalPrice: '£499', learners: '1,200+', emoji: '🏆', banner: 'from-[#fff8e1] to-[#fff3cd]', badge: 'bg-[#fff8e1] text-[#f9a825]' },
  { id: 5, title: 'Level 4 Diploma in Project Management', category: 'Project Management', level: 'Level 4', awarding: 'TQUK', price: '£10', originalPrice: '£379', learners: '870+', emoji: '📊', banner: 'from-[#f3e5f5] to-[#e1bee7]', badge: 'bg-[#f3e5f5] text-[#7b1fa2]' },
  { id: 6, title: 'Level 5 Diploma in Accounting and Finance', category: 'Accounting', level: 'Level 5', awarding: 'Qualifi', price: '£10', originalPrice: '£419', learners: '640+', emoji: '💰', banner: 'from-[#e8f5e9] to-[#c8e6c9]', badge: 'bg-[#e8f5e9] text-[#2e7d32]' },
  { id: 7, title: 'Level 3 Diploma in Business Management', category: 'Business', level: 'Level 3', awarding: 'Qualifi', price: '£10', originalPrice: '£299', learners: '1,100+', emoji: '📈', banner: 'from-[#fce8e6] to-[#fad2cf]', badge: 'bg-[#e8f0fe] text-[#1a73e8]' },
  { id: 8, title: 'Level 5 Diploma in Health and Social Care', category: 'Health & Social Care', level: 'Level 5', awarding: 'TQUK', price: '£10', originalPrice: '£399', learners: '1,500+', emoji: '🏥', banner: 'from-[#e8f0fe] to-[#d2e3fc]', badge: 'bg-[#e6f4ea] text-[#137333]' },
  { id: 9, title: 'Level 7 Diploma in Project Management', category: 'Project Management', level: 'Level 7', awarding: 'OTHM', price: '£10', originalPrice: '£499', learners: '760+', emoji: '📋', banner: 'from-[#f3e5f5] to-[#e1bee7]', badge: 'bg-[#f3e5f5] text-[#7b1fa2]' },
  { id: 10, title: 'Certificate in Safeguarding Adults', category: 'Health & Social Care', level: 'Certificate', awarding: 'TQUK', price: '£10', originalPrice: '£199', learners: '3,200+', emoji: '🛡️', banner: 'from-[#e8f5e9] to-[#c8e6c9]', badge: 'bg-[#e6f4ea] text-[#137333]' },
  { id: 11, title: 'Level 4 Diploma in Human Resource Management', category: 'Human Resources', level: 'Level 4', awarding: 'Qualifi', price: '£10', originalPrice: '£349', learners: '920+', emoji: '👥', banner: 'from-[#e3f2fd] to-[#bbdefb]', badge: 'bg-[#e3f2fd] text-[#1565c0]' },
  { id: 12, title: 'Level 7 Diploma in Strategic Management', category: 'Business', level: 'Level 7', awarding: 'OTHM', price: '£10', originalPrice: '£499', learners: '680+', emoji: '🎯', banner: 'from-[#fce8e6] to-[#fad2cf]', badge: 'bg-[#e8f0fe] text-[#1a73e8]' },
];

const categories = ['All', 'Health & Social Care', 'Business', 'Technology', 'Leadership', 'Project Management', 'Accounting', 'Human Resources'];
const levels = ['All levels', 'Certificate', 'Level 3', 'Level 4', 'Level 5', 'Level 7'];
const awardingBodies = ['All', 'TQUK', 'Qualifi', 'OTHM', 'NOCN', 'iCQ'];

export default function Browse() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All levels');
  const [selectedAwarding, setSelectedAwarding] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  const filtered = allCourses
    .filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchLevel = selectedLevel === 'All levels' || c.level === selectedLevel;
      const matchAwarding = selectedAwarding === 'All' || c.awarding === selectedAwarding;
      return matchSearch && matchCategory && matchLevel && matchAwarding;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return parseInt(a.price.replace('£', '')) - parseInt(b.price.replace('£', ''));
      if (sortBy === 'Price: High to Low') return parseInt(b.price.replace('£', '')) - parseInt(a.price.replace('£', ''));
      if (sortBy === 'A–Z') return a.title.localeCompare(b.title);
      return parseInt(b.learners) - parseInt(a.learners);
    });

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">

      {/* Navbar */}
      <nav className="bg-[#0C0E13] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/#courses" className="hidden md:block text-sm text-[#9aa0a6] hover:text-white transition">Courses</Link>
          <Link href="/login" className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg border border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white transition">Log in</Link>
          <Link href="/login" className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white hover:opacity-90 transition">Get started</Link>
        </div>
      </nav>

      {/* Search hero */}
      <div className="bg-[#0C0E13] px-6 py-10 md:py-14">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Browse all courses</h1>
          <p className="text-sm text-gray-400 mb-6">Discover professional courses accredited by leading awarding bodies</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#4285f4] transition pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Filters sidebar */}
          <aside className="w-full md:w-56 shrink-0">

            {/* Category filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h4 className="text-xs font-semibold text-[#202124] mb-3">Category</h4>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg mb-1 transition ${selectedCategory === cat ? 'bg-[#e8f0fe] text-[#4285f4] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Level filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h4 className="text-xs font-semibold text-[#202124] mb-3">Level</h4>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg mb-1 transition ${selectedLevel === level ? 'bg-[#e8f0fe] text-[#4285f4] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Awarding body filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h4 className="text-xs font-semibold text-[#202124] mb-3">Awarding body</h4>
              {awardingBodies.map((body) => (
                <button
                  key={body}
                  onClick={() => setSelectedAwarding(body)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg mb-1 transition ${selectedAwarding === body ? 'bg-[#e8f0fe] text-[#4285f4] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {body}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedLevel('All levels'); setSelectedAwarding('All'); setSearch(''); }}
              className="w-full py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#ea4335] hover:text-[#ea4335] transition"
            >
              Reset all filters
            </button>
          </aside>

          {/* Course grid */}
          <div className="flex-1 min-w-0">

            {/* Results bar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#202124]">{filtered.length}</span> courses found
                {selectedCategory !== 'All' && <span className="ml-1">in <span className="text-[#4285f4]">{selectedCategory}</span></span>}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-[#202124] outline-none focus:border-[#4285f4]"
              >
                {['Popular', 'A–Z', 'Price: Low to High', 'Price: High to Low'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Category pills — mobile */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 md:hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${selectedCategory === cat ? 'bg-[#4285f4] text-white border-[#4285f4]' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* No results */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-sm font-semibold text-[#202124] mb-1">No courses found</h3>
                <p className="text-xs text-gray-400 mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSelectedLevel('All levels'); setSelectedAwarding('All'); setSearch(''); }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Course cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#4285f4] transition flex flex-col">
                  <div className={`h-24 bg-gradient-to-br ${c.banner} flex items-center justify-center text-3xl`}>{c.emoji}</div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.badge} mb-2 inline-block w-fit`}>{c.category}</span>
                    <p className="text-sm font-semibold text-[#202124] mb-1 leading-snug flex-1">{c.title}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.level}</span>
                      <span className="text-[10px] bg-[#f0f2f5] text-gray-500 px-2 py-0.5 rounded-full">{c.awarding}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">👥 {c.learners} learners enrolled</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-base font-bold text-[#202124]">{c.price}</span>
                        <span className="text-xs text-gray-400 line-through ml-2">{c.originalPrice}</span>
                      </div>
                    </div>
                    <Link href={`/enrol/${c.id}`} className="block w-full py-2 text-center rounded-lg bg-gradient-to-r from-[#4285f4] to-[#34a853] text-white text-xs font-medium hover:opacity-90 transition">
                      Enrol now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0C0E13] border-t border-white/5 px-6 py-10 mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285f4] to-[#34a853] flex items-center justify-center text-white font-bold text-xs">L</div>
              <span className="text-base font-bold bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] bg-clip-text text-transparent">LearnHub</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">The UK's leading specialist provider of distance learning professional and vocational courses — worldwide.</p>
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
            {['Health & Social Care', 'Business Management', 'Project Management', 'Accounting & Finance', 'Education & Training', 'Cyber Security'].map((c) => (
              <p key={c} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{c}</p>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-4 pb-2 border-b border-white/5">Platforms</h4>
            {['VLE — Student Portal', 'Moodle Learning', 'Mobile App', 'Corporate Training'].map((p) => (
              <p key={p} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{p}</p>
            ))}
            <h4 className="text-xs font-semibold text-white mt-5 mb-4 pb-2 border-b border-white/5">Quick Links</h4>
            {['All Courses', 'Qualifications', 'How to Pay', 'FAQs', 'Blog'].map((l) => (
              <p key={l} className="text-xs text-gray-500 mb-2 hover:text-white cursor-pointer transition">{l}</p>
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