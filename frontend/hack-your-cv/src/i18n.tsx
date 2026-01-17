import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'fr' | 'en';

// Traductions
const translations = {
  fr: {
    // Header
    beforeAfter: 'Avant / Après',
    forWho: 'Pour qui ?',
    faq: 'FAQ',
    optimizeCV: 'Optimiser mon CV',

    // Hero
    availableNow: 'Disponible maintenant',
    heroTitle: 'Ton CV doit matcher en',
    heroTitleHighlight: '2 minutes',
    heroSubtitle: "Colle une offre. On détecte les mots-clés manquants, puis on réécrit tes expériences en langage ATS.",
    heroEmphasis: 'Zéro bullshit, zéro invention.',
    atsCompatible: 'Compatible 100% ATS',

    // Hero CTA
    readyToOptimize: 'Prêt à optimiser ton CV ?',
    ctaDescription: 'Upload ton CV, colle une offre, télécharge ta version optimisée.',
    startNow: 'Commencer maintenant',
    free: 'Gratuit',
    twoMinutes: '2 minutes',
    noSignup: 'Sans inscription',

    // Problem section
    whyGhosted: 'Pourquoi tu te fais ghoster ?',
    notExperience: "Ce n'est pas ton expérience le problème.",
    itsSemantic: "C'est la sémantique.",
    problemExplanation: 'Les recruteurs utilisent des filtres automatiques. Si ton CV dit "Géré une équipe" et que l\'offre demande "Leadership Agile", tu disparais du classement.',
    problemQuote: 'Notre job : traduire ton expérience réelle dans le dialecte exact du recruteur.',
    cvRejected: 'Des CV rejetés par robots',
    avgReadTime: 'Temps de lecture moyen',

    // Before/After
    whatYouWrite: 'Ce que tu écris',
    ignored: 'Ignoré',
    beforeExample: "\"J'ai géré le projet de refonte du site web de l'entreprise.\"",
    atsAnalysis: 'Analyse ATS',
    tooVague: 'Trop vague',
    noKeywords: 'Aucun mot-clé technique',
    hackVersion: 'Version HackYourCV',
    match: 'Match 98%',
    afterExample: 'Piloté la refonte e-commerce',
    afterExampleTech: 'React, Node.js',
    afterExampleResult: 'augmentant le taux de conversion de 15% en 3 mois.',
    optimizations: 'Optimisations',
    hardSkills: 'Hard Skills',
    kpis: 'KPIs chiffrés',

    // Proof section
    proofByExample: "Preuve par l'exemple",
    keepSubstance: 'On garde le fond, on change l\'impact.',
    comparisonBased: "Comparaison basée sur une analyse réelle d'un profil Product Manager.",

    // Policy
    zeroLiePolicy: 'Politique "Zéro mensonge"',
    policyText: "Notre IA est bridée pour ne jamais inventer. Elle reformule, réordonne et traduit, mais ne crée pas d'expérience ex-nihilo.",
    validateEachLine: 'Tu valides chaque ligne avant l\'export final.',

    // For who
    isItForYou: 'Est-ce que c\'est pour toi ?',
    honestlyNot: "Soyons honnêtes, HackYourCV ne sert pas à tout le monde.",
    forYouIf: "C'est pour toi si...",
    forYou1: "Tu postules à des offres avec >100 candidats (grands groupes, scale-ups) où le tri est automatique.",
    forYou2: "Tu veux adapter ton CV à chaque offre en 2 minutes chrono, pas en 2 heures.",
    forYou3: "Tu as l'expérience, mais tu ne sais pas \"te vendre\" avec les mots-clés exacts.",
    notForYouIf: "Pas pour toi si...",
    notForYou1: "Tu cherches à inventer des compétences que tu n'as pas (notre IA refuse de mentir).",
    notForYou2: "Tu postules pour des jobs 100% créatifs (Design, Art) où le portfolio visuel prime.",
    notForYou3: "Tu penses qu'un beau design Canva suffit pour impressionner un algorithme.",

    // FAQ
    quickQuestions: 'Questions rapides',
    whatIsAts: "C'est quoi un ATS ?",
    atsAnswer: "C'est le logiciel qui lit ton CV avant l'humain. S'il ne trouve pas les mots exacts de l'offre, tu passes à la trappe.",
    doesItReplace: 'Est-ce que ça remplace mon CV actuel ?',
    replaceAnswer: "Non, ça crée une version 'ciblée' pour une offre spécifique. Tu gardes ton CV maître, nous générons les variantes.",
    isItFree: "C'est gratuit ?",
    freeAnswer: "Oui, l'outil est entièrement gratuit. Uploade ton CV et optimise-le autant de fois que tu veux.",

    // Final CTA
    stopBeingFiltered: 'Arrête de te faire filtrer.',
    optimizeNowFree: 'Optimise ton CV maintenant, gratuitement.',

    // Footer
    madeWithCare: 'Fait avec soin pour les candidats ignorés.',

    // CVFlow - Upload
    step1of5: '1/5',
    uploadYourCV: 'Uploade ton CV',
    dragDropCV: 'Glisse-dépose ton CV au format PDF pour commencer l\'optimisation.',
    dragHere: 'Glisse ton CV ici',
    orClickBrowse: 'ou clique pour parcourir',
    pdfOnly: 'PDF uniquement - 10 MB max',
    continue: 'Continuer',
    pdfOnlyAlert: 'Seuls les fichiers PDF sont acceptés',

    // CVFlow - Job offer
    step2of5: '2/5',
    jobInterest: "L'offre qui t'intéresse",
    pasteJobText: "Colle le texte de l'annonce ou son URL pour qu'on adapte ton CV.",
    jobText: "Texte de l'annonce",
    jobUrl: "URL de l'annonce",
    pasteHere: "Colle ici le texte complet de l'offre d'emploi...",
    example: 'Exemple:',
    jobTitle: 'Titre du poste',
    jobDesc: 'Description du poste',
    requiredSkills: 'Compétences requises',
    etc: 'etc.',
    characters: 'caractères',
    min50: '(min 50)',
    supports: 'Supporte: LinkedIn, Indeed, Welcome to the Jungle, etc.',
    back: 'Retour',
    generateCV: 'Générer mon CV',

    // CVFlow - Loading
    generatingCV: 'Génération en cours...',
    aiAnalyzing: 'Notre IA analyse ton CV et l\'optimise pour les systèmes ATS.',
    analyzingCV: 'Analyse de ton CV',
    optimizingAts: 'Optimisation ATS en cours',
    generatingNew: 'Génération du nouveau CV',
    usuallyTakes: 'Cela prend généralement 10 à 20 secondes.',

    // CVFlow - Preview
    step4of5: '4/5',
    validateCV: 'Valide ton CV',
    checkEachLine: 'Vérifie chaque ligne avant l\'export final. Tu peux revenir en arrière si besoin.',
    loadingPdf: 'Chargement du PDF...',
    pdfError: 'Erreur lors du chargement du PDF',
    previewUnavailable: 'Aperçu du CV non disponible',
    problemGoBack: 'Un problème ? Retourne en arrière pour modifier les informations.',
    modify: 'Modifier',
    validateDownload: 'Valider et télécharger',

    // CVFlow - Result
    cvReady: 'Ton CV est prêt !',
    cvValidated: "Tu as validé ton CV. Il est maintenant optimisé pour matcher les exigences de l'offre.",
    validatedReady: 'Validé et prêt à l\'export',
    atsMatch: 'Match ATS',
    keywordsAdded: 'Mots-clés ajoutés',
    sectionsImproved: 'Sections améliorées',
    downloadPdf: 'Télécharger mon CV (PDF)',
    reviewCV: 'Revoir le CV',
    optimizeAnother: 'Optimiser un autre CV',
  },
  en: {
    // Header
    beforeAfter: 'Before / After',
    forWho: 'Who is it for?',
    faq: 'FAQ',
    optimizeCV: 'Optimize my CV',

    // Hero
    availableNow: 'Available now',
    heroTitle: 'Your CV must match in',
    heroTitleHighlight: '2 minutes',
    heroSubtitle: "Paste a job offer. We detect missing keywords, then rewrite your experiences in ATS language.",
    heroEmphasis: 'Zero bullshit, zero invention.',
    atsCompatible: '100% ATS Compatible',

    // Hero CTA
    readyToOptimize: 'Ready to optimize your CV?',
    ctaDescription: 'Upload your CV, paste an offer, download your optimized version.',
    startNow: 'Start now',
    free: 'Free',
    twoMinutes: '2 minutes',
    noSignup: 'No signup',

    // Problem section
    whyGhosted: 'Why are you getting ghosted?',
    notExperience: "It's not your experience that's the problem.",
    itsSemantic: "It's the semantics.",
    problemExplanation: 'Recruiters use automatic filters. If your CV says "Managed a team" and the offer asks for "Agile Leadership", you disappear from the ranking.',
    problemQuote: "Our job: translate your real experience into the recruiter's exact dialect.",
    cvRejected: 'CVs rejected by robots',
    avgReadTime: 'Average reading time',

    // Before/After
    whatYouWrite: 'What you write',
    ignored: 'Ignored',
    beforeExample: '"I managed the company website redesign project."',
    atsAnalysis: 'ATS Analysis',
    tooVague: 'Too vague',
    noKeywords: 'No technical keywords',
    hackVersion: 'HackYourCV Version',
    match: 'Match 98%',
    afterExample: 'Led e-commerce redesign',
    afterExampleTech: 'React, Node.js',
    afterExampleResult: 'increasing conversion rate by 15% in 3 months.',
    optimizations: 'Optimizations',
    hardSkills: 'Hard Skills',
    kpis: 'Quantified KPIs',

    // Proof section
    proofByExample: 'Proof by example',
    keepSubstance: 'We keep the substance, we change the impact.',
    comparisonBased: 'Comparison based on a real Product Manager profile analysis.',

    // Policy
    zeroLiePolicy: '"Zero lies" Policy',
    policyText: "Our AI is constrained to never invent. It rephrases, reorders, and translates, but doesn't create experience from scratch.",
    validateEachLine: 'You validate each line before the final export.',

    // For who
    isItForYou: 'Is it for you?',
    honestlyNot: "Let's be honest, HackYourCV isn't for everyone.",
    forYouIf: "It's for you if...",
    forYou1: "You apply to offers with >100 candidates (large companies, scale-ups) where sorting is automatic.",
    forYou2: "You want to adapt your CV to each offer in 2 minutes, not 2 hours.",
    forYou3: 'You have the experience, but don\'t know how to "sell yourself" with the exact keywords.',
    notForYouIf: "Not for you if...",
    notForYou1: "You're looking to invent skills you don't have (our AI refuses to lie).",
    notForYou2: "You apply for 100% creative jobs (Design, Art) where the visual portfolio comes first.",
    notForYou3: "You think a nice Canva design is enough to impress an algorithm.",

    // FAQ
    quickQuestions: 'Quick questions',
    whatIsAts: "What is an ATS?",
    atsAnswer: "It's the software that reads your CV before the human. If it doesn't find the exact words from the offer, you get filtered out.",
    doesItReplace: 'Does it replace my current CV?',
    replaceAnswer: "No, it creates a 'targeted' version for a specific offer. You keep your master CV, we generate the variants.",
    isItFree: 'Is it free?',
    freeAnswer: "Yes, the tool is completely free. Upload your CV and optimize it as many times as you want.",

    // Final CTA
    stopBeingFiltered: 'Stop getting filtered.',
    optimizeNowFree: 'Optimize your CV now, for free.',

    // Footer
    madeWithCare: 'Made with care for ignored candidates.',

    // CVFlow - Upload
    step1of5: '1/5',
    uploadYourCV: 'Upload your CV',
    dragDropCV: 'Drag and drop your CV in PDF format to start the optimization.',
    dragHere: 'Drag your CV here',
    orClickBrowse: 'or click to browse',
    pdfOnly: 'PDF only - 10 MB max',
    continue: 'Continue',
    pdfOnlyAlert: 'Only PDF files are accepted',

    // CVFlow - Job offer
    step2of5: '2/5',
    jobInterest: 'The job you\'re interested in',
    pasteJobText: "Paste the job description or its URL so we can adapt your CV.",
    jobText: 'Job description text',
    jobUrl: 'Job URL',
    pasteHere: 'Paste the full job description here...',
    example: 'Example:',
    jobTitle: 'Job title',
    jobDesc: 'Job description',
    requiredSkills: 'Required skills',
    etc: 'etc.',
    characters: 'characters',
    min50: '(min 50)',
    supports: 'Supports: LinkedIn, Indeed, Welcome to the Jungle, etc.',
    back: 'Back',
    generateCV: 'Generate my CV',

    // CVFlow - Loading
    generatingCV: 'Generating...',
    aiAnalyzing: 'Our AI is analyzing your CV and optimizing it for ATS systems.',
    analyzingCV: 'Analyzing your CV',
    optimizingAts: 'ATS optimization in progress',
    generatingNew: 'Generating new CV',
    usuallyTakes: 'This usually takes 10 to 20 seconds.',

    // CVFlow - Preview
    step4of5: '4/5',
    validateCV: 'Validate your CV',
    checkEachLine: 'Check each line before the final export. You can go back if needed.',
    loadingPdf: 'Loading PDF...',
    pdfError: 'Error loading PDF',
    previewUnavailable: 'CV preview unavailable',
    problemGoBack: 'A problem? Go back to modify the information.',
    modify: 'Modify',
    validateDownload: 'Validate and download',

    // CVFlow - Result
    cvReady: 'Your CV is ready!',
    cvValidated: "You've validated your CV. It's now optimized to match the job requirements.",
    validatedReady: 'Validated and ready for export',
    atsMatch: 'ATS Match',
    keywordsAdded: 'Keywords added',
    sectionsImproved: 'Sections improved',
    downloadPdf: 'Download my CV (PDF)',
    reviewCV: 'Review CV',
    optimizeAnother: 'Optimize another CV',
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;

export type TFunction = (key: TranslationKey) => string;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'fr';
  });

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Language Switcher Component
export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <button
      className="language-switcher"
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      aria-label="Switch language"
    >
      {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
    </button>
  );
}
