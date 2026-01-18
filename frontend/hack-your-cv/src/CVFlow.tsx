import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './CVFlow.css';
import { useI18n } from './i18n';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Types
type Step = 'upload' | 'job-offer' | 'loading' | 'preview' | 'result';

interface CVStats {
  keywordsMatched: string[];
  keywordsCount: number;
  sectionsOptimized: number;
  jobTitle: string | null;
  jobCompany: string | null;
}

interface CVFlowProps {
  onBack: () => void;
}

// Icons
const Upload = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FileText = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const Link = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const ArrowLeft = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ArrowRight = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Download = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const Check = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const X = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ZoomIn = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const ZoomOut = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const Edit = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// Step 1: Upload CV
const UploadStep = ({
  file,
  setFile,
  onNext,
  error
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  onNext: () => void;
  error?: string | null;
}) => {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert(t('pdfOnlyAlert'));
      }
    }
  }, [setFile, t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert(t('pdfOnlyAlert'));
      }
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">{t('step1of5')}</span>
        <h1>{t('uploadYourCV')}</h1>
        <p>{t('dragDropCV')}</p>
      </div>

      {error && (
        <div className="error-banner error-banner-mismatch">
          <X size={18} />
          <div className="error-content">
            {error.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div
        className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${file ? 'dropzone-has-file' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="dropzone-icon">
              <Upload size={48} />
            </div>
            <p className="dropzone-text">
              <span className="dropzone-primary">{t('dragHere')}</span>
              <span className="dropzone-secondary">{t('orClickBrowse')}</span>
            </p>
            <p className="dropzone-hint">{t('pdfOnly')}</p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="dropzone-input"
            />
          </>
        ) : (
          <div className="file-preview">
            <div className="file-icon">
              <FileText size={32} />
            </div>
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button className="file-remove" onClick={removeFile} aria-label={t('deleteFile')}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!file}
        >
          {t('continue')}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Step 2: Job Offer Input
const JobOfferStep = ({
  jobOffer,
  setJobOffer,
  jobUrl,
  setJobUrl,
  onNext,
  onBack,
  error
}: {
  jobOffer: string;
  setJobOffer: (s: string) => void;
  jobUrl: string;
  setJobUrl: (s: string) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string | null;
}) => {
  const { t } = useI18n();
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');

  const canProceed = inputMode === 'text' ? jobOffer.trim().length > 50 : jobUrl.trim().length > 0;

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">{t('step2of5')}</span>
        <h1>{t('jobInterest')}</h1>
        <p>{t('pasteJobText')}</p>
      </div>

      {error && (
        <div className="error-banner">
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="input-mode-toggle">
        <button
          className={`mode-btn ${inputMode === 'text' ? 'mode-btn-active' : ''}`}
          onClick={() => setInputMode('text')}
        >
          <FileText size={18} />
          {t('jobText')}
        </button>
        <button
          className={`mode-btn ${inputMode === 'url' ? 'mode-btn-active' : ''}`}
          onClick={() => setInputMode('url')}
        >
          <Link size={18} />
          {t('jobUrl')}
        </button>
      </div>

      {inputMode === 'text' ? (
        <div className="textarea-container">
          <textarea
            value={jobOffer}
            onChange={(e) => setJobOffer(e.target.value)}
            placeholder={`${t('pasteHere')}

${t('example')}
- ${t('jobTitle')}
- ${t('jobDesc')}
- ${t('requiredSkills')}
- ${t('etc')}`}
            className="job-textarea"
          />
          <div className="textarea-footer">
            <span className={jobOffer.length < 50 ? 'char-count-warning' : 'char-count'}>
              {jobOffer.length} {t('characters')} {jobOffer.length < 50 && t('min50')}
            </span>
          </div>
        </div>
      ) : (
        <div className="url-container">
          <div className="url-input-wrapper">
            <Link size={20} />
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="url-input"
            />
          </div>
          <p className="url-hint">
            {t('supports')}
          </p>
        </div>
      )}

      <div className="step-actions step-actions-split">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          {t('back')}
        </button>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!canProceed}
        >
          {t('generateCV')}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Step 3: Loading
const LoadingStep = () => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    t('step1Loading'),
    t('step2Loading'),
    t('step3Loading'),
    t('step4Loading'),
    t('step5Loading'),
  ];

  // Progression calibrée sur les vrais temps mesurés du backend (avec gpt-4o):
  // - Scraping + lecture profil: ~15-25s (variable)
  // - Extraction mots-clés (regex): instantané
  // - Optimisation CV (IA gpt-4o): ~8s
  // - Validation Guardian (IA gpt-4o): ~4s
  // - Génération PDF: instantané
  // Total typique: ~30-40s
  // Chaque étape dure au moins 1.5s pour une meilleure UX
  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 3000),    // 3s -> Analyse mots-clés
      setTimeout(() => setCurrentStep(2), 5000),    // 5s -> Optimisation (2s sur étape 2)
      setTimeout(() => setCurrentStep(3), 18000),   // 18s -> Vérification (13s sur étape 3)
      setTimeout(() => setCurrentStep(4), 24000),   // 24s -> Mise en page (6s sur étape 4)
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="step-container loading-container">
      <div className="loading-visual">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>

      <div className="loading-content">
        <h1>{t('generatingCV')}</h1>
        <p>{t('aiAnalyzing')}</p>

        <div className="loading-steps">
          {steps.map((label, index) => (
            <div
              key={index}
              className={`loading-step ${index < currentStep ? 'loading-step-done' : ''} ${index === currentStep ? 'loading-step-active' : ''}`}
            >
              <div className="loading-step-icon">
                {index < currentStep ? <Check size={14} /> : <div className="loading-step-dot"></div>}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="loading-disclaimer">
        {t('usuallyTakes')}
      </p>
    </div>
  );
};

// Step 4: Preview & Validate
const PreviewStep = ({
  pdfUrl,
  onValidate,
  onBack
}: {
  pdfUrl: string | null;
  onValidate: () => void;
  onBack: () => void;
}) => {
  const { t } = useI18n();
  const [numPages, setNumPages] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState(2); // Index in zoom levels array

  const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const scale = zoomLevels[zoomLevel];

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, zoomLevels.length - 1));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="step-container preview-container">
      <div className="step-header">
        <span className="step-number">{t('step4of5')}</span>
        <h1>{t('validateCV')}</h1>
        <p>{t('checkEachLine')}</p>
      </div>

      <div className="pdf-viewer">
        <div className="pdf-toolbar">
          <div className="pdf-nav">
            <span className="pdf-page-info">
              {numPages} {numPages > 1 ? t('pages') : t('page')}
            </span>
          </div>
          <div className="pdf-zoom">
            <button
              className="pdf-btn"
              onClick={zoomOut}
              disabled={zoomLevel <= 0}
              aria-label="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <span className="pdf-zoom-level">{Math.round(scale * 100)}%</span>
            <button
              className="pdf-btn"
              onClick={zoomIn}
              disabled={zoomLevel >= zoomLevels.length - 1}
              aria-label="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>

        <div className="pdf-document-wrapper pdf-continuous-scroll">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="pdf-loading">
                  <div className="pdf-loading-spinner"></div>
                  <p>{t('loadingPdf')}</p>
                </div>
              }
              error={
                <div className="pdf-error">
                  <p>{t('pdfError')}</p>
                </div>
              }
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div key={`page_${index + 1}`} className="pdf-page-container">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                  {index < numPages - 1 && <div className="pdf-page-separator" />}
                </div>
              ))}
            </Document>
          ) : (
            <div className="pdf-placeholder">
              <FileText size={48} />
              <p>{t('previewUnavailable')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="preview-info">
        <div className="preview-tip">
          <Edit size={16} />
          <span>{t('problemGoBack')}</span>
        </div>
      </div>

      <div className="step-actions step-actions-split">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          {t('modify')}
        </button>
        <button className="btn-validate" onClick={onValidate}>
          <Check size={18} />
          {t('validateDownload')}
        </button>
      </div>
    </div>
  );
};

// Step 5: Result
const ResultStep = ({
  pdfUrl,
  stats,
  onBack,
  onRestart
}: {
  pdfUrl: string | null;
  stats: CVStats | null;
  onBack: () => void;
  onRestart: () => void;
}) => {
  const { t } = useI18n();

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'CV_Optimise.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="step-container result-container">
      <div className="result-success">
        <div className="success-icon">
          <Check size={32} />
        </div>
        <h1>{t('cvReady')}</h1>
        <p>
          {stats?.jobTitle && stats?.jobCompany
            ? `${t('cvOptimizedFor')} "${stats.jobTitle}" ${t('at')} ${stats.jobCompany}.`
            : t('cvOptimizedGeneral')}
        </p>
      </div>

      <div className="result-preview">
        <div className="preview-header">
          <FileText size={24} />
          <div>
            <p className="preview-title">CV_Optimise.pdf</p>
            <p className="preview-subtitle">{t('validatedReady')}</p>
          </div>
        </div>

        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-value">{stats?.keywordsCount || 0}</span>
            <span className="stat-label">{t('keywordsMatched')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats?.sectionsOptimized || 0}</span>
            <span className="stat-label">{t('sectionsOptimized')}</span>
          </div>
        </div>

        {stats?.keywordsMatched && stats.keywordsMatched.length > 0 && (
          <div className="keywords-list">
            <p className="keywords-title">{t('skillsIdentified')}</p>
            <div className="keywords-tags">
              {stats.keywordsMatched.slice(0, 8).map((keyword, i) => (
                <span key={i} className="keyword-tag">{keyword}</span>
              ))}
              {stats.keywordsMatched.length > 8 && (
                <span className="keyword-tag keyword-more">+{stats.keywordsMatched.length - 8}</span>
              )}
            </div>
          </div>
        )}

        <button className="btn-download" onClick={handleDownload} disabled={!pdfUrl}>
          <Download size={20} />
          {t('downloadPdf')}
        </button>
      </div>

      <div className="result-actions">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          {t('reviewCV')}
        </button>
        <button className="btn-secondary" onClick={onRestart}>
          {t('optimizeAnother')}
        </button>
      </div>
    </div>
  );
};

// API URL - en dev on utilise localhost, en prod l'URL du backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Main CVFlow Component
export default function CVFlow({ onBack }: CVFlowProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobOffer, setJobOffer] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CVStats | null>(null);

  const goToJobOffer = () => {
    setError(null);
    setStep('job-offer');
  };
  const goToUpload = () => setStep('upload');

  const startGeneration = async () => {
    if (!cvFile) return;

    setStep('loading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      if (jobUrl && jobUrl.trim()) {
        formData.append('jobUrl', jobUrl.trim());
      } else if (jobOffer && jobOffer.trim()) {
        formData.append('jobDescription', jobOffer.trim());
      }

      const response = await fetch(`${API_URL}/api/cv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t('errorUnknown') }));

        // Handle CV/Job mismatch - redirect to upload with clear message
        if (errorData.error === 'CV_JOB_MISMATCH') {
          setError(errorData.message + (errorData.suggestion ? '\n\n' + errorData.suggestion : ''));
          setStep('upload');
          return;
        }

        throw new Error(errorData.message || errorData.error || `Error ${response.status}`);
      }

      // Parse JSON response with stats and base64 PDF
      const data = await response.json();

      // Convert base64 to blob URL
      const pdfBytes = atob(data.pdf.base64);
      const pdfArray = new Uint8Array(pdfBytes.length);
      for (let i = 0; i < pdfBytes.length; i++) {
        pdfArray[i] = pdfBytes.charCodeAt(i);
      }
      const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setGeneratedPdfUrl(pdfUrl);
      setStats(data.stats);
      setStep('preview');

    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('errorBackendDown')
      );
      setStep('job-offer');
    }
  };

  const goToPreview = () => setStep('preview');

  const validateAndDownload = () => {
    setStep('result');
  };

  const restart = () => {
    // Clean up blob URL
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
    }
    setCvFile(null);
    setJobOffer('');
    setJobUrl('');
    setGeneratedPdfUrl(null);
    setStep('upload');
  };

  return (
    <div className="cv-flow">
      <header className="cv-flow-header">
        <button className="back-to-home" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </button>
        <div className="cv-flow-logo">
          <div className="logo-icon">H</div>
          <span>HackYourCV</span>
        </div>
        <div className="header-spacer"></div>
      </header>

      <main className="cv-flow-main">
        {step === 'upload' && (
          <UploadStep
            file={cvFile}
            setFile={setCvFile}
            onNext={goToJobOffer}
            error={error}
          />
        )}
        {step === 'job-offer' && (
          <JobOfferStep
            jobOffer={jobOffer}
            setJobOffer={setJobOffer}
            jobUrl={jobUrl}
            setJobUrl={setJobUrl}
            onNext={startGeneration}
            error={error}
            onBack={goToUpload}
          />
        )}
        {step === 'loading' && <LoadingStep />}
        {step === 'preview' && (
          <PreviewStep
            pdfUrl={generatedPdfUrl}
            onValidate={validateAndDownload}
            onBack={goToJobOffer}
          />
        )}
        {step === 'result' && (
          <ResultStep
            pdfUrl={generatedPdfUrl}
            stats={stats}
            onBack={goToPreview}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}
