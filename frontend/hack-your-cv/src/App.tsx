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

const Globe = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ChatGPTLogo = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

const Terminal = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
  </svg>
);

const ExternalLink = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
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

// ChatGPT Setup Modal Component
const ChatGPTModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useI18n();
  const mcpUrl = 'https://hackathon-jan-2026-backend.onrender.com/mcp';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chatgpt-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <ChatGPTLogo size={32} />
          <h2>{t('chatGptModalTitle')}</h2>
          <span className="modal-requirement">{t('chatGptModalRequirement')}</span>
        </div>

        <div className="modal-steps">
          <div className="modal-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>{t('chatGptModalStep1')}</h3>
              <p>{t('chatGptModalStep1Desc')}</p>
            </div>
          </div>

          <div className="modal-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>{t('chatGptModalStep2')}</h3>
              <p>{t('chatGptModalStep2Desc')}</p>
            </div>
          </div>

          <div className="modal-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>{t('chatGptModalStep3')}</h3>
              <p>{t('chatGptModalStep3Desc')}</p>
              <div className="config-preview">
                <div className="config-field">
                  <span className="config-label">{t('chatGptModalName')}</span>
                  <code>HackYourCV</code>
                </div>
                <div className="config-field">
                  <span className="config-label">{t('chatGptModalUrl')}</span>
                  <code className="config-url">{mcpUrl}</code>
                </div>
                <div className="config-field">
                  <span className="config-label">{t('chatGptModalAuth')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <img src="/chatgpt-setup.png" alt="ChatGPT MCP Setup" className="modal-screenshot" />

        <div className="modal-actions">
          <a
            href="https://chatgpt.com/#settings/Connectors"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary modal-btn"
          >
            {t('chatGptModalOpenSettings')}
            <ExternalLink size={16} />
          </a>
          <button className="btn-secondary modal-btn" onClick={onClose}>
            {t('chatGptModalClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Integrations Component
const IntegrationsSection = ({ onStartCV, onOpenChatGPTModal }: { onStartCV: () => void; onOpenChatGPTModal: () => void }) => {
  const { t } = useI18n();

  const integrations = [
    {
      icon: <Globe size={28} />,
      title: t('webAppTitle'),
      description: t('webAppDesc'),
      cta: t('webAppCta'),
      onClick: onStartCV,
      isExternal: false,
      color: 'integration-web'
    },
    {
      icon: <ChatGPTLogo size={28} />,
      title: t('chatGptTitle'),
      description: t('chatGptDesc'),
      cta: t('chatGptCta'),
      onClick: onOpenChatGPTModal,
      isExternal: false,
      color: 'integration-gpt'
    },
    {
      icon: <Terminal size={28} />,
      title: t('mcpTitle'),
      description: t('mcpDesc'),
      cta: t('mcpCta'),
      href: 'https://github.com/R0-main/Hackathon-Jan-2026#mcp-server',
      isExternal: true,
      color: 'integration-mcp'
    }
  ];

  return (
    <section id="integrations" className="integrations-section">
      <div className="section-container">
        <div className="section-header-center">
          <h2>{t('integrationsTitle')}</h2>
          <p>{t('integrationsSubtitle')}</p>
        </div>

        <div className="integrations-grid">
          {integrations.map((integration, index) => (
            <div key={index} className={`integration-card ${integration.color}`}>
              <div className="integration-icon">
                {integration.icon}
              </div>
              <h3>{integration.title}</h3>
              <p>{integration.description}</p>
              {integration.isExternal ? (
                <a
                  href={integration.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="integration-cta"
                >
                  {integration.cta}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <button onClick={integration.onClick} className="integration-cta">
                  {integration.cta}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
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
  const [showChatGPTModal, setShowChatGPTModal] = useState(false);

  if (showCVFlow) {
    return <CVFlow onBack={() => setShowCVFlow(false)} />;
  }

  const startCV = () => setShowCVFlow(true);
  const openChatGPTModal = () => setShowChatGPTModal(true);
  const closeChatGPTModal = () => setShowChatGPTModal(false);

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

        {/* Integrations Section */}
        <IntegrationsSection onStartCV={startCV} onOpenChatGPTModal={openChatGPTModal} />

        {/* ChatGPT Setup Modal */}
        <ChatGPTModal isOpen={showChatGPTModal} onClose={closeChatGPTModal} />

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
