import { useState, useEffect } from 'react';
import CVFlow from './CVFlow';
import { useI18n, LanguageSwitcher } from './i18n';
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

const ArrowRight = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// Header Component
const Header = ({ onStartCV }: { onStartCV: () => void }) => {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">H</div>
          <span className="logo-text">HackYourCV</span>
        </div>

        <nav className="nav-desktop">
          <a href="#preuve">{t('beforeAfter')}</a>
          <a href="#pour-qui">{t('forWho')}</a>
          <a href="#faq">{t('faq')}</a>
          <LanguageSwitcher />
          <button onClick={onStartCV} className="btn-primary">
            {t('optimizeCV')}
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
          <a href="#preuve" onClick={() => setMobileMenuOpen(false)}>{t('beforeAfter')}</a>
          <a href="#pour-qui" onClick={() => setMobileMenuOpen(false)}>{t('forWho')}</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>{t('faq')}</a>
          <LanguageSwitcher />
          <button onClick={onStartCV} className="btn-primary">
            {t('optimizeCV')}
          </button>
        </div>
      )}
    </header>
  );
};

// Hero CTA Component
const HeroCTA = ({ onStartCV }: { onStartCV: () => void }) => {
  const { t } = useI18n();

  return (
    <div className="hero-cta-card">
      <div className="hero-cta-content">
        <div className="hero-cta-icon">
          <Zap size={28} />
        </div>
        <h3>{t('readyToOptimize')}</h3>
        <p>{t('ctaDescription')}</p>
        <button onClick={onStartCV} className="hero-cta-button">
          {t('startNow')}
          <ArrowRight size={18} />
        </button>
        <div className="hero-cta-features">
          <span><CheckCircle size={14} /> {t('free')}</span>
          <span><CheckCircle size={14} /> {t('twoMinutes')}</span>
          <span><CheckCircle size={14} /> {t('noSignup')}</span>
        </div>
      </div>
    </div>
  );
};

// Before/After Visual Component
const BeforeAfterVisual = () => {
  const { t } = useI18n();

  return (
    <div className="before-after-container">
      <div className="before-section">
        <div className="section-header">
          <span className="section-badge">{t('whatYouWrite')}</span>
          <span className="status-badge status-rejected">
            <XCircle size={14} /> {t('ignored')}
          </span>
        </div>
        <div className="quote-block quote-before">
          <p>{t('beforeExample')}</p>
        </div>
        <div className="analysis-block">
          <p className="analysis-label">{t('atsAnalysis')}</p>
          <div className="tags">
            <span className="tag">{t('tooVague')}</span>
            <span className="tag">{t('noKeywords')}</span>
          </div>
        </div>
      </div>

      <div className="after-section">
        <div className="decorative-corner"></div>
        <div className="section-content">
          <div className="section-header">
            <span className="section-badge badge-dark">{t('hackVersion')}</span>
            <span className="status-badge status-matched">
              <CheckCircle size={14} /> {t('match')}
            </span>
          </div>
          <div className="quote-block quote-after">
            <p>
              "{t('afterExample')} (<span className="highlight-orange">{t('afterExampleTech')}</span>), {t('afterExampleResult')}"
            </p>
          </div>
          <div className="analysis-block">
            <p className="analysis-label analysis-label-orange">{t('optimizations')}</p>
            <div className="tags">
              <span className="tag tag-white"><Check size={10}/> {t('hardSkills')}</span>
              <span className="tag tag-white"><Check size={10}/> {t('kpis')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Who Is This For Component
const WhoIsThisFor = () => {
  const { t } = useI18n();

  return (
    <div className="who-grid">
      <div className="who-section">
        <h3 className="who-title">
          <span className="who-icon who-icon-green"><Check size={16} /></span>
          {t('forYouIf')}
        </h3>
        <ul className="who-list">
          <li className="who-item">
            <div className="bullet bullet-green"></div>
            {t('forYou1')}
          </li>
          <li className="who-item">
            <div className="bullet bullet-green"></div>
            {t('forYou2')}
          </li>
          <li className="who-item">
            <div className="bullet bullet-green"></div>
            {t('forYou3')}
          </li>
        </ul>
      </div>

      <div className="who-section">
        <h3 className="who-title">
          <span className="who-icon who-icon-gray"><X size={16} /></span>
          {t('notForYouIf')}
        </h3>
        <ul className="who-list who-list-muted">
          <li className="who-item">
            <div className="bullet bullet-gray"></div>
            {t('notForYou1')}
          </li>
          <li className="who-item">
            <div className="bullet bullet-gray"></div>
            {t('notForYou2')}
          </li>
          <li className="who-item">
            <div className="bullet bullet-gray"></div>
            {t('notForYou3')}
          </li>
        </ul>
      </div>
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({ questionKey, answerKey }: { questionKey: string; answerKey: string }) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={isOpen ? 'faq-text faq-text-active' : 'faq-text'}>
          {t(questionKey as any)}
        </span>
        {isOpen ? <ChevronUp size={18} className="faq-chevron-active" /> : <ChevronDown size={18} className="faq-chevron" />}
      </button>
      {isOpen && (
        <div className="faq-answer animate-fadeIn">
          {t(answerKey as any)}
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const { t } = useI18n();
  const [showCVFlow, setShowCVFlow] = useState(false);

  if (showCVFlow) {
    return <CVFlow onBack={() => setShowCVFlow(false)} />;
  }

  const startCV = () => setShowCVFlow(true);

  return (
    <div className="app">
      <div className="bg-ambience">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="content-wrapper">
        <Header onStartCV={startCV} />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-text">
                <div className="live-badge animate-fadeIn">
                  <div className="live-dot"></div>
                  <span>{t('availableNow')}</span>
                </div>

                <h1 className="hero-title">
                  {t('heroTitle')} <span className="hero-highlight">{t('heroTitleHighlight')}</span>.
                </h1>

                <p className="hero-subtitle">
                  {t('heroSubtitle')} <span className="hero-emphasis">{t('heroEmphasis')}</span>
                </p>

                <div className="hero-features">
                  <span className="feature-item">
                    <CheckCircle size={16} className="feature-icon" /> {t('atsCompatible')}
                  </span>
                </div>
              </div>

              <div className="hero-cta-wrapper">
                <div className="demo-blob"></div>
                <HeroCTA onStartCV={startCV} />
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="problem-section">
          <div className="section-container">
            <div className="problem-grid">
              <div className="problem-text">
                <h2>{t('whyGhosted')}</h2>
                <div className="problem-content">
                  <p><strong>{t('notExperience')}</strong> {t('itsSemantic')}</p>
                  <p>{t('problemExplanation')}</p>
                  <p className="problem-quote">{t('problemQuote')}</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">78%</div>
                  <div className="stat-label">{t('cvRejected')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">6s</div>
                  <div className="stat-label">{t('avgReadTime')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section id="preuve" className="proof-section">
          <div className="section-container">
            <div className="section-header-center">
              <span className="section-tag">{t('proofByExample')}</span>
              <h2>{t('keepSubstance')}</h2>
              <p>{t('comparisonBased')}</p>
            </div>

            <BeforeAfterVisual />

            <div className="policy-card">
              <div className="policy-blob"></div>
              <div className="policy-content">
                <h3>
                  <ShieldCheck size={28} className="policy-icon" />
                  {t('zeroLiePolicy')}
                </h3>
                <p>
                  {t('policyText')} <span className="policy-highlight">{t('validateEachLine')}</span>
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
              <h2>{t('isItForYou')}</h2>
              <p>{t('honestlyNot')}</p>
            </div>
            <WhoIsThisFor />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="faq-section">
          <div className="faq-container">
            <h2>{t('quickQuestions')}</h2>
            <div className="faq-list">
              <FAQItem questionKey="whatIsAts" answerKey="atsAnswer" />
              <FAQItem questionKey="doesItReplace" answerKey="replaceAnswer" />
              <FAQItem questionKey="isItFree" answerKey="freeAnswer" />
            </div>

            <div className="final-cta">
              <h2>{t('stopBeingFiltered')}</h2>
              <p>{t('optimizeNowFree')}</p>
              <button
                onClick={startCV}
                className="btn-final-cta"
              >
                {t('optimizeCV')}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-logo">
              <div className="logo-icon-small">H</div>
              <span>HackYourCV</span>
            </div>
            <p className="footer-copy">&copy; {new Date().getFullYear()} - {t('madeWithCare')}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
