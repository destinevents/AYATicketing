'use client';

import { useState, useEffect } from 'react';
import '../styles/landing.css';
import type { PartnerRecord } from '@/lib/types';

interface EventTicket {
  name: string;
  price: number;
  capacity: number;
  sold: number;
  status: string;
}

interface LiveEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date: string | null;
  venue_name: string | null;
  category: string;
  cover_image_url?: string | null;
  event_tickets: EventTicket[];
}

interface LandingPageProps {
  events?: LiveEvent[];
  totalMembers?: number;
  partners?: PartnerRecord[];
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech & Digital',
  food: 'Food & Beverage',
  agri: 'Agriculture & Organic',
  events: 'Events & Hospitality',
  education: 'Education',
  creative: 'Creative Services',
  retail: 'Retail & Fashion',
  wellness: 'Wellness & Beauty',
};

const CATEGORY_STYLES: Record<string, { gradient: string; emoji: string; tag: string }> = {
  'sip-and-scale':   { gradient: 'linear-gradient(135deg,#1D2A1D,#3A6A3A)', emoji: '🍷', tag: "Sip & Scale" },
  'rebloom':         { gradient: 'linear-gradient(135deg,#1D3028,#2D5C40)', emoji: '🌱', tag: "RE:BLOOM" },
  'founder-session': { gradient: 'linear-gradient(135deg,#2B3228,#4E5C49)', emoji: '✨', tag: "Founder Session" },
  'workshop':        { gradient: 'linear-gradient(135deg,#2A1D38,#6B4A8E)', emoji: '🎓', tag: "Workshop" },
  'partner-event':   { gradient: 'linear-gradient(135deg,#2A1D1D,#8E4A4A)', emoji: '🤝', tag: "Partner Event" },
  'other':           { gradient: 'linear-gradient(135deg,#1D2A3A,#2D5A8E)', emoji: '🌿', tag: "Community Event" },
};

function getLowestPrice(tickets: EventTicket[]): string {
  const open = tickets.filter(t => t.status !== 'hidden' && t.status !== 'closed');
  if (!open.length) return 'Check website';
  const min = Math.min(...open.map(t => Number(t.price)));
  return min === 0 ? 'Free' : `₱${min.toLocaleString()}`;
}

function getSeatsRemaining(tickets: EventTicket[]): string {
  const open = tickets.filter(t => t.status !== 'hidden' && t.status !== 'closed');
  if (!open.length) return 'Sold out';
  const totalRemaining = open.reduce((sum, t) => {
    if (t.capacity <= 0) return sum + 999;
    return sum + Math.max(t.capacity - t.sold, 0);
  }, 0);
  if (totalRemaining >= 999) return 'Open to all';
  if (totalRemaining === 0) return 'Sold out';
  return `${totalRemaining} seat${totalRemaining !== 1 ? 's' : ''} remaining`;
}


const STUDENTS_UCBFA = Array.from({ length: 8 }, (_, i) => ({
  initial: 'S',
  name: `Student ${i + 1}`,
  school: 'UCBFA',
  role: 'Intern · Batch 2026',
  link: '#',
  gradient: 'linear-gradient(135deg,#2B3228,#4E5C49)',
}));


const STUDENTS_UCCITCS = [
  { initial: 'M', name: 'Mary Keirstin Marziel Itliong Ante', school: 'UCCITCS', role: 'Intern · Batch 2026', link: '/Kei_PortfolioV1.html', gradient: 'linear-gradient(135deg,#7A9B6A,#3A4436)', image: '' },
  { initial: 'D', name: 'Derick Myles Mercado', school: 'UCCITCS', role: 'Intern · Batch 2026', link: '/Derick_PortfolioV1.html', gradient: 'linear-gradient(135deg,#7A9B6A,#3A4436)', image: 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/499934252_2613479442330977_3090380740370684422_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1080&ctp=s1080x1080&_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeFmbQPNJFnGkpM2tZb4yuOTMF4TlRRfr48wXhOVFF-vj-Ak7_lJ6ItYqkPDbB2dD7R3FzCIkC7b58b7Qzo5sq_C&_nc_ohc=z0-rZjwxiNwQ7kNvwGW3jQx&_nc_oc=AdpJoyMQaBEztkKpN2n7bXZPR_HHy31JQjD5hsugmbCyLHqGp_djbAL3hzw5kflxTlg&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=UICdPpDp3k1eruBVKhewGA&_nc_ss=7b2a8&oh=00_Af_c2wJ1howOc-2zyvAUQAIS8rS4SiuQSSpE-EAQLIrteg&oe=6A40536B' },
  { initial: 'E', name: 'Ethan Wilvic Bernabe', school: 'UCCITCS', role: 'Intern · Batch 2026', link: '/Ethan_PortfolioV1.html', gradient: 'linear-gradient(135deg,#7A9B6A,#3A4436)', image: '' },
  { initial: 'J', name: 'Jhon Gabriel Maitas Carlos', school: 'UCCITCS', role: 'Intern · Batch 2026', link: '/Gab_PortfolioV1.html', gradient: 'linear-gradient(135deg,#7A9B6A,#3A4436)', image: '' },
  { initial: 'M', name: 'Miranda, Christian Joseph', school: 'UCCITCS', role: 'Intern · Batch 2026', link: '/CJ_PortfolioV1.html', gradient: 'linear-gradient(135deg,#7A9B6A,#3A4436)', image: '' },
  { initial: 'J', name: 'Ja', school: 'UCCITCS', role: 'Intern · Batch 2026', link: '/Ja_PortfolioV1.html', gradient: 'linear-gradient(135deg,#7A9B6A,#3A4436)', image: '' },
];

export default function LandingPage({ events = [], totalMembers = 0, partners = [] }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'content-creators' | 'creatives'>('content-creators');
  const [smeSearch, setSmeSearch] = useState('');
  const [smeCategory, setSmeCategory] = useState('');
  const [smeLocation, setSmeLocation] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [selectedJoinType, setSelectedJoinType] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // Particles
    const container = document.getElementById('particles');
    if (container) {
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 6 + 3;
        p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;bottom:${Math.random() * 20}%;animation-duration:${Math.random() * 12 + 8}s;animation-delay:${Math.random() * 8}s;`;
        container.appendChild(p);
      }
    }

    return () => {};
  }, []);

  // Re-run scroll reveal whenever the active tab changes so newly rendered elements animate in
  useEffect(() => {
    const reveals = document.querySelectorAll('.landing-wrapper .reveal:not(.visible)');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  const handleJoin = async () => {
    if (!joinName.trim()) { showToast('Please enter your name ✦'); return; }
    if (!joinEmail.trim() || !joinEmail.includes('@')) { showToast('Please enter a valid email ✦'); return; }
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: joinName.trim(), email: joinEmail.trim(), join_type: selectedJoinType }),
      });
      if (res.ok) {
        showToast(`Welcome to AYA, ${joinName.split(' ')[0]}! We'll be in touch. 🌿`);
        setJoinName('');
        setJoinEmail('');
        setSelectedJoinType('');
      } else {
        showToast('Something went wrong — please try again.');
      }
    } catch {
      showToast('Something went wrong — please try again.');
    }
  };

  const filteredSmes = partners.filter((sme) => {
    const q = smeSearch.toLowerCase();
    return (
      (!q || sme.name.toLowerCase().includes(q)) &&
      (!smeCategory || sme.category === smeCategory) &&
      (!smeLocation || sme.location.includes(smeLocation))
    );
  });

  return (
    <div className="landing-wrapper">

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-particles" id="particles" />

        <div className="hero-silhouette">
          <svg viewBox="0 0 1440 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,300 L0,200 L80,160 L180,220 L260,130 L380,180 L480,90 L560,140 L660,60 L740,110 L820,50 L900,100 L980,40 L1060,90 L1140,30 L1220,80 L1300,45 L1380,95 L1440,70 L1440,300 Z" fill="rgba(43,50,40,0.6)" />
            <path d="M0,300 L0,230 L120,200 L200,240 L300,180 L420,210 L500,160 L600,190 L700,130 L800,165 L880,120 L960,155 L1040,105 L1120,145 L1200,110 L1280,145 L1360,120 L1440,145 L1440,300 Z" fill="rgba(29,34,25,0.85)" />
          </svg>
        </div>
        <div className="hero-fog" />

        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">Baguio City, Philippines &nbsp;·&nbsp; 600+ Members</div>
            <h1 className="hero-headline">
              <em>As You Are</em>
              <strong>Baguio</strong>
            </h1>
            <p className="hero-sub">A community platform for Baguio's creators, entrepreneurs, and ecosystem builders. Get discovered, connect with local SMEs, and be part of the stories shaping the City of Pines.</p>
            <div className="hero-actions">
              <a href="#join" className="btn-primary">Join the Community</a>
              <a href="#creators" className="btn-ghost">Explore Creators</a>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-stat-card">
              <div className="stat-row">
                <div>
                  <div className="stat-num">{totalMembers > 0 ? totalMembers : '600'}<span style={{ fontSize: '1.8rem' }}>+</span></div>
                  <div className="stat-label">Community Members<br /><span className="stat-tag">Active & growing</span></div>
                </div>
              </div>
              <div className="stat-row">
                <div>
                  <div className="stat-num">2</div>
                  <div className="stat-label">Featured Creators<br /><span className="stat-tag">Content · Community</span></div>
                </div>
              </div>
              <div className="stat-row">
                <div>
                  <div className="stat-num">6</div>
                  <div className="stat-label">Local SMEs Listed<br /><span className="stat-tag">Food · Tech · Events</span></div>
                </div>
              </div>
              <div className="stat-row">
                <div>
                  <div className="stat-num">22</div>
                  <div className="stat-label">Featured Creatives<br /><span className="stat-tag">UCBFA · UB IT · UCCITCS · Student Leaders</span></div>
                </div>
              </div>
              <div className="stat-row">
                <div>
                  <div className="stat-num">1</div>
                  <div className="stat-label">eMagazine Issue Out<br /><span className="stat-tag">Monthly · Baguio Stories</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-cue">
          <div className="scroll-line" />
          <div className="scroll-label">Explore</div>
        </div>
      </section>

      {/* ── CREATOR DIRECTORY ── */}
      <section className="section" id="creators">
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="eyebrow">Creator Directory</div>
            <h2 className="section-title">Baguio's <em>Creative Voices</em></h2>
            <p className="section-sub">Discover the creators, student leaders, and community builders rooted in Baguio City — organized by what they do and who they are.</p>
          </div>

          <div className="creator-tabs reveal">
            <button className={`ctab${activeTab === 'content-creators' ? ' active' : ''}`} onClick={() => setActiveTab('content-creators')}>
              <span className="ctab-icon">🎙️</span>
              <span className="ctab-label">Content Creators</span>
              <span className="ctab-count">2</span>
            </button>
            <button className={`ctab${activeTab === 'creatives' ? ' active' : ''}`} onClick={() => setActiveTab('creatives')}>
              <span className="ctab-icon">🎨</span>
              <span className="ctab-label">Creatives</span>
              <span className="ctab-count">22</span>
            </button>
          </div>

          {/* TAB 1: CONTENT CREATORS */}
          {activeTab === 'content-creators' && (
            <div>
              <div className="tab-desc reveal">
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Media personalities, community builders, and content creators rooted in Baguio City.
                </p>
              </div>
              <div className="creator-grid">
                {/* Monica Joy Fernandez */}
                <div className="creator-card creator-featured">
                  <div className="creator-cover">
                    <div className="creator-cover-gradient" style={{ background: 'linear-gradient(135deg,#2B3228,#4E5C49)' }} />
                    <div className="creator-avatar">👩‍💼</div>
                    <div className="featured-badge">✦ Co-Host</div>
                  </div>
                  <div className="creator-body">
                    <div className="creator-name">Monica Joy Fernandez</div>
                    <div className="creator-handle">@monicaaajoy</div>
                    <span className="creator-niche">Events & Community</span>
                    <div className="creator-stats">
                      <div className="creator-stat"><div className="creator-stat-num">6K+</div><div className="creator-stat-lbl">Followers</div></div>
                      <div className="creator-stat"><div className="creator-stat-num">3M+</div><div className="creator-stat-lbl">Views</div></div>
                      <div className="creator-stat"><div className="creator-stat-num">150K</div><div className="creator-stat-lbl">Likes</div></div>
                    </div>
                    <div className="creator-socials">
                      <a href="https://instagram.com/monicaaajoy" target="_blank" rel="noopener noreferrer" className="social-pill">IG</a>
                      <a href="https://tiktok.com/@monicajoy" target="_blank" rel="noopener noreferrer" className="social-pill">TT</a>
                      <a href="#" className="social-pill">FB</a>
                    </div>
                  </div>
                  <div className="creator-card-footer">
                    <span className="creator-location">📍 Baguio City</span>
                    <a href="/Monica_PortfolioV1.html" target="_blank" rel="noopener noreferrer" className="sme-link">View Profile →</a>
                  </div>
                </div>

                {/* Jan */}
                <div className="creator-card creator-featured">
                  <div className="creator-cover">
                    <div className="creator-cover-gradient" style={{ background: 'linear-gradient(135deg,#1D2A3A,#2D5A8E)' }} />
                    <div className="creator-avatar">🎙️</div>
                    <div className="featured-badge">✦ Creator</div>
                  </div>
                  <div className="creator-body">
                    <div className="creator-name">Jan</div>
                    <div className="creator-handle">@jan.baguio</div>
                    <span className="creator-niche">Content & Community</span>
                    <div className="creator-stats">
                      <div className="creator-stat"><div className="creator-stat-num">—</div><div className="creator-stat-lbl">Followers</div></div>
                      <div className="creator-stat"><div className="creator-stat-num">—</div><div className="creator-stat-lbl">Views</div></div>
                      <div className="creator-stat"><div className="creator-stat-num">—</div><div className="creator-stat-lbl">Likes</div></div>
                    </div>
                    <div className="creator-socials">
                      <a href="#" className="social-pill">IG</a>
                      <a href="#" className="social-pill">FB</a>
                    </div>
                  </div>
                  <div className="creator-card-footer">
                    <span className="creator-location">📍 Baguio City</span>
                    <a href="/Jan_PortfolioV1.html" target="_blank" rel="noopener noreferrer" className="sme-link">View Profile →</a>
                  </div>
                </div>
              </div>

              <div className="get-featured-strip reveal" style={{ marginTop: '2.5rem' }}>
                <div>
                  <h3>Are you a Baguio creator? <em>Get featured.</em></h3>
                  <p>Join the AYA directory and get discovered by the community.</p>
                </div>
                <a href="#join" className="btn-primary">Apply to Get Featured</a>
              </div>
            </div>
          )}

          {/* TAB 2: CREATIVES */}
          {activeTab === 'creatives' && (
            <div>
              <div className="tab-desc reveal">
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Student leaders, interns, and emerging creatives we are proud to host and feature from Baguio's top schools.
                </p>
              </div>

              <div className="student-leader-banner reveal">
                <div className="slb-icon">🎓</div>
                <div>
                  <div className="slb-label">Student Leader</div>
                  <div className="slb-name">Josh</div>
                  <div className="slb-sub">AYA Student Leader · IT Cohort · Operations</div>
                </div>
                <a href="/Josh_PortfolioV1.html" target="_blank" rel="noopener noreferrer" className="sme-link" style={{ marginLeft: 'auto' }}>View Profile →</a>
              </div>

              {/* UCCITCS */}
              <div className="cohort-header reveal">
                <div className="cohort-tag" style={{ background: 'rgba(122,155,106,0.15)', color: '#4E5C49', borderColor: 'rgba(122,155,106,0.3)' }}>UCCITCS</div>
                <div className="cohort-title">University of the Cordilleras — College of Information Technology and Computer Science</div>
                <div className="cohort-count">6 Students</div>
              </div>
              <div className="student-grid reveal">
                {STUDENTS_UCCITCS.map((s, i) => (
                  <div key={i} className="student-card">
                    {s.image
                      ? <img src={s.image} alt={s.name} className="student-avatar student-avatar-photo" />
                      : <div className="student-avatar" style={{ background: s.gradient }}>{s.initial}</div>
                    }
                    <div className="student-name">{s.name}</div>
                    <div className="student-school">{s.school}</div>
                    <div className="student-role">{s.role}</div>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="student-profile-btn">View Profile</a>
                  </div>
                ))}
              </div>

              {/* UCBFA */}
              <div className="cohort-header reveal" style={{ marginTop: '2.5rem' }}>
                <div className="cohort-tag">UCBFA</div>
                <div className="cohort-title">University of the Cordilleras — Business & Finance Arts</div>
                <div className="cohort-count">8 Students</div>
              </div>
              <div className="student-grid reveal">
                {STUDENTS_UCBFA.map((s, i) => (
                  <div key={i} className="student-card">
                    <div className="student-avatar" style={{ background: s.gradient }}>{s.initial}</div>
                    <div className="student-name">{s.name}</div>
                    <div className="student-school">{s.school}</div>
                    <div className="student-role">{s.role}</div>
                    <a href={s.link} className="student-profile-btn">View Profile</a>
                  </div>
                ))}
              </div>


              <div className="get-featured-strip reveal" style={{ marginTop: '2.5rem' }}>
                <div>
                  <h3>Are you a student creator? <em>Get featured.</em></h3>
                  <p>We spotlight Baguio students building something meaningful.</p>
                </div>
                <a href="#join" className="btn-primary">Apply to Get Featured</a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SME DIRECTORY ── */}
      <section className="section section-dark" id="smes">
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="eyebrow eyebrow-light">SME Directory</div>
            <h2 className="section-title section-title-light">Baguio's <em>Local Businesses</em></h2>
            <p className="section-sub" style={{ color: 'rgba(240,237,230,0.6)' }}>From cafés and boutiques to service providers — discover and support the entrepreneurs building the Baguio economy.</p>
          </div>

          <div className="search-bar reveal">
            <div className="search-input-wrap">
              <span className="search-icon" style={{ color: 'rgba(240,237,230,0.5)' }}>🔍</span>
              <input
                type="text"
                className="search-input search-input-dark"
                placeholder="Search businesses…"
                value={smeSearch}
                onChange={(e) => setSmeSearch(e.target.value)}
              />
            </div>
            <select className="filter-select filter-select-dark" value={smeCategory} onChange={(e) => setSmeCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="food">Food & Beverage</option>
              <option value="agri">Agriculture & Organic</option>
              <option value="retail">Retail & Fashion</option>
              <option value="wellness">Wellness & Beauty</option>
              <option value="tech">Tech & Digital</option>
              <option value="events">Events & Hospitality</option>
              <option value="education">Education</option>
              <option value="creative">Creative Services</option>
            </select>
            <select className="filter-select filter-select-dark" value={smeLocation} onChange={(e) => setSmeLocation(e.target.value)}>
              <option value="">All Locations</option>
              <option value="session road">Session Road Area</option>
              <option value="burnham">Burnham Park Area</option>
              <option value="bg west">BG West</option>
              <option value="la trinidad">La Trinidad, Benguet</option>
              <option value="itogon">Itogon / Benguet</option>
              <option value="baguio city">Baguio City</option>
            </select>
          </div>

          <div className="results-meta results-meta-dark">
            Showing {filteredSmes.length} business{filteredSmes.length !== 1 ? 'es' : ''}
          </div>

          <div className="sme-grid">
            {filteredSmes.length === 0 && (
              <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}>
                No businesses found. Try a different keyword or filter.
              </p>
            )}
            {filteredSmes.map((sme) => (
              <div key={sme.id} className={`sme-card${sme.is_placeholder ? ' sme-coming' : ''}`}>
                <div className="sme-card-header">
                  <div className="sme-logo" style={sme.is_placeholder ? { opacity: 0.4 } : {}}>
                    {(sme.logo?.startsWith('http') || sme.logo?.startsWith('/'))
                      ? <img src={sme.logo} alt={sme.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                      : sme.logo}
                  </div>
                  <div>
                    <div className="sme-name" style={sme.is_placeholder ? { opacity: 0.55 } : {}}>{sme.name}</div>
                    <div className="sme-category">{sme.is_placeholder ? 'Open Slot' : (CATEGORY_LABELS[sme.category] ?? sme.category)}</div>
                  </div>
                </div>
                <div className="sme-desc" style={sme.is_placeholder ? { opacity: 0.5, fontStyle: 'italic' } : {}}>{sme.description}</div>
                <div className="sme-tags">
                  {sme.tags.map((tag, j) => (
                    <span key={j} className="sme-tag" style={sme.is_placeholder ? { opacity: 0.5 } : {}}>{tag}</span>
                  ))}
                </div>
                <div className="sme-footer">
                  <span className="sme-location" style={sme.is_placeholder ? { opacity: 0.5 } : {}}>📍 {sme.location_label}</span>
                  {sme.is_placeholder
                    ? <a href="#join" className="sme-link">Become a Partner →</a>
                    : <a href={sme.website} target={sme.website.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="sme-link">Visit →</a>
                  }
                </div>
              </div>
            ))}
          </div>

          <div className="get-featured-strip reveal" style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(240,237,230,0.1)' }}>
            <div>
              <h3 style={{ color: 'var(--fog)' }}>Own a Baguio business? <em>Get listed.</em></h3>
              <p style={{ color: 'rgba(240,237,230,0.55)' }}>Join the SME directory and reach the AYA community of 600+ members, creators, and fellow entrepreneurs.</p>
            </div>
            <a href="#join" className="btn-primary">List My Business</a>
          </div>
        </div>
      </section>

      {/* ── eMagazine ── */}
      <section className="section" id="emag">
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="eyebrow">AYA eMagazine</div>
            <h2 className="section-title">Stories from the <em>City of Pines</em></h2>
            <p className="section-sub">The official AYA digital magazine — featuring creators, entrepreneurs, and the people behind Baguio's vibrant community. Published monthly.</p>
          </div>

          <div className="emag-layout reveal">
            <div>
              <div className="emag-flipbook" id="emag-frame">
                {/* Replace the div below with your Heyzine iframe embed:
                    <iframe src="https://heyzine.com/flip-book/YOUR-CODE.html" seamless scrolling="no" frameBorder="0" allowTransparency allowFullScreen style={{width:'100%',height:'100%'}} />
                */}
                <div className="emag-placeholder">
                  <div className="placeholder-icon">📖</div>
                  <p>Your Heyzine eMagazine flipbook will appear here. Paste your embed code above.</p>
                  <div className="placeholder-code">
                    {'<iframe src="https://heyzine.com/flip-book/YOUR-CODE.html" ... />'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href="#" className="btn-primary" style={{ fontSize: '0.6rem' }}>Read Latest Issue →</a>
                <a href="#" className="btn-ghost" style={{ fontSize: '0.6rem', borderColor: 'var(--border-fog)', color: 'var(--muted)' }}>Download PDF</a>
              </div>
            </div>

            <div className="emag-sidebar">
              <p className="section-sub">The AYA eMagazine spotlights Baguio's creators, SMEs, and stories that rarely make the mainstream press. Submissions open every month.</p>
              <div className="past-issues">
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Past Issues</div>
                <div className="past-issue-item">
                  <div className="past-issue-thumb">📕</div>
                  <div>
                    <div className="past-issue-title">The Sip & Scale Launch Edition</div>
                    <div className="past-issue-date">June 2026 · Vol. 1 Issue 1</div>
                  </div>
                </div>
                <div className="past-issue-item">
                  <div className="past-issue-thumb" style={{ background: 'var(--fog-2)' }}>📗</div>
                  <div>
                    <div className="past-issue-title">Baguio Founders Spotlight</div>
                    <div className="past-issue-date">Coming Soon · Vol. 1 Issue 2</div>
                  </div>
                </div>
                <div className="past-issue-item">
                  <div className="past-issue-thumb" style={{ background: 'var(--fog-2)' }}>📘</div>
                  <div>
                    <div className="past-issue-title">Women Who Build Baguio</div>
                    <div className="past-issue-date">Coming Soon · Vol. 1 Issue 3</div>
                  </div>
                </div>
              </div>
              <div className="emag-submit-card">
                <h4>Have a story to tell?</h4>
                <p>We feature Baguio creators, businesses, community events, and untold stories. Submissions are free and open to everyone in the AYA community.</p>
                <a href="#join" className="btn-primary" style={{ fontSize: '0.6rem' }}>Submit Your Story</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="section section-pine-deep" id="events">
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="eyebrow eyebrow-light">Upcoming Events</div>
            <h2 className="section-title section-title-light">Where the <em>Community Gathers</em></h2>
            <p className="section-sub" style={{ color: 'rgba(240,237,230,0.6)' }}>AYA events brought to life by Destine Events. From intimate Builder's Circles to curated founder dinners — always intentional, always Baguio.</p>
          </div>

          <div className="events-grid reveal">
            {events.length > 0 ? events.map((event) => {
              const style = CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES['other'];
              const date = new Date(event.start_date);
              const day = date.toLocaleDateString('en-US', { day: 'numeric' });
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              const endDate = event.end_date ? new Date(event.end_date) : null;
              const endTimeStr = endDate ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
              const price = getLowestPrice(event.event_tickets ?? []);
              const seats = getSeatsRemaining(event.event_tickets ?? []);
              const isSoldOut = seats === 'Sold out';
              return (
                <div key={event.id} className="event-card">
                  <div className="event-cover">
                    {event.cover_image_url
                      ? <img src={event.cover_image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div className="event-cover-bg" style={{ background: style.gradient }}>{style.emoji}</div>
                    }
                    <div className="event-date-badge"><div className="day">{day}</div><div className="month">{month}</div></div>
                  </div>
                  <div className="event-body">
                    <div className="event-type-tag">{style.tag}</div>
                    <div className="event-title">{event.title}</div>
                    <div className="event-meta">🕐 {timeStr}{endTimeStr ? ` – ${endTimeStr}` : ''}</div>
                    <div className="event-meta">📍 {event.venue_name ?? 'Baguio City'}</div>
                    <div className="event-meta">🎫 {price}</div>
                  </div>
                  <div className="event-footer">
                    <span className="event-seats">{seats}</span>
                    {isSoldOut
                      ? <span className="event-register" style={{ opacity: 0.5, cursor: 'default' }}>Sold Out</span>
                      : <a href={`/events/${event.slug}`} className="event-register">Register Now</a>
                    }
                  </div>
                </div>
              );
            }) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(240,237,230,0.4)', fontSize: '0.9rem' }}>
                No upcoming events right now — check back soon!
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }} className="reveal">
            <p style={{ fontSize: '0.85rem', color: 'rgba(240,237,230,0.45)', marginBottom: '1rem' }}>
              Powered by <strong style={{ color: 'rgba(240,237,230,0.65)' }}>Destine Events</strong> — Baguio&apos;s community experience engine
            </p>
            <a href="/events" className="btn-ghost">View All Events →</a>
          </div>
        </div>
      </section>

      {/* ── JOIN ── */}
      <section className="join-section" id="join">
        <div className="join-inner">
          <div className="eyebrow eyebrow-light">Join the Movement</div>
          <h2 className="join-headline">
            You belong here,<br />
            <em>as you are.</em>
          </h2>
          <p className="join-sub">Whether you're a creator looking to grow, an entrepreneur wanting to be discovered, or a community builder who wants to connect — AYA Baguio is your home. No performance required.</p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { value: 'creator', icon: '🎨', label: "I'm a Creator", sub: 'Get featured in the directory' },
              { value: 'sme', icon: '🏪', label: "I'm an SME", sub: 'List my business' },
              { value: 'community', icon: '🌿', label: "I'm Community", sub: 'Just want to connect' },
            ].map((item) => (
              <button
                key={item.value}
                className={`join-type-btn${selectedJoinType === item.value ? ' selected' : ''}`}
                onClick={() => {
                  setSelectedJoinType(item.value);
                  showToast(`You selected: ${item.label} — fill in your details below!`);
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '0.95rem', color: 'var(--fog)' }}>{item.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(240,237,230,0.5)' }}>{item.sub}</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Your full name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              className="search-input-dark"
              style={{ flex: 1, minWidth: '200px', padding: '13px 18px', border: '1px solid rgba(240,237,230,0.2)', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--fog)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', outline: 'none' }}
            />
            <input
              type="email"
              placeholder="Your email address"
              value={joinEmail}
              onChange={(e) => setJoinEmail(e.target.value)}
              className="search-input-dark"
              style={{ flex: 1, minWidth: '200px', padding: '13px 18px', border: '1px solid rgba(240,237,230,0.2)', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--fog)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', outline: 'none' }}
            />
          </div>
          <button className="btn-primary" onClick={handleJoin} style={{ width: '100%', maxWidth: '340px', padding: '16px', fontSize: '0.68rem' }}>
            Join the AYA Community →
          </button>
          <p style={{ fontSize: '0.75rem', color: 'rgba(240,237,230,0.3)', marginTop: '1rem' }}>Free to join. Rooted in faith, authenticity & community. ✦</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src="/images/logos/aya-baguio-text.png" alt="AYA" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }} />
              <span><em>As You Are</em> Baguio</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '0.72rem' }}>Community platform for creators & SMEs in Baguio City, Philippines</div>
          </div>
          <div className="footer-note">
            Powered by <a href="https://destinevents.biz" target="_blank" rel="noopener noreferrer">Destine Events</a> &nbsp;·&nbsp;
            Built by <a href="https://disenyodigitals.com" target="_blank" rel="noopener noreferrer">Disenyo Digitals</a> &nbsp;·&nbsp;
            © 2026 As You Are Baguio
          </div>
        </div>
      </footer>

      {/* ── TOAST ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: `translateX(-50%) translateY(${toastVisible ? '0' : '20px'})`,
          background: 'var(--pine)',
          color: 'var(--fog)',
          padding: '12px 24px',
          borderRadius: '4px',
          fontSize: '0.82rem',
          opacity: toastVisible ? 1 : 0,
          transition: 'all 0.3s',
          pointerEvents: 'none',
          zIndex: 999,
          whiteSpace: 'nowrap',
          border: '1px solid rgba(201,168,76,0.3)',
        }}
      >
        {toastMsg}
      </div>
    </div>
  );
}
