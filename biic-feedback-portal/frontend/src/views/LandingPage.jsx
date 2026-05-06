// frontend/src/views/LandingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const phrases = ['deserves to be heard.', 'shapes our culture.', 'drives real change.', 'matters to BIIC.'];
    let pi = 0, ci = 0, deleting = false, pause = 0, raf;
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

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.lp-step,.lp-feature,.lp-quote,.reveal-el').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div id="lp-root">
      {/* NAV */}
      <nav className="lp-nav" id="lp-nav">
        <div className="lp-logo" onClick={() => navigate('/')}>
          <div className="lp-logo-mark">B</div>
          <span className="lp-logo-text">BIIC <span>Portal</span></span>
        </div>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior:'smooth' })}>How it Works</button>
          <button className="lp-nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}>Features</button>
          <button className="lp-nav-link" onClick={() => navigate('/admin/login')}>Admin</button>
          <button className="lp-nav-cta"  onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-grid" />
        <div className="lp-orb lp-orb-1" /><div className="lp-orb lp-orb-2" /><div className="lp-orb lp-orb-3" />
        <div className="lp-hero-inner">
          <div className="lp-hero-badge"><div className="lp-hero-badge-dot" /><span>Secure &amp; Confidential Feedback System</span></div>
          <h1 className="lp-hero-h1">
            Your voice<br />
            <em className="word-gold" id="typed-target" /><span className="typed-cursor">|</span>
          </h1>
          <p className="lp-hero-sub">Submit complaints and compliments directly to BIIC management. Transparent, accountable, and designed for people who care about making things better.</p>
          <div className="lp-hero-ctas">
            <button className="lp-cta-primary" onClick={() => navigate('/login')}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={18} height={18}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Submit Feedback
            </button>
            <button className="lp-cta-secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior:'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
        <div className="lp-scroll-hint">
          <span>Scroll to explore</span>
          <svg className="lp-scroll-arrow" width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="rgba(245,240,232,.3)" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section lp-section-mid" id="how-it-works">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="lp-section-label">Process</div>
          <h2 className="lp-section-h2">Simple, <em>transparent</em> process</h2>
          <p className="lp-section-sub">Three steps between your experience and meaningful change inside BIIC.</p>
          <div className="lp-steps">
            {[
              { n:'01', title:'Sign In Securely', body:'Log in with your BIIC employee account. Registration takes under a minute.' },
              { n:'02', title:'Submit Your Feedback', body:'Choose complaint or compliment, select a category, and write your message.' },
              { n:'03', title:'Admin Reviews & Acts', body:'Management reviews every submission and tracks it through to resolution.' },
            ].map((s, i) => (
              <div key={s.n} className="lp-step" data-delay={i * 150}>
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.8}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section lp-section-dark" id="features">
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-h2">Built for <em>accountability</em></h2>
          <div className="lp-features">
            {[
              { title:'Named & Accountable',   body:'Submissions are linked to your BIIC account so management can follow up. Your name is visible only to authorised admins.', color:'rgba(201,168,76,.1)', stroke:'#c9a84c' },
              { title:'Admin-Only Visibility', body:'Submissions are never visible to other employees. Only authenticated administrators can access the dashboard.', color:'rgba(56,161,105,.1)', stroke:'#38a169' },
              { title:'Full Status Tracking',  body:'Every submission moves through New → In Review → Resolved, with inline updates and full filter support.', color:'rgba(66,153,225,.1)', stroke:'#4299e1' },
              { title:'Categorised Feedback',  body:'Spot patterns across departments and categories. Take systemic action before issues escalate.', color:'rgba(237,137,54,.1)', stroke:'#ed8936' },
            ].map((f) => (
              <div key={f.title} className="lp-feature" data-delay={0}>
                <div className="lp-feature-icon" style={{ background: f.color }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke={f.stroke} strokeWidth={1.8}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div><h3>{f.title}</h3><p>{f.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner-inner reveal-el">
          <h2>Ready to make your<br /><em>voice count?</em></h2>
          <p>Sign in with your BIIC account and submit your first piece of feedback in under two minutes.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="lp-cta-primary" onClick={() => navigate('/login')}>Get Started</button>
            <button className="lp-cta-secondary" onClick={() => navigate('/admin/login')}>Admin Login</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div>
          <div className="lp-logo" style={{ marginBottom:8 }}>
            <div className="lp-logo-mark" style={{ width:30, height:30, fontSize:13 }}>B</div>
            <span className="lp-logo-text" style={{ fontSize:15 }}>BIIC <span>Portal</span></span>
          </div>
          <div className="lp-footer-copy">&copy; 2025 BIIC — Internal Feedback Portal. Submissions visible to authorised admin only.</div>
        </div>
        <div className="lp-footer-links">
          <span className="lp-footer-link" onClick={() => navigate('/login')}>Submit Feedback</span>
          <span className="lp-footer-link" onClick={() => navigate('/admin/login')}>Admin</span>
        </div>
      </footer>
    </div>
  );
}
