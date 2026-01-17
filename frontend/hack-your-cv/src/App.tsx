import { useState, useEffect } from 'react';
import { joinWaitlist, getWaitlistCount } from './api';
import './App.css';

// Icons as simple SVG components
const CheckCircle = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircle = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const Check = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const X = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const Menu = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const Zap = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ShieldCheck = ({ size = 12, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/>
  </svg>
);

const ChevronDown = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ChevronUp = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

// Header Component
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">H.</div>
          <span className="logo-text">HackYourCV</span>
        </div>

        <nav className="nav-desktop">
          <a href="#preuve">Avant / Apres</a>
          <a href="#pour-qui">Pour qui ?</a>
          <a href="#faq">FAQ</a>
          <button onClick={scrollToWaitlist} className="btn-primary">
            Rejoindre la waitlist
          </button>
        </nav>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu principal"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav">
          <a href="#preuve" onClick={() => setMobileMenuOpen(false)}>Avant / Apres</a>
          <a href="#pour-qui" onClick={() => setMobileMenuOpen(false)}>Pour qui ?</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <button onClick={scrollToWaitlist} className="btn-primary">
            Rejoindre la waitlist
          </button>
        </div>
      )}
    </header>
  );
};

// Waitlist Component
const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    getWaitlistCount()
      .then(data => setWaitlistCount(data.count))
      .catch(() => setWaitlistCount(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await joinWaitlist(email);
      setPosition(result.position);
      setStatus('success');
      // Refresh count after successful signup
      getWaitlistCount()
        .then(data => setWaitlistCount(data.count))
        .catch(() => {});
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (status === 'success') {
    return (
      <div id="waitlist" className="waitlist-card">
        <div className="waitlist-success">
          <div className="success-check">
            <Check size={28} />
          </div>
          <h3>Place reservee !</h3>
          {position && (
            <p className="success-position">
              Tu es <strong>#{position}</strong> sur la liste
            </p>
          )}
          <p className="success-text">
            On te contacte des l'ouverture de la beta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="waitlist" className="waitlist-card">
      <div className="waitlist-header">
        <Zap size={20} className="waitlist-zap" />
        <h3>Rejoins la Beta</h3>
      </div>

      <p className="waitlist-desc">
        Acces gratuit pour les premiers inscrits.
      </p>

      <form onSubmit={handleSubmit} className="waitlist-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          required
          disabled={status === 'loading'}
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Envoi...' : "S'inscrire"}
        </button>
      </form>

      {status === 'error' && (
        <p className="waitlist-error">{errorMessage}</p>
      )}

      {waitlistCount !== null && waitlistCount > 0 && (
        <p className="waitlist-counter">
          <ShieldCheck size={12} />
          <span>{waitlistCount} inscrits</span>
        </p>
      )}
    </div>
  );
};

// Before/After Visual Component
const BeforeAfterVisual = () => {
  return (
    <div className="before-after-container">
      <div className="before-section">
        <div className="section-header">
          <span className="section-badge">Ce que tu ecris</span>
          <span className="status-badge status-rejected">
            <XCircle size={14} /> Ignore
          </span>
        </div>
        <div className="quote-block quote-before">
          <p>"J'ai gere le projet de refonte du site web de l'entreprise."</p>
        </div>
        <div className="analysis-block">
          <p className="analysis-label">Analyse ATS</p>
          <div className="tags">
            <span className="tag">Trop vague</span>
            <span className="tag">Aucun mot-cle technique</span>
          </div>
        </div>
      </div>

      <div className="after-section">
        <div className="decorative-corner"></div>
        <div className="section-content">
          <div className="section-header">
            <span className="section-badge badge-dark">Version HackYourCV</span>
            <span className="status-badge status-matched">
              <CheckCircle size={14} /> Match 98%
            </span>
          </div>
          <div className="quote-block quote-after">
            <p>
              "Pilote la refonte e-commerce (<span className="highlight-orange">React</span>, <span className="highlight-orange">Node.js</span>), augmentant le <span className="highlight-green">taux de conversion</span> de 15% en 3 mois."
            </p>
          </div>
          <div className="analysis-block">
            <p className="analysis-label analysis-label-orange">Optimisations</p>
            <div className="tags">
              <span className="tag tag-white"><Check size={10}/> Hard Skills</span>
              <span className="tag tag-white"><Check size={10}/> KPIs chiffres</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Who Is This For Component
const WhoIsThisFor = () => (
  <div className="who-grid">
    <div className="who-section">
      <h3 className="who-title">
        <span className="who-icon who-icon-green"><Check size={16} /></span>
        C'est pour toi si...
      </h3>
      <ul className="who-list">
        <li className="who-item">
          <div className="bullet bullet-green"></div>
          Tu postules a des offres avec &gt;100 candidats (grands groupes, scale-ups) ou le tri est automatique.
        </li>
        <li className="who-item">
          <div className="bullet bullet-green"></div>
          Tu veux adapter ton CV a chaque offre en 2 minutes chrono, pas en 2 heures.
        </li>
        <li className="who-item">
          <div className="bullet bullet-green"></div>
          Tu as l'experience, mais tu ne sais pas "te vendre" avec les mots-cles exacts.
        </li>
      </ul>
    </div>

    <div className="who-section">
      <h3 className="who-title">
        <span className="who-icon who-icon-gray"><X size={16} /></span>
        Pas pour toi si...
      </h3>
      <ul className="who-list who-list-muted">
        <li className="who-item">
          <div className="bullet bullet-gray"></div>
          Tu cherches a inventer des competences que tu n'as pas (notre IA refuse de mentir).
        </li>
        <li className="who-item">
          <div className="bullet bullet-gray"></div>
          Tu postules pour des jobs 100% creatifs (Design, Art) ou le portfolio visuel prime.
        </li>
        <li className="who-item">
          <div className="bullet bullet-gray"></div>
          Tu penses qu'un beau design Canva suffit pour impressionner un algorithme.
        </li>
      </ul>
    </div>
  </div>
);

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={isOpen ? 'faq-text faq-text-active' : 'faq-text'}>{question}</span>
        {isOpen ? <ChevronUp size={18} className="faq-chevron-active" /> : <ChevronDown size={18} className="faq-chevron" />}
      </button>
      {isOpen && (
        <div className="faq-answer animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="app">
      <div className="bg-ambience">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="content-wrapper">
        <Header />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-text">
                <div className="beta-badge animate-fadeIn">
                  <div className="beta-dot"></div>
                  <span>Beta live ce week-end</span>
                </div>

                <h1 className="hero-title">
                  Ton CV doit matcher en <span className="hero-highlight">2 minutes</span>.
                </h1>

                <p className="hero-subtitle">
                  Colle une offre. On detecte les mots-cles manquants, puis on reecrit tes experiences en langage ATS. <span className="hero-emphasis">Zero bullshit, zero invention.</span>
                </p>

                <div className="hero-features">
                  <span className="feature-item">
                    <CheckCircle size={16} className="feature-icon" /> Compatible 100% ATS
                  </span>
                </div>
              </div>

              <div className="hero-waitlist-wrapper">
                <div className="demo-blob"></div>
                <WaitlistForm />
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="problem-section">
          <div className="section-container">
            <div className="problem-grid">
              <div className="problem-text">
                <h2>Pourquoi tu te fais ghoster ?</h2>
                <div className="problem-content">
                  <p><strong>Ce n'est pas ton experience le probleme.</strong> C'est la semantique.</p>
                  <p>Les recruteurs utilisent des filtres automatiques. Si ton CV dit "Gere une equipe" et que l'offre demande "Leadership Agile", tu disparais du classement.</p>
                  <p className="problem-quote">Notre job : traduire ton experience reelle dans le dialecte exact du recruteur.</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">78%</div>
                  <div className="stat-label">Des CV rejetes par robots</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">6s</div>
                  <div className="stat-label">Temps de lecture moyen</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section id="preuve" className="proof-section">
          <div className="section-container">
            <div className="section-header-center">
              <span className="section-tag">Preuve par l'exemple</span>
              <h2>On garde le fond, on change l'impact.</h2>
              <p>Comparaison basee sur une analyse reelle d'un profil Product Manager.</p>
            </div>

            <BeforeAfterVisual />

            <div className="policy-card">
              <div className="policy-blob"></div>
              <div className="policy-content">
                <h3>
                  <ShieldCheck size={28} className="policy-icon" />
                  Politique "Zero mensonge"
                </h3>
                <p>
                  Notre IA est bridee pour ne jamais inventer. Elle reformule, reordonne et traduit, mais ne cree pas d'experience ex-nihilo. <span className="policy-highlight">Tu valides chaque ligne avant l'export final.</span>
                </p>
              </div>
              <div className="policy-code">
                <div className="code-line code-removed">
                  <span className="code-symbol">-</span> "Expert AI tools"
                </div>
                <div className="code-line code-added">
                  <span className="code-symbol">+</span> "Familiar with LLM prompting"
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Who Section */}
        <section id="pour-qui" className="for-who-section">
          <div className="section-container-narrow">
            <div className="section-header-center">
              <h2>Est-ce que c'est pour toi ?</h2>
              <p>Soyons honnetes, HackYourCV ne sert pas a tout le monde.</p>
            </div>
            <WhoIsThisFor />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="faq-section">
          <div className="faq-container">
            <h2>Questions rapides</h2>
            <div className="faq-list">
              <FAQItem
                question="C'est quoi un ATS ?"
                answer="C'est le logiciel qui lit ton CV avant l'humain. S'il ne trouve pas les mots exacts de l'offre, tu passes a la trappe."
              />
              <FAQItem
                question="Est-ce que ca remplace mon CV actuel ?"
                answer="Non, ca cree une version 'ciblee' pour une offre specifique. Tu gardes ton CV maitre, nous generons les variantes."
              />
              <FAQItem
                question="C'est gratuit ?"
                answer="L'acces Beta sera gratuit pour ton premier CV optimise. Inscris-toi pour recevoir ton invitation."
              />
            </div>

            <div className="final-cta">
              <h2>Arrete de te faire filtrer.</h2>
              <p>Rejoins la liste d'attente. Premier arrive, premier servi.</p>
              <button
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-final-cta"
              >
                Rejoindre la waitlist
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-logo">
              <div className="logo-icon-small">H.</div>
              <span>HackYourCV</span>
            </div>
            <p className="footer-copy">&copy; {new Date().getFullYear()} - Fait avec soin pour les candidats ignores.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
