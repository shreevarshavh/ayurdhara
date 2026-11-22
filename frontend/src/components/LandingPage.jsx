import React, { useState } from "react";
import {
  ArrowRight, CalendarDays, ClipboardCheck, HeartPulse, Menu,
  ShieldCheck, Sprout, Activity, Users, X, CheckCircle2
} from "lucide-react";
import AyurDharaLogo from "./AyurDharaLogo";
import "../styles/landing-page.css";

const features = [
  {
    icon: CalendarDays,
    title: "Intelligent therapy scheduling",
    text: "Coordinate treatment duration, therapist availability and room requirements in one clear schedule."
  },
  {
    icon: ClipboardCheck,
    title: "Patient care records",
    text: "Keep patient details, assessments, prescribed therapies and clinical notes organised."
  },
  {
    icon: Activity,
    title: "Treatment progress tracking",
    text: "Follow completed sessions, record symptoms and review progress throughout the care journey."
  },
  {
    icon: HeartPulse,
    title: "Care and safety monitoring",
    text: "Record therapy observations and help authorised staff stay informed about patient concerns."
  }
];

export default function LandingPage({ onLogin, onSignUp }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="#home" aria-label="AyurDhara home" onClick={closeMenu}>
          <AyurDharaLogo size={46} variant="dark" withText />
        </a>

        <button
          className="landing-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen(value => !value)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={`landing-nav ${menuOpen ? "is-open" : ""}`}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#journey" onClick={closeMenu}>How it works</a>
          <button className="landing-login-link" type="button" onClick={() => { closeMenu(); onLogin(); }}>Log in</button>
          <button className="landing-nav-cta" type="button" onClick={() => { closeMenu(); onSignUp(); }}>Get started <ArrowRight size={16} /></button>
        </nav>
      </header>

      <section className="landing-hero" id="home">
        <div className="landing-hero-image" aria-hidden="true" />
        <div className="landing-hero-content">
          <span className="landing-kicker"><span /> A MORE CONNECTED WAY TO CARE</span>
          <h1>Traditional healing.<br /><em>Thoughtfully</em> coordinated.</h1>
          <p className="landing-hero-copy">
            Bringing the many details of Panchakarma care together — from patient assessment and therapy planning to scheduling and progress tracking.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-primary-btn" type="button" onClick={onSignUp}>Begin your journey <ArrowRight size={18} /></button>
            <button className="landing-secondary-btn" type="button" onClick={onLogin}>Log in to AyurDhara</button>
          </div>
          <div className="landing-trust-line"><ShieldCheck size={17} /> A coordinated workspace for patients and care teams</div>
        </div>
        <div className="landing-hero-note"><Sprout size={18} /> Rooted in holistic care</div>
      </section>

      <section className="landing-intro" id="about">
        <div className="landing-section-label">THE AYURDHARA APPROACH</div>
        <div className="landing-intro-grid">
          <h2>Care is a journey.<br /><em>Every detail matters.</em></h2>
          <div>
            <p>AyurDhara is a digital care coordination platform designed around the workflows of Panchakarma therapy. It helps bring patient information, practitioner decisions, therapy schedules and treatment updates into one organised space.</p>
            <p>By making everyday coordination clearer, AyurDhara supports care teams in keeping the patient journey structured, visible and easier to follow.</p>
            <button className="landing-text-link" type="button" onClick={onSignUp}>Explore AyurDhara <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <div className="landing-section-label">ONE CONNECTED CARE WORKSPACE</div>
          <h2>Designed around <em>your care journey.</em></h2>
          <p>Purposeful tools to support the people and processes involved in Panchakarma care.</p>
        </div>
        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, text }, index) => (
            <article className="landing-feature-card" key={title}>
              <div className="landing-feature-top"><span>0{index + 1}</span><Icon size={25} strokeWidth={1.6} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="landing-feature-rule" />
            </article>
          ))}
        </div>
      </section>

      <section className="landing-journey" id="journey">
        <div className="landing-journey-copy">
          <div className="landing-section-label">A CLEARER FLOW OF CARE</div>
          <h2>From first assessment<br />to <em>ongoing progress.</em></h2>
          <p>Keep each stage of the care process connected, while the practitioner remains at the centre of clinical decisions.</p>
          <button className="landing-primary-btn" type="button" onClick={onSignUp}>Get started <ArrowRight size={18} /></button>
        </div>
        <div className="landing-steps">
          {[
            [Users, "Patient profile", "Capture essential patient details and care information."],
            [ClipboardCheck, "Assessment & plan", "Document assessments and practitioner-prescribed therapies."],
            [CalendarDays, "Therapy scheduling", "Coordinate sessions with available care resources."],
            [CheckCircle2, "Progress review", "Track sessions, observations and follow-up." ]
          ].map(([Icon, title, text], index) => (
            <div className="landing-step" key={title}>
              <div className="landing-step-icon"><Icon size={20} /></div>
              <div><span>STEP 0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-mark"><Sprout size={28} /></div>
        <div><span>YOUR CARE JOURNEY, IN ONE PLACE</span><h2>Bring clarity to every step.</h2><p>Discover a more organised way to coordinate Panchakarma care.</p></div>
        <button className="landing-cta-button" type="button" onClick={onSignUp}>Create an account <ArrowRight size={18} /></button>
      </section>

      <footer className="landing-footer">
        <AyurDharaLogo size={38} variant="dark" withText />
        <span>© {new Date().getFullYear()} AyurDhara. Panchakarma care coordination.</span>
        <button type="button" onClick={onLogin}>Patient & team login <ArrowRight size={15} /></button>
      </footer>
    </main>
  );
}
