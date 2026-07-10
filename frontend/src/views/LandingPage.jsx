// frontend/src/views/LandingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  const navigate = useNavigate();

  // Navbar scroll effect
  useEffect(() => {
    const nav = document.getElementById('lp-nav');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Typewriter
  useEffect(() => {
    const el = document.getElementById('typed-target');
    if (!el) return;
    const phrases = ['deserves to be heard.', 'shapes our culture.', 'drives real change.', 'matters to Pillar 5.'];
    let pi = 0, ci = 0, deleting = false, pause = 0;
    let raf;
    const tick = () => {
      if (pause > 0) { pause--; raf = setTimeout(tick, 50); return; }
      const phrase = phrases[pi];
      if (!deleting) {
        el.textContent = phrase.slice(0, ++ci);
        if (ci === phrase.length) { pause = 60; deleting = true; }
        raf = setTimeout(tick, 55);
      } else {
        el.textContent = phrase.slice(0, --ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; pause = 12; }
        raf = setTimeout(tick, 30);
      }
    };
    const t = setTimeout(tick, 1200);
    return () => { clearTimeout(t); clearTimeout(raf); };
  }, []);

  // Counter animation
  useEffect(() => {
    const animateCounter = (id, target, duration) => {
      const el = document.getElementById(id);
      if (!el) return;
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    const t = setTimeout(() => {
      animateCounter('stat-n1', 100, 1800);
      animateCounter('stat-n2', 24, 1600);
      animateCounter('stat-n3', 94, 2000);
      animateCounter('stat-n4', 500, 2200);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add('in-view'), parseInt(delay));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.lp-step,.lp-feature,.lp-quote,.reveal-el').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const PillarIcon = ({ style = {} }) => (
    <div className="lp-logo-mark" style={style}>
      <Logo variant="mark" />
    </div>
  );

  return (
    <div id="lp-root">

      {/* NAV */}
      <nav className="lp-nav" id="lp-nav">
        <div className="lp-logo" onClick={() => navigate('/')}>
          <PillarIcon />
          <div>
            <span className="lp-logo-text">Pillar<span>5</span> Group</span>
            <span className="lp-logo-sub">Above Average</span>
          </div>
        </div>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it Works</button>
          <button className="lp-nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
          <button className="lp-nav-link" onClick={() => navigate('/admin/login')}>Admin</button>
          <button className="lp-nav-cta" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />

        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <div className="lp-hero-badge-dot" />
            <span>Secure &amp; Confidential Feedback System</span>
          </div>

          {/* Big logo in hero */}
          <div className="lp-hero-logo-big">
            <div className="lp-hero-logo-glow" />
            <Logo variant="full" className="lp-hero-logo-full" />
          </div>

          <h1 className="lp-hero-h1">
            Your voice<br />
            <em className="word-blue" id="typed-target" /><span className="typed-cursor">|</span>
          </h1>

          <p className="lp-hero-sub">
            Submit complaints and compliments directly to Pillar 5 Group management — with supporting proof.
            Transparent, accountable, and designed for people who care about making things better.
          </p>

          <div className="lp-hero-ctas">
            <button className="lp-cta-primary" onClick={() => navigate('/login')}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Submit Feedback
            </button>
            <button className="lp-cta-secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num"><span id="stat-n1">0</span>%</div>
              <div className="lp-stat-label">Confidential</div>
            </div>
            <div className="lp-stat-div" />
            <div className="lp-stat">
              <div className="lp-stat-num"><span id="stat-n2">0</span>h</div>
              <div className="lp-stat-label">Response Time</div>
            </div>
            <div className="lp-stat-div" />
            <div className="lp-stat">
              <div className="lp-stat-num"><span id="stat-n3">0</span>%</div>
              <div className="lp-stat-label">Resolution Rate</div>
            </div>
            <div className="lp-stat-div" />
            <div className="lp-stat">
              <div className="lp-stat-num"><span id="stat-n4">0</span>+</div>
              <div className="lp-stat-label">Submissions Handled</div>
            </div>
          </div>
        </div>

        <div className="lp-scroll-hint">
          <span>Scroll to explore</span>
          <svg className="lp-scroll-arrow" width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.3)" strokeWidth={2}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section lp-section-mid" id="how-it-works">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-section-label">Process</div>
          <h2 className="lp-section-h2">Simple, <em>transparent</em> process</h2>
          <p className="lp-section-sub">Four steps between your experience and meaningful change inside Pillar 5 Group.</p>
          <div className="lp-steps" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              {
                n: '01', title: 'Sign In Securely',
                body: 'Log in with your Pillar 5 Group email and employee number.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              },
              {
                n: '02', title: 'Write Your Feedback',
                body: 'Choose complaint or compliment, select a category, and describe your experience.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              },
              {
                n: '03', title: 'Attach Proof',
                body: 'Upload photos or documents to support your submission.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              },
              {
                n: '04', title: 'Admin Reviews & Acts',
                body: 'Management reviews every submission, updates its status, and takes appropriate action.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><polyline points="20 6 9 17 4 12"/></svg>
              },
            ].map((s, i) => (
              <div key={s.n} className="lp-step" data-delay={i * 100}>
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* FEATURES */}
      <section className="lp-section lp-section-dark" id="features">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-h2">Built for <em>accountability</em></h2>
          <p className="lp-section-sub">Everything needed for a fair, functional internal feedback system.</p>
          <div className="lp-features">
            {[
              {
                title: 'Named & Accountable',
                body: 'Submissions are linked to your Pillar 5 account so management can follow up appropriately.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              },
              {
                title: 'Proof Attachments',
                body: 'Attach photos or documents directly to your complaint or compliment to provide evidence.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              },
              {
                title: 'Full Status Tracking',
                body: 'Every submission moves through New → In Review → Resolved. Track your own submissions in real time.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              },
              {
                title: 'Categorised & Verified',
                body: 'All users must register with a Pillar 5 Group email and employee/contract number — no anonymous or external submissions.',
                icon: <svg fill="none" viewBox="0 0 24 24" stroke="#42a5f5" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              },
            ].map((f, i) => (
              <div key={f.title} className="lp-feature" data-delay={i * 100}>
                <div className="lp-feature-icon" style={{ background: 'rgba(21,101,192,.12)' }}>{f.icon}</div>
                <div><h3>{f.title}</h3><p>{f.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* QUOTES */}
      <section className="lp-section lp-section-light">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-section-label">Culture</div>
          <h2 className="lp-section-h2">Why <em>feedback</em> matters</h2>
          <div className="lp-quotes">
            {[
              { initials: 'SM', name: 'Sarah Mthembu', role: 'HR Manager, Pillar 5 Group', delay: 0, quote: 'A culture of feedback is a culture of improvement. When employees feel heard, they stay engaged and invested in the company\'s success.' },
              { initials: 'JB', name: 'James van der Berg', role: 'IT Lead, Pillar 5 Group', delay: 150, quote: 'The ability to raise concerns safely, with supporting evidence, is the foundation of psychological safety in any organisation.' },
              { initials: 'ND', name: 'Nomvula Dlamini', role: 'Operations, Pillar 5 Group', delay: 300, quote: 'Recognising good work publicly motivates teams. A compliment submitted here reaches the people who can turn it into recognition.' },
            ].map((q) => (
              <div key={q.name} className="lp-quote" data-delay={q.delay}>
                <div className="lp-quote-mark">"</div>
                <p>{q.quote}</p>
                <div className="lp-quote-author">
                  <div className="lp-quote-av">{q.initials}</div>
                  <div>
                    <div className="lp-quote-name">{q.name}</div>
                    <div className="lp-quote-role">{q.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner-inner reveal-el">
          <h2>Ready to make your<br /><em>voice count?</em></h2>
          <p>Sign in with your Pillar 5 Group account and submit your first piece of feedback in under two minutes.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="lp-cta-primary" onClick={() => navigate('/login')}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              Get Started
            </button>
            <button className="lp-cta-secondary" onClick={() => navigate('/admin/login')}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div>
          <div className="lp-logo" style={{ marginBottom: 8 }}>
            <div className="lp-logo-mark" style={{ width: 34, height: 34 }}>
              <Logo variant="mark" />
            </div>
            <div>
              <span className="lp-logo-text" style={{ fontSize: 15 }}>Pillar<span>5</span> Group</span>
              <span className="lp-logo-sub" style={{ fontSize: 9 }}>Above Average</span>
            </div>
          </div>
          <div className="lp-footer-copy">&copy; 2025 Pillar 5 Group — Internal Feedback Portal. Submissions visible to authorised admin only.</div>
        </div>
        <div className="lp-footer-links">
          <span className="lp-footer-link" onClick={() => navigate('/login')}>Submit Feedback</span>
          <span className="lp-footer-link" onClick={() => navigate('/admin/login')}>Admin</span>
          <span className="lp-footer-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
        </div>
      </footer>
    </div>
  );
}