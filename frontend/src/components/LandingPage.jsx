import React, { useState } from "react";
import {
  ArrowRight, CalendarDays, ClipboardCheck, HeartPulse, Menu,
  ShieldCheck, Sprout, Activity, Users, X, CheckCircle2, Leaf, ShoppingBag,
  ChevronRight
} from "lucide-react";
import AyurDharaLogo from "./AyurDharaLogo";
import "../styles/landing-page.css";


const products = [
  {
    id: "triphala",
    badge: "Bestseller",
    category: "Digestive wellness",
    name: "Triphala Churna",
    price: "₹349",
    image: "/products/triphala.jpg",
    description: "A traditional blend of three fruits, commonly included in Ayurvedic wellness routines.",
    ingredients: "Amalaki, Bibhitaki and Haritaki.",
    benefit: "Traditionally used to support digestive wellness."
  },
  {
    id: "ashwagandha",
    badge: "Daily wellness",
    category: "Stress & balance",
    name: "Ashwagandha Tablets",
    price: "₹499",
    image: "/products/ashwagandha.jpg",
    description: "An herbal supplement inspired by a long-standing ingredient in Ayurvedic traditions.",
    ingredients: "Ashwagandha root extract.",
    benefit: "Traditionally used as part of stress and vitality routines."
  },
  {
    id: "brahmi",
    badge: "Classic",
    category: "Mind & focus",
    name: "Brahmi Capsules",
    price: "₹399",
    image: "/products/brahmi.png",
    description: "A convenient capsule format featuring Brahmi, an herb used in traditional Ayurvedic practice.",
    ingredients: "Brahmi (Bacopa monnieri).",
    benefit: "Traditionally associated with memory and concentration support."
  },
  {
    id: "neem",
    badge: "Herbal care",
    category: "Skin & daily care",
    name: "Neem & Turmeric Blend",
    price: "₹299",
    image: "/products/neem-turmeric.jpg",
    description: "A botanical blend featuring two familiar ingredients in traditional personal-care routines.",
    ingredients: "Neem and turmeric.",
    benefit: "A traditional botanical addition to everyday wellness care."
  },
  {
    id: "kadha",
    badge: "Seasonal pick",
    category: "Herbal infusion",
    name: "Herbal Kadha Mix",
    price: "₹259",
    image: "/products/kadha.jpg",
    description: "A warming herbal infusion blend for a comforting daily beverage ritual.",
    ingredients: "A blend of traditional warming herbs and spices.",
    benefit: "Enjoy as part of a mindful beverage routine."
  },
  {
    id: "hair-oil",
    badge: "Traditional care",
    category: "Hair & scalp care",
    name: "Ayurvedic Hair Oil",
    price: "₹549",
    image: "/products/hair-oil.jpg",
    description: "A traditional-style hair oil for a relaxing scalp massage and hair-care ritual.",
    ingredients: "Herbal extracts infused in a nourishing oil base.",
    benefit: "Designed for external hair and scalp care."
  }
];

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
  const [selectedProduct, setSelectedProduct] = useState(null);
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
          <a href="#products" onClick={closeMenu}>Products</a>
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


      <section className="landing-products" id="products">
        <div className="landing-products-heading">
          <div>
            <div className="landing-section-label">A THOUGHTFUL SELECTION</div>
            <h2>Explore Ayurvedic <em>essentials.</em></h2>
            <p>Discover familiar herbs and traditional wellness favourites.</p>
          </div>
          <span className="landing-products-note"><Leaf size={16} /> Inspired by traditional Ayurveda</span>
        </div>

        <div className="landing-product-grid">
          {products.map(product => (
            <article className="landing-product-card" key={product.id}>
              <div className="landing-product-image-wrap">
                <img src={product.image} alt={product.name} loading="lazy" />
                <span className="landing-product-badge">{product.badge}</span>
              </div>
              <div className="landing-product-info">
                <span className="landing-product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <div className="landing-product-meta"><strong>{product.price}</strong><span>Explore details</span></div>
                <button type="button" className="landing-product-button" onClick={() => setSelectedProduct(product)}>View details <ChevronRight size={16} /></button>
              </div>
            </article>
          ))}
        </div>
        <p className="landing-products-disclaimer">Illustrative product selections for the AyurDhara landing page. Product details and prices can be updated when a catalogue is finalised.</p>
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
            [CheckCircle2, "Progress review", "Track sessions, observations and follow-up."]
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


      {selectedProduct && (
        <div className="landing-product-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="landing-product-modal" role="dialog" aria-modal="true" aria-labelledby="landing-product-modal-title">
            <button type="button" className="landing-product-modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product details"><X size={21} /></button>
            <div className="landing-product-modal-image"><img src={selectedProduct.image} alt={selectedProduct.name} /></div>
            <div className="landing-product-modal-content">
              <span className="landing-product-category">{selectedProduct.category}</span>
              <h2 id="landing-product-modal-title">{selectedProduct.name}</h2>
              <strong className="landing-product-modal-price">{selectedProduct.price}</strong>
              <p>{selectedProduct.description}</p>
              <div className="landing-product-detail"><span>Key ingredients</span><p>{selectedProduct.ingredients}</p></div>
              <div className="landing-product-detail"><span>Traditional use</span><p>{selectedProduct.benefit}</p></div>
              <div className="landing-product-modal-note"><ShieldCheck size={16} /> Product information is illustrative. Consult a qualified healthcare professional before using supplements.</div>
              <button type="button" className="landing-primary-btn" onClick={() => setSelectedProduct(null)}>Close details <X size={16} /></button>
            </div>
          </section>
        </div>
      )}

      <footer className="landing-footer">
        <AyurDharaLogo size={38} variant="dark" withText />
        <span>© {new Date().getFullYear()} AyurDhara. Panchakarma care coordination.</span>
        <button type="button" onClick={onLogin}>Patient & team login <ArrowRight size={15} /></button>
      </footer>
    </main>
  );
}
