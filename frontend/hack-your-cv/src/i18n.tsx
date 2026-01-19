import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'fr' | 'en';

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
    heroSubtitle: 'Colle une offre d\'emploi. On détecte les mots-clés manquants et on reformule tes expériences pour les systèmes ATS.',
    heroEmphasis: 'Aucune invention, que du concret.',
    atsCompatible: 'Compatible 100% ATS',

    // Hero CTA
    readyToOptimize: 'Prêt à optimiser ton CV ?',
    ctaDescription: 'Upload ton CV, colle une offre, télécharge ta version optimisée.',
    startNow: 'Commencer maintenant',
    free: 'Gratuit',
    twoMinutes: '2 minutes',
    noSignup: 'Sans inscription',

    // Problem section
    whyGhosted: 'Pourquoi tes candidatures restent sans réponse ?',
    notExperience: 'Le problème ne vient pas de ton expérience.',
    itsSemantic: 'C\'est une question de vocabulaire.',
    problemExplanation: 'Les recruteurs utilisent des filtres automatiques. Si ton CV dit « Géré une équipe » alors que l\'offre demande « Leadership Agile », tu disparais du classement.',
    problemQuote: 'Notre rôle : traduire ton expérience dans le langage exact attendu par le recruteur.',
    cvRejected: 'des CV sont filtrés automatiquement',
    avgReadTime: 'de lecture en moyenne par CV',

    // Before/After
    whatYouWrite: 'Ce que tu écris',
    ignored: 'Ignoré',
    beforeExample: '« J\'ai géré le projet de refonte du site web de l\'entreprise. »',
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
    proofByExample: 'Exemple concret',
    keepSubstance: 'On garde le fond, on améliore la forme.',
    comparisonBased: 'Comparaison basée sur l\'analyse d\'un profil Product Manager.',

    // Policy
    zeroLiePolicy: 'Politique « Zéro invention »',
    policyText: 'Notre IA ne fabrique jamais de contenu. Elle reformule, réorganise et adapte, mais ne crée aucune expérience fictive.',
    validateEachLine: 'Tu valides chaque ligne avant l\'export.',

    // For who
    isItForYou: 'Est-ce fait pour toi ?',
    honestlyNot: 'HackYourCV n\'est pas adapté à tous les profils.',
    forYouIf: 'C\'est pour toi si...',
    forYou1: 'Tu postules à des offres avec plus de 100 candidats où le tri est automatisé.',
    forYou2: 'Tu veux adapter ton CV à chaque offre en 2 minutes, pas en 2 heures.',
    forYou3: 'Tu as l\'expérience requise mais tu ne sais pas utiliser les bons mots-clés.',
    notForYouIf: 'Ce n\'est pas pour toi si...',
    notForYou1: 'Tu cherches à inventer des compétences (notre IA refuse de mentir).',
    notForYou2: 'Tu postules à des postes créatifs où le portfolio visuel prime.',
    notForYou3: 'Tu penses qu\'un design soigné suffit à convaincre un algorithme.',

    // Integrations section
    integrationsTitle: 'Utilisable partout',
    integrationsSubtitle: 'HackYourCV s\'intègre là où tu travailles déjà.',
    webAppTitle: 'Web App',
    webAppDesc: 'Interface complète, sans inscription. Upload, optimise, télécharge.',
    webAppCta: 'Utiliser l\'app',
    chatGptTitle: 'ChatGPT',
    chatGptDesc: 'Utilise HackYourCV directement dans ChatGPT. Requiert un abonnement Plus ou Pro.',
    chatGptCta: 'Voir comment configurer',
    chatGptModalTitle: 'Configurer HackYourCV dans ChatGPT',
    chatGptModalRequirement: 'Requiert un abonnement ChatGPT Plus ou Pro',
    chatGptModalStep1: 'Ouvrir les paramètres ChatGPT',
    chatGptModalStep1Desc: 'Cliquer sur le lien ci-dessous pour accéder aux Connectors',
    chatGptModalStep2: 'Activer le mode développeur',
    chatGptModalStep2Desc: 'Aller dans Advanced → Activer "Developer mode"',
    chatGptModalStep3: 'Créer une nouvelle application',
    chatGptModalStep3Desc: 'Cliquer sur "Create" et remplir comme ci-dessous',
    chatGptModalName: 'Nom',
    chatGptModalUrl: 'URL du serveur MCP',
    chatGptModalAuth: 'Authentification: Aucune',
    chatGptModalOpenSettings: 'Ouvrir les paramètres ChatGPT',
    chatGptModalClose: 'Fermer',
    mcpTitle: 'MCP Server',
    mcpDesc: 'Pour les développeurs. Intègre dans Claude Desktop, Cursor, ou ton propre outil.',
    mcpCta: 'Documentation',

    // FAQ
    quickQuestions: 'Questions fréquentes',
    whatIsAts: 'Qu\'est-ce qu\'un ATS ?',
    atsAnswer: 'C\'est le logiciel qui analyse ton CV avant qu\'un recruteur ne le voie. Sans les bons mots-clés, ta candidature est écartée automatiquement.',
    doesItReplace: 'Est-ce que ça remplace mon CV actuel ?',
    replaceAnswer: 'Non. Nous créons une version adaptée à une offre spécifique. Tu conserves ton CV principal, nous générons les variantes.',
    isItFree: 'C\'est vraiment gratuit ?',
    freeAnswer: 'Oui, l\'outil est entièrement gratuit. Tu peux optimiser ton CV autant de fois que nécessaire.',

    // Final CTA
    stopBeingFiltered: 'Ne te fais plus filtrer.',
    optimizeNowFree: 'Optimise ton CV maintenant, gratuitement.',

    // Footer
    madeWithCare: 'Conçu pour les candidats qui méritent d\'être lus.',

    // CVFlow - Upload
    step1of5: '1/5',
    uploadYourCV: 'Télécharge ton CV',
    dragDropCV: 'Glisse-dépose ton CV au format PDF pour commencer.',
    dragHere: 'Glisse ton CV ici',
    orClickBrowse: 'ou clique pour parcourir',
    pdfOnly: 'PDF uniquement - 10 Mo max',
    continue: 'Continuer',
    pdfOnlyAlert: 'Seuls les fichiers PDF sont acceptés',
    deleteFile: 'Supprimer le fichier',

    // CVFlow - Job offer
    step2of5: '2/5',
    jobInterest: 'L\'offre visée',
    pasteJobText: 'Colle le texte de l\'annonce ou son URL pour adapter ton CV.',
    jobText: 'Texte de l\'annonce',
    jobUrl: 'URL de l\'annonce',
    pasteHere: 'Colle ici le texte complet de l\'offre d\'emploi...',
    example: 'Exemple :',
    jobTitle: 'Titre du poste',
    jobDesc: 'Description du poste',
    requiredSkills: 'Compétences requises',
    etc: 'etc.',
    characters: 'caractères',
    min50: '(min 50)',
    supports: 'Compatible : LinkedIn, Indeed, Welcome to the Jungle, etc.',
    back: 'Retour',
    generateCV: 'Générer mon CV',

    // CVFlow - Loading
    generatingCV: 'Génération en cours...',
    aiAnalyzing: 'Notre IA analyse ton CV et l\'optimise pour les systèmes ATS.',
    step1Loading: 'Lecture de ton profil',
    step2Loading: 'Analyse des mots-clés',
    step3Loading: 'Optimisation en cours',
    step4Loading: 'Vérification du contenu',
    step5Loading: 'Mise en page finale',
    usuallyTakes: 'Cela prend généralement 30 à 60 secondes.',

    // CVFlow - Preview
    step4of5: '4/5',
    validateCV: 'Valide ton CV',
    checkEachLine: 'Vérifie le contenu avant l\'export. Tu peux revenir en arrière si besoin.',
    pages: 'pages',
    page: 'page',
    loadingPdf: 'Chargement du PDF...',
    pdfError: 'Erreur lors du chargement du PDF',
    previewUnavailable: 'Aperçu non disponible',
    problemGoBack: 'Un problème ? Retourne en arrière pour modifier.',
    modify: 'Modifier',
    validateDownload: 'Valider et télécharger',

    // CVFlow - Result
    cvReady: 'Ton CV est prêt !',
    cvOptimizedFor: 'CV optimisé pour',
    at: 'chez',
    cvOptimizedGeneral: 'Ton CV a été optimisé pour les systèmes ATS.',
    validatedReady: 'Validé et prêt à l\'export',
    keywordsMatched: 'Mots-clés matchés',
    sectionsOptimized: 'Sections optimisées',
    skillsIdentified: 'Compétences identifiées :',
    downloadPdf: 'Télécharger mon CV (PDF)',
    reviewCV: 'Revoir le CV',
    optimizeAnother: 'Optimiser un autre CV',

    // Errors
    errorUnknown: 'Erreur inconnue',
    errorBackendDown: 'Impossible de générer le CV. Vérifie que le service est disponible.',
    errorIntegrity: 'Cette offre semble trop éloignée de ton profil actuel. Essaie avec un poste plus proche de tes compétences.',
    errorRetry: 'Une erreur est survenue. Réessaie dans quelques instants.',
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
    heroSubtitle: 'Paste a job offer. We detect missing keywords and rephrase your experiences for ATS systems.',
    heroEmphasis: 'No invention, only facts.',
    atsCompatible: '100% ATS Compatible',

    // Hero CTA
    readyToOptimize: 'Ready to optimize your CV?',
    ctaDescription: 'Upload your CV, paste an offer, download your optimized version.',
    startNow: 'Start now',
    free: 'Free',
    twoMinutes: '2 minutes',
    noSignup: 'No signup',

    // Problem section
    whyGhosted: 'Why do your applications go unanswered?',
    notExperience: 'The problem isn\'t your experience.',
    itsSemantic: 'It\'s a matter of vocabulary.',
    problemExplanation: 'Recruiters use automatic filters. If your CV says "Managed a team" when the job asks for "Agile Leadership", you disappear from the ranking.',
    problemQuote: 'Our role: translate your experience into the exact language the recruiter expects.',
    cvRejected: 'of CVs are automatically filtered',
    avgReadTime: 'average reading time per CV',

    // Before/After
    whatYouWrite: 'What you write',
    ignored: 'Ignored',
    beforeExample: '"I managed the company website redesign project."',
    atsAnalysis: 'ATS Analysis',
    tooVague: 'Too vague',
    noKeywords: 'No technical keywords',
    hackVersion: 'HackYourCV Version',
    match: '98% Match',
    afterExample: 'Led e-commerce redesign',
    afterExampleTech: 'React, Node.js',
    afterExampleResult: 'increasing conversion rate by 15% in 3 months.',
    optimizations: 'Optimizations',
    hardSkills: 'Hard Skills',
    kpis: 'Quantified KPIs',

    // Proof section
    proofByExample: 'Concrete example',
    keepSubstance: 'We keep the substance, we improve the form.',
    comparisonBased: 'Comparison based on a Product Manager profile analysis.',

    // Policy
    zeroLiePolicy: '"Zero invention" Policy',
    policyText: 'Our AI never fabricates content. It rephrases, reorganizes and adapts, but never creates fictional experiences.',
    validateEachLine: 'You validate each line before export.',

    // For who
    isItForYou: 'Is it for you?',
    honestlyNot: 'HackYourCV isn\'t suited for everyone.',
    forYouIf: 'It\'s for you if...',
    forYou1: 'You apply to positions with 100+ candidates where sorting is automated.',
    forYou2: 'You want to adapt your CV to each offer in 2 minutes, not 2 hours.',
    forYou3: 'You have the required experience but don\'t know the right keywords.',
    notForYouIf: 'It\'s not for you if...',
    notForYou1: 'You\'re looking to invent skills (our AI refuses to lie).',
    notForYou2: 'You\'re applying for creative positions where visual portfolio matters most.',
    notForYou3: 'You think a nice design is enough to convince an algorithm.',

    // Integrations section
    integrationsTitle: 'Available everywhere',
    integrationsSubtitle: 'HackYourCV integrates where you already work.',
    webAppTitle: 'Web App',
    webAppDesc: 'Full interface, no signup. Upload, optimize, download.',
    webAppCta: 'Use the app',
    chatGptTitle: 'ChatGPT',
    chatGptDesc: 'Use HackYourCV directly in ChatGPT. Requires Plus or Pro subscription.',
    chatGptCta: 'See how to configure',
    chatGptModalTitle: 'Configure HackYourCV in ChatGPT',
    chatGptModalRequirement: 'Requires ChatGPT Plus or Pro subscription',
    chatGptModalStep1: 'Open ChatGPT settings',
    chatGptModalStep1Desc: 'Click the link below to access Connectors',
    chatGptModalStep2: 'Enable developer mode',
    chatGptModalStep2Desc: 'Go to Advanced → Enable "Developer mode"',
    chatGptModalStep3: 'Create a new application',
    chatGptModalStep3Desc: 'Click "Create" and fill in as shown below',
    chatGptModalName: 'Name',
    chatGptModalUrl: 'MCP Server URL',
    chatGptModalAuth: 'Authentication: None',
    chatGptModalOpenSettings: 'Open ChatGPT Settings',
    chatGptModalClose: 'Close',
    mcpTitle: 'MCP Server',
    mcpDesc: 'For developers. Integrate with Claude Desktop, Cursor, or your own tools.',
    mcpCta: 'Documentation',

    // FAQ
    quickQuestions: 'Frequently asked questions',
    whatIsAts: 'What is an ATS?',
    atsAnswer: 'It\'s the software that analyzes your CV before a recruiter sees it. Without the right keywords, your application is automatically discarded.',
    doesItReplace: 'Does it replace my current CV?',
    replaceAnswer: 'No. We create a version adapted to a specific offer. You keep your main CV, we generate variants.',
    isItFree: 'Is it really free?',
    freeAnswer: 'Yes, the tool is completely free. You can optimize your CV as many times as needed.',

    // Final CTA
    stopBeingFiltered: 'Stop getting filtered out.',
    optimizeNowFree: 'Optimize your CV now, for free.',

    // Footer
    madeWithCare: 'Built for candidates who deserve to be read.',

    // CVFlow - Upload
    step1of5: '1/5',
    uploadYourCV: 'Upload your CV',
    dragDropCV: 'Drag and drop your PDF CV to get started.',
    dragHere: 'Drop your CV here',
    orClickBrowse: 'or click to browse',
    pdfOnly: 'PDF only - 10 MB max',
    continue: 'Continue',
    pdfOnlyAlert: 'Only PDF files are accepted',
    deleteFile: 'Delete file',

    // CVFlow - Job offer
    step2of5: '2/5',
    jobInterest: 'Target position',
    pasteJobText: 'Paste the job posting text or URL to adapt your CV.',
    jobText: 'Job posting text',
    jobUrl: 'Job posting URL',
    pasteHere: 'Paste the full job posting here...',
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
    step1Loading: 'Reading your profile',
    step2Loading: 'Analyzing keywords',
    step3Loading: 'Optimization in progress',
    step4Loading: 'Content verification',
    step5Loading: 'Final formatting',
    usuallyTakes: 'This usually takes 30 to 60 seconds.',

    // CVFlow - Preview
    step4of5: '4/5',
    validateCV: 'Validate your CV',
    checkEachLine: 'Review the content before export. You can go back if needed.',
    pages: 'pages',
    page: 'page',
    loadingPdf: 'Loading PDF...',
    pdfError: 'Error loading PDF',
    previewUnavailable: 'Preview unavailable',
    problemGoBack: 'Problem? Go back to make changes.',
    modify: 'Modify',
    validateDownload: 'Validate and download',

    // CVFlow - Result
    cvReady: 'Your CV is ready!',
    cvOptimizedFor: 'CV optimized for',
    at: 'at',
    cvOptimizedGeneral: 'Your CV has been optimized for ATS systems.',
    validatedReady: 'Validated and ready for export',
    keywordsMatched: 'Keywords matched',
    sectionsOptimized: 'Sections optimized',
    skillsIdentified: 'Skills identified:',
    downloadPdf: 'Download my CV (PDF)',
    reviewCV: 'Review CV',
    optimizeAnother: 'Optimize another CV',

    // Errors
    errorUnknown: 'Unknown error',
    errorBackendDown: 'Unable to generate CV. Please check if the service is available.',
    errorIntegrity: 'This job seems too far from your current profile. Try with a position closer to your skills.',
    errorRetry: 'An error occurred. Please try again in a moment.',
  },
} as const;

type TranslationKey = keyof typeof translations.fr;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Detect browser language, default to French
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'fr';
  });

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.fr[key] || key;
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
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      className={`language-switcher ${className}`}
      aria-label={language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {language === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
