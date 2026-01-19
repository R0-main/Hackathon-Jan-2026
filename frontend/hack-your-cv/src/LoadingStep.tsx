import { useState, useEffect } from 'react';


// Icons (garde les mêmes que ton CVFlow.tsx)
const Check = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Enhanced Loading Step Component
const LoadingStep = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const steps = [
    "Lecture de votre profil",
    "Analyse des mots-clés",
    "Optimisation en cours",
    "Vérification de la cohérence",
    "Mise en page finale",
  ];

  // CV Tips - conseils qui tournent
  const cvTips = [
    { icon: "💡", text: "78% des CV sont rejetés par les ATS avant d'être lus" },
    { icon: "💡", text: "Les recruteurs passent en moyenne 6 secondes sur un CV" },
    { icon: "💡", text: "Utilisez des verbes d'action : 'Développé', 'Conçu', 'Optimisé'" },
    { icon: "💡", text: "Ajoutez des chiffres : '25% d'amélioration' vs 'amélioration'" },
    { icon: "💡", text: "Les mots-clés de l'offre doivent être dans votre CV" },
    { icon: "💡", text: "Adaptez votre CV pour chaque offre d'emploi" },
    { icon: "💡", text: "Mettez en avant vos réalisations, pas vos tâches" },
    { icon: "💡", text: "Évitez le jargon interne de votre entreprise" },
  ];

  // Progression des étapes (basée sur les timings réels du backend)
  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 3000),    // 3s -> Analyse mots-clés
      setTimeout(() => setCurrentStep(2), 5000),    // 5s -> Optimisation
      setTimeout(() => setCurrentStep(3), 18000),   // 18s -> Vérification
      setTimeout(() => setCurrentStep(4), 24000),   // 24s -> Mise en page
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Rotation des tips toutes les 4 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % cvTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cvTips.length]);

  // Timer qui compte
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const estimatedTotal = 60; // Temps estimé en secondes
  const remaining = Math.max(0, estimatedTotal - elapsedTime);

  return (
    <div className="step-container loading-container">
      {/* Spinner visuel */}
      <div className="loading-visual">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="loading-content">
        <h1>Génération de votre CV...</h1>
        <p>Notre IA analyse votre profil et l'optimise pour les systèmes ATS.</p>

        {/* 💡 TIPS EN PREMIER - Déplacé ici */}
        <div className="loading-tips">
          <p className="tips-label">💡 Le saviez-vous ?</p>
          <div className="tips-carousel">
            {cvTips.map((tip, index) => (
              <div
                key={index}
                className={`tip-item ${index === currentTip ? 'tip-active' : ''}`}
              >
                <span className="tip-icon">{tip.icon}</span>
                <p className="tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
          {/* Indicateurs de pagination */}
          <div className="tips-dots">
            {cvTips.map((_, index) => (
              <div
                key={index}
                className={`tip-dot ${index === currentTip ? 'tip-dot-active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* ⏱️ TIMER EN DEUXIÈME - Déplacé ici */}
        <div className="loading-timer">
          <div className="timer-display">
            <span className="timer-elapsed">{elapsedTime}s</span>
            <span className="timer-separator">/</span>
            <span className="timer-total">~{estimatedTotal}s</span>
          </div>
          {remaining > 0 && (
            <p className="timer-remaining">Environ {remaining}s restantes</p>
          )}
        </div>

        {/* ✅ STEPS EN TROISIÈME - Reste à la même place */}
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

      {/* Disclaimer en bas */}
      <p className="loading-disclaimer">Cela prend généralement 30 à 60 secondes.</p>
    </div>
  );
};

export default LoadingStep;