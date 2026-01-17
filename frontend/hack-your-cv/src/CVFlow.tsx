import { useState, useCallback } from 'react';
import './CVFlow.css';

// Types
type Step = 'upload' | 'job-offer' | 'loading' | 'result';

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

// Step 1: Upload CV
const UploadStep = ({
  file,
  setFile,
  onNext
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  onNext: () => void;
}) => {
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
        alert('Seuls les fichiers PDF sont acceptes');
      }
    }
  }, [setFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Seuls les fichiers PDF sont acceptes');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">1/4</span>
        <h1>Uploade ton CV</h1>
        <p>Glisse-depose ton CV au format PDF pour commencer l'optimisation.</p>
      </div>

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
              <span className="dropzone-primary">Glisse ton CV ici</span>
              <span className="dropzone-secondary">ou clique pour parcourir</span>
            </p>
            <p className="dropzone-hint">PDF uniquement - 10 MB max</p>
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
            <button className="file-remove" onClick={removeFile} aria-label="Supprimer le fichier">
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
          Continuer
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
  onBack
}: {
  jobOffer: string;
  setJobOffer: (s: string) => void;
  jobUrl: string;
  setJobUrl: (s: string) => void;
  onNext: () => void;
  onBack: () => void;
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');

  const canProceed = inputMode === 'text' ? jobOffer.trim().length > 50 : jobUrl.trim().length > 0;

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">2/4</span>
        <h1>L'offre qui t'interesse</h1>
        <p>Colle le texte de l'annonce ou son URL pour qu'on adapte ton CV.</p>
      </div>

      <div className="input-mode-toggle">
        <button
          className={`mode-btn ${inputMode === 'text' ? 'mode-btn-active' : ''}`}
          onClick={() => setInputMode('text')}
        >
          <FileText size={18} />
          Texte de l'annonce
        </button>
        <button
          className={`mode-btn ${inputMode === 'url' ? 'mode-btn-active' : ''}`}
          onClick={() => setInputMode('url')}
        >
          <Link size={18} />
          URL de l'annonce
        </button>
      </div>

      {inputMode === 'text' ? (
        <div className="textarea-container">
          <textarea
            value={jobOffer}
            onChange={(e) => setJobOffer(e.target.value)}
            placeholder="Colle ici le texte complet de l'offre d'emploi...

Exemple:
- Titre du poste
- Description du poste
- Competences requises
- etc."
            className="job-textarea"
          />
          <div className="textarea-footer">
            <span className={jobOffer.length < 50 ? 'char-count-warning' : 'char-count'}>
              {jobOffer.length} caracteres {jobOffer.length < 50 && '(min 50)'}
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
            Supporte: LinkedIn, Indeed, Welcome to the Jungle, etc.
          </p>
        </div>
      )}

      <div className="step-actions step-actions-split">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          Retour
        </button>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!canProceed}
        >
          Generer mon CV
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Step 3: Loading
const LoadingStep = () => {
  const steps = [
    { label: 'Analyse de ton CV', done: true },
    { label: 'Extraction des mots-cles de l\'offre', done: true },
    { label: 'Optimisation ATS en cours', done: false },
    { label: 'Generation du nouveau CV', done: false },
  ];

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
        <h1>Generation en cours...</h1>
        <p>Notre IA analyse ton CV et l'adapte aux exigences de l'offre.</p>

        <div className="loading-steps">
          {steps.map((step, index) => (
            <div key={index} className={`loading-step ${step.done ? 'loading-step-done' : ''}`}>
              <div className="loading-step-icon">
                {step.done ? <Check size={14} /> : <div className="loading-step-dot"></div>}
              </div>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="loading-disclaimer">
        Cela prend generalement moins de 30 secondes.
      </p>
    </div>
  );
};

// Step 4: Result
const ResultStep = ({
  onBack,
  onRestart
}: {
  onBack: () => void;
  onRestart: () => void;
}) => {
  const handleDownload = () => {
    // TODO: Implement actual download from backend
    alert('Telechargement du CV optimise (a implementer avec le backend)');
  };

  return (
    <div className="step-container result-container">
      <div className="result-success">
        <div className="success-icon">
          <Check size={32} />
        </div>
        <h1>Ton CV est pret !</h1>
        <p>Ton CV a ete optimise pour matcher les exigences de l'offre.</p>
      </div>

      <div className="result-preview">
        <div className="preview-header">
          <FileText size={24} />
          <div>
            <p className="preview-title">CV_Optimise.pdf</p>
            <p className="preview-subtitle">Optimise pour le poste cible</p>
          </div>
        </div>

        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-value-green">+45%</span>
            <span className="stat-label">Match ATS</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12</span>
            <span className="stat-label">Mots-cles ajoutes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">3</span>
            <span className="stat-label">Sections ameliorees</span>
          </div>
        </div>

        <button className="btn-download" onClick={handleDownload}>
          <Download size={20} />
          Telecharger mon CV (PDF)
        </button>
      </div>

      <div className="result-actions">
        <button className="btn-secondary" onClick={onRestart}>
          Optimiser un autre CV
        </button>
      </div>
    </div>
  );
};

// Main CVFlow Component
export default function CVFlow({ onBack }: CVFlowProps) {
  const [step, setStep] = useState<Step>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobOffer, setJobOffer] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const goToJobOffer = () => setStep('job-offer');
  const goToUpload = () => setStep('upload');

  const startGeneration = () => {
    setStep('loading');
    // Simulate API call
    setTimeout(() => {
      setStep('result');
    }, 4000);
  };

  const restart = () => {
    setCvFile(null);
    setJobOffer('');
    setJobUrl('');
    setStep('upload');
  };

  return (
    <div className="cv-flow">
      <header className="cv-flow-header">
        <button className="back-to-home" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <div className="cv-flow-logo">
          <div className="logo-icon">H.</div>
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
          />
        )}
        {step === 'job-offer' && (
          <JobOfferStep
            jobOffer={jobOffer}
            setJobOffer={setJobOffer}
            jobUrl={jobUrl}
            setJobUrl={setJobUrl}
            onNext={startGeneration}
            onBack={goToUpload}
          />
        )}
        {step === 'loading' && <LoadingStep />}
        {step === 'result' && (
          <ResultStep
            onBack={goToJobOffer}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}
