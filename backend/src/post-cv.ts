import { Router, Request, Response } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import { ModernATS_CVGenerator } from './CV/cv-creator';
import { getScraperForUrl, jobToText } from './scrapers';
import { extractKeywords } from './keywords';
import path from 'path';
import fs from 'fs';

const router = Router();

// Initialize OpenAI client for Blackbox AI
const openai = new OpenAI({
  baseURL: 'https://api.blackbox.ai',
  apiKey: process.env.BLACK_BOX_API_KEY || 'YOUR_API_KEY',
});

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Zod Schema for CV data
const cvSchema = z.object({
  header: z.object({
    name: z.string(),
    title: z.string(),
    contact: z.string(),
  }),
  summary: z.string(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    dates: z.string(),
    description: z.string(),
    tasks: z.array(z.string()),
  })),
  education: z.array(z.object({
    degree: z.string(),
    school: z.string(),
    year: z.string(),
  })),
  skills: z.record(z.string(), z.array(z.string())),
});

// Compute real stats by comparing optimized CV with job requirements
function computeStats(
  optimizedData: z.infer<typeof cvSchema>,
  jobSkills: string[]
): { keywordsMatched: string[]; sectionsOptimized: number } {
  // Get all skills from optimized CV
  const optimizedSkills: string[] = [];
  for (const category of Object.values(optimizedData.skills) as string[][]) {
    optimizedSkills.push(...category);
  }

  // Find keywords that are in job requirements AND now in optimized CV but weren't clearly in original
  const keywordsMatched: string[] = [];
  for (const skill of jobSkills) {
    const skillLower = skill.toLowerCase();
    // Check if skill is now prominently featured
    const inOptimizedSkills = optimizedSkills.some(s => s.toLowerCase().includes(skillLower));
    const inOptimizedText = JSON.stringify(optimizedData).toLowerCase().includes(skillLower);

    if (inOptimizedSkills || inOptimizedText) {
      keywordsMatched.push(skill);
    }
  }

  // Count sections that were optimized (non-empty sections)
  let sectionsOptimized = 0;
  if (optimizedData.summary && optimizedData.summary.length > 20) sectionsOptimized++;
  if (optimizedData.experience && optimizedData.experience.length > 0) sectionsOptimized++;
  if (optimizedData.education && optimizedData.education.length > 0) sectionsOptimized++;
  if (Object.keys(optimizedData.skills).length > 0) sectionsOptimized++;

  return {
    keywordsMatched: [...new Set(keywordsMatched)],
    sectionsOptimized
  };
}

// Schema for validation response
const validationSchema = z.object({
  profileRelevant: z.boolean(),
  relevanceReason: z.string(),
  valid: z.boolean(),
  issues: z.array(z.string()),
  inventedItems: z.array(z.string()).optional(),
});

// AI Guardian: Validates CV-Job relevance AND that the optimized CV doesn't contain invented information
async function validateCVIntegrity(
  originalText: string,
  optimizedData: z.infer<typeof cvSchema>,
  openaiClient: OpenAI,
  jobDescription?: string,
  jobTitle?: string
): Promise<{ profileRelevant: boolean; relevanceReason: string; valid: boolean; issues: string[]; inventedItems: string[] }> {
  console.log('🛡️ Running AI Guardian validation...');

  const validationPrompt = `Tu es un VALIDATEUR INTELLIGENT de CV. Tu as DEUX missions:

═══════════════════════════════════════════════════════════════
🎯 MISSION 1: ÉVALUER LA PERTINENCE DU PROFIL POUR L'OFFRE
═══════════════════════════════════════════════════════════════
${jobDescription ? `
OFFRE D'EMPLOI VISÉE:
${jobTitle ? `Poste: ${jobTitle}` : ''}
${jobDescription}

QUESTION CRITIQUE: Le profil du candidat est-il PERTINENT pour cette offre ?

⚠️ SOIS TRÈS PERMISSIF - On refuse UNIQUEMENT les cas ABSURDES.

✅ PERTINENT (ACCEPTER) si:
- Le candidat a UN SEUL skill transférable ou connexe
- Le domaine est même vaguement lié (tech → tech, même si spécialités différentes)
- Le candidat montre une capacité d'apprentissage (études, projets perso, etc.)
- Les compétences peuvent être apprises (dev → cybersec = OK, dev → data = OK, etc.)

EXEMPLES À ACCEPTER:
- Dev backend → poste cybersécurité = OK (scripting, réseaux, logique)
- Dev frontend → poste fullstack = OK
- Data analyst → poste dev = OK (Python, logique)
- Étudiant info → n'importe quel poste tech junior = OK
- Dev Java → poste Python = OK (langages transférables)
- Sysadmin → poste DevOps = OK

❌ NON PERTINENT (REFUSER) UNIQUEMENT si:
- Le profil est dans un domaine TOTALEMENT différent sans AUCUN lien
  Exemples: boulanger → dev, coiffeur → data scientist, chauffeur → architecte cloud
- ZÉRO compétence technique et ZÉRO formation technique

IMPORTANT: En cas de DOUTE, ACCEPTER. On préfère optimiser un CV même si le match n'est pas parfait.
` : 'Pas d\'offre fournie - considérer le profil comme pertinent par défaut.'}

═══════════════════════════════════════════════════════════════
🎯 MISSION 2: DÉTECTER LES INVENTIONS (si profil pertinent)
═══════════════════════════════════════════════════════════════
Ton rôle est de détecter les VRAIES INVENTIONS (mensonges) tout en acceptant les reformulations légitimes.

═══════════════════════════════════════════════════════════════
CV ORIGINAL
═══════════════════════════════════════════════════════════════
${originalText}

═══════════════════════════════════════════════════════════════
CV OPTIMISÉ (à valider)
═══════════════════════════════════════════════════════════════
${JSON.stringify(optimizedData, null, 2)}

═══════════════════════════════════════════════════════════════
🚨 VIOLATIONS GRAVES (REJETER SI PRÉSENT)
═══════════════════════════════════════════════════════════════
❌ Entreprises inventées qui n'existent pas dans l'original
❌ Diplômes ou certifications inventés
❌ Métriques chiffrées inventées (%, €, "augmenté de X%")
❌ Expériences professionnelles complètement fabriquées
❌ Compétences techniques majeures non démontrables depuis l'original
   (ex: si le CV ne mentionne jamais Python, ne pas ajouter "Expert Python")

═══════════════════════════════════════════════════════════════
✅ REFORMULATIONS ACCEPTABLES (NE PAS REJETER)
═══════════════════════════════════════════════════════════════
Ces éléments sont des CLARIFICATIONS LÉGITIMES, pas des inventions:

1. NIVEAUX DE LANGUE IMPLICITES:
   - Lycée/études en France → "Français (langue maternelle)" = OK
   - École française + pas d'indication contraire → Français natif = OK
   - Contexte professionnel en anglais mentionné → "Anglais professionnel" = OK

2. NIVEAUX DE COMPÉTENCE RAISONNABLES:
   - Plusieurs années d'expérience avec une techno → "solides bases", "maîtrise" = OK
   - Formation + projets dans un domaine → "compétences en X" = OK
   - Stage/alternance → "expérience en" = OK

3. TITRES DE POSTE DESCRIPTIFS:
   - Activité freelance → "Développeur Freelance" ou "Mission Indépendante" = OK
   - Projets personnels décrits → "Projet Personnel" = OK
   - Travail non-salarié décrit → titre générique descriptif = OK

4. REFORMULATIONS STYLISTIQUES:
   - "j'ai fait des mods" → "Développement d'extensions" = OK
   - "j'ai codé" → "Conception et développement" = OK
   - Réorganisation de l'ordre des expériences = OK
   - Regroupement de compétences par catégories = OK

5. INFÉRENCES TECHNIQUES LOGIQUES:
   - TypeScript mentionné → JavaScript implicite = OK
   - React mentionné → JavaScript/HTML/CSS implicites = OK
   - Développement backend mentionné → bases de données implicites = OK

═══════════════════════════════════════════════════════════════
PROCESSUS DE DÉCISION
═══════════════════════════════════════════════════════════════
Pour chaque élément du CV optimisé, demande-toi:
1. Est-ce une INVENTION PURE (aucune base dans l'original) ? → VIOLATION
2. Est-ce une CLARIFICATION d'information implicite ? → ACCEPTABLE
3. Est-ce une REFORMULATION professionnelle ? → ACCEPTABLE
4. Est-ce une INFÉRENCE LOGIQUE raisonnable ? → ACCEPTABLE

En cas de doute sur une reformulation, ACCEPTE-LA si elle est raisonnable.
Sois STRICT sur les inventions pures, TOLÉRANT sur les reformulations.

═══════════════════════════════════════════════════════════════
FORMAT DE RÉPONSE (JSON UNIQUEMENT)
═══════════════════════════════════════════════════════════════
{
  "profileRelevant": true/false,
  "relevanceReason": "Explication courte de pourquoi le profil est ou n'est pas pertinent pour l'offre",
  "valid": true/false,
  "issues": ["description de chaque VRAIE violation trouvée"],
  "inventedItems": ["élément inventé 1", "élément inventé 2"]
}

RÈGLES:
- Si profileRelevant est FALSE, valid doit aussi être FALSE
- Si pas d'offre fournie, profileRelevant = true par défaut
- relevanceReason doit être en français et faire 1-2 phrases max

Exemple profil pertinent: {"profileRelevant": true, "relevanceReason": "Le candidat a de l'expérience en développement web et maîtrise plusieurs technologies demandées.", "valid": true, "issues": [], "inventedItems": []}
Exemple profil non pertinent: {"profileRelevant": false, "relevanceReason": "Le candidat est comptable sans aucune expérience en développement logiciel.", "valid": false, "issues": ["Profil incompatible avec l'offre"], "inventedItems": []}`;

  try {
    const validation = await openaiClient.chat.completions.create({
      model: 'blackboxai/openai/gpt-4o',
      messages: [
        { role: 'user', content: validationPrompt }
      ],
      temperature: 0.1,
    });

    const content = validation.choices[0].message.content;
    if (!content) {
      console.log('⚠️ Guardian returned empty response, assuming valid');
      return { profileRelevant: true, relevanceReason: 'Validation automatique (réponse vide)', valid: true, issues: [], inventedItems: [] };
    }

    // Clean and parse response
    let cleanJson = content
      .replace(/```json\n?|\n?```/g, '')
      .trim();

    if (!cleanJson.startsWith('{')) {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) cleanJson = match[0];
    }

    const result = JSON.parse(cleanJson);
    const validated = validationSchema.parse(result);

    if (!validated.profileRelevant) {
      console.log('🚫 Guardian: Profile NOT relevant for job offer');
      console.log('📝 Reason:', validated.relevanceReason);
    } else if (!validated.valid) {
      console.log('🚨 Guardian detected issues:', validated.issues);
      console.log('🚨 Invented items:', validated.inventedItems);
    } else {
      console.log('✅ Guardian validation passed - Profile relevant & no invented content');
    }

    return {
      profileRelevant: validated.profileRelevant,
      relevanceReason: validated.relevanceReason,
      valid: validated.valid,
      issues: validated.issues,
      inventedItems: validated.inventedItems || []
    };
  } catch (error) {
    console.error('⚠️ Guardian validation error:', error);
    // On error, we allow the CV through but log the issue
    return { profileRelevant: true, relevanceReason: 'Validation automatique (erreur)', valid: true, issues: ['Validation check could not be completed'], inventedItems: [] };
  }
}

// Route to handle PDF upload with optional job URL
// Expecting: 'cv' file + optional 'jobUrl' in body
router.post('/', upload.single('cv'), async (req: Request, res: Response): Promise<void> => {
  const totalStart = Date.now();
  const timers: Record<string, number> = {};

  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  if (req.file.mimetype !== 'application/pdf') {
     res.status(400).send('Only PDF files are allowed.');
     return;
  }

  // Get job URL or job description from request body
  const { jobUrl, jobDescription: jobDescriptionText } = req.body;

  let jobDescription = '';
  let jobInfo = null;

  try {
    // If job URL is provided, scrape it
    if (jobUrl && jobUrl.trim()) {
      const scrapeStart = Date.now();
      console.log('🔍 [STEP 1] Scraping job posting from:', jobUrl);
      try {
        const scraper = getScraperForUrl(jobUrl);
        const job = await scraper.scrape(jobUrl);
        jobDescription = jobToText(job);
        timers['1_scraping'] = Date.now() - scrapeStart;
        console.log(`⏱️ Scraping done in ${timers['1_scraping']}ms`);

        // Extract skills using regex-based keyword matching (instant, no AI call)
        const extractStart = Date.now();
        console.log('🔍 [STEP 2] Extracting keywords...');
        const extractedSkills = extractKeywords(jobDescription);
        timers['2_keywords_extraction'] = Date.now() - extractStart;
        console.log(`⏱️ Keywords extraction done in ${timers['2_keywords_extraction']}ms (${extractedSkills.length} found)`);

        jobInfo = {
          ...job,
          skills: extractedSkills.length > 0 ? extractedSkills : job.skills,
        };
        console.log(`✅ Job posting integrated: ${job.title} (${job.platform})`);
      } catch (error) {
        console.error('⚠️ Failed to scrape job, continuing without it:', error);
      }
    } else if (jobDescriptionText && jobDescriptionText.trim()) {
      // Use raw job description text provided by user
      console.log('📝 [STEP 1] Using provided job description text');
      jobDescription = jobDescriptionText.trim();
      timers['1_job_text'] = 0;

      // Extract skills using regex-based keyword matching (instant, no AI call)
      const extractStart = Date.now();
      console.log('🔍 [STEP 2] Extracting keywords...');
      const extractedSkills = extractKeywords(jobDescription);
      timers['2_keywords_extraction'] = Date.now() - extractStart;
      console.log(`⏱️ Keywords extraction done in ${timers['2_keywords_extraction']}ms (${extractedSkills.length} found)`);

      jobInfo = {
        title: 'Position',
        company: 'Company',
        skills: extractedSkills,
      };
      console.log('✅ Job description integrated, found skills:', extractedSkills.length);
    }

    // 1. Extract text from PDF
    const pdfExtractStart = Date.now();
    console.log('📄 [STEP 3] Extracting text from CV...');
    const pdfData = await pdfParse(req.file.buffer);
    const textContent = pdfData.text;
    timers['3_pdf_extraction'] = Date.now() - pdfExtractStart;
    console.log(`⏱️ PDF extraction done in ${timers['3_pdf_extraction']}ms`);

    // Don't send images to avoid API errors
    const optimizerStart = Date.now();
    console.log('🤖 [STEP 4] Sending to Blackbox AI for optimization...');

    const userMessageContent = `Here is the resume text to optimize:

${textContent}

${jobDescription ? `
=== JOB POSTING TO OPTIMIZE FOR ===

${jobDescription}

=== END JOB POSTING ===

IMPORTANT: Reorganize and rephrase this resume to highlight relevant existing skills for the job above. DO NOT invent any new information.
` : ''}`;

    // 2. Send to Blackbox AI
    console.log('🤖 Sending to Blackbox AI for optimization...');
    const completion = await openai.chat.completions.create({
      model: 'blackboxai/openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an EXPERT CV optimizer. Your ONLY task is to return a valid JSON object - nothing else.

DO NOT write explanations, descriptions, or any other text.
DO NOT use markdown code blocks (\n)
DO NOT add preambles or postambles.
ONLY return the raw JSON object.

${jobDescription ? `
🎯 OBJECTIF: Optimiser ce CV pour l'offre d'emploi fournie.

═══════════════════════════════════════════════════════════════
RÈGLES ABSOLUES - INTERDICTIONS STRICTES
═══════════════════════════════════════════════════════════════
❌ JAMAIS inventer des entreprises, postes ou missions qui n'existent pas
❌ JAMAIS ajouter de métriques chiffrées (%, €, nombres) non présentes
❌ JAMAIS inventer des certifications ou diplômes
❌ JAMAIS créer de titres de poste formels pour des activités informelles
   (si l'original dit "j'ai développé des mods", ne pas mettre "Développeur Mods Senior")

═══════════════════════════════════════════════════════════════
CE QUE TU PEUX FAIRE (REFORMULATIONS AUTORISÉES)
═══════════════════════════════════════════════════════════════
✅ RÉORGANISER: Mettre les expériences les plus pertinentes en premier
✅ VERBES D'ACTION: Remplacer "j'ai fait" par "Développé", "Conçu", "Mis en œuvre"
✅ SYNONYMES PROFESSIONNELS: "mods" → "extensions logicielles", "scripts" → "automatisations"
✅ CLARIFIER les compétences implicites:
   - Si quelqu'un a fait du dev TypeScript → il connaît JavaScript
   - Si quelqu'un a un lycée français → Français langue maternelle est OK
   - Si quelqu'un code depuis X années → "solides bases" ou "maîtrise" sont OK
✅ STRUCTURER: Regrouper les compétences par catégorie logique
✅ ADAPTER LE VOCABULAIRE au secteur visé (utiliser les termes de l'offre quand applicable)

═══════════════════════════════════════════════════════════════
RÈGLES POUR LES TITRES DE POSTE
═══════════════════════════════════════════════════════════════
- Si l'original a un titre formel → le garder ou l'améliorer légèrement
- Si l'original décrit une activité freelance/perso → utiliser un titre descriptif simple:
  "Développeur Freelance", "Projet Personnel", "Mission Indépendante"
- NE PAS inventer de titres pompeux ou de niveaux (Senior, Lead, Expert) non justifiés

═══════════════════════════════════════════════════════════════
RÈGLES POUR ÉVITER LES DOUBLONS D'EXPÉRIENCES
═══════════════════════════════════════════════════════════════
⚠️ IMPORTANT: Si plusieurs expériences sont très similaires (même période, même type d'activité):
- FUSIONNER en une seule expérience avec un titre englobant
- OU différencier clairement avec des descriptions DISTINCTES (technologies différentes, contextes différents)
- JAMAIS avoir 2 expériences avec des descriptions quasi-identiques
- Exemple: "Freelance pour PixelPoly" + "Freelance pour clients" sur la même période
  → Fusionner en "Développeur Freelance (2023-2024)" avec les différents clients/missions en sous-points

═══════════════════════════════════════════════════════════════
CONTEXTE DE L'OFFRE
═══════════════════════════════════════════════════════════════
Poste visé: ${jobInfo?.title || 'le poste'}
Mots-clés à mettre en valeur si présents dans le CV: ${jobInfo?.skills.join(', ') || 'compétences techniques'}
` : `
Optimise ce CV pour les systèmes ATS:
- Utilise un langage professionnel et des verbes d'action
- Structure clairement le contenu
- JAMAIS inventer d'informations absentes du CV original
- Reformuler et réorganiser uniquement le contenu existant
`}

REQUIRED JSON FORMAT (return ONLY this, no other text):

{
  "header": {
    "name": "string",
    "title": "string",
    "contact": "string"
  },
  "summary": "string (2-3 sentences)",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "dates": "string",
      "description": "string",
      "tasks": ["string", "string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "year": "string"
    }
  ],
  "skills": {
    "Category1": ["skill1", "skill2"],
    "Category2": ["skill3", "skill4"]
  }
}

CRITICAL REMINDER: Return ONLY the JSON object. No markdown. No explanations. Just the JSON.`
        },
        {
          role: 'user',
          content: userMessageContent,
        },
      ],
      temperature: 0.1,
    });

    const aiContent = completion.choices[0].message.content;

    if (!aiContent) {
        throw new Error('No content received from AI');
    }

    // 3. Parse and Validate JSON
    timers['4_optimizer'] = Date.now() - optimizerStart;
    console.log(`⏱️ Optimizer done in ${timers['4_optimizer']}ms`);
    console.log('📋 Parsing AI response...');

    // Clean the response more aggressively
    let cleanJson = aiContent
      .replace(/```json\n?|\n?```/g, '')  // Remove markdown code blocks
      .replace(/^[^{]*({[\s\S]*})[^}]*$/g, '$1')  // Extract only the JSON object
      .trim();

    // If the response doesn't start with {, try to find the JSON
    if (!cleanJson.startsWith('{')) {
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
    }

    let parsedData;
    try {
        parsedData = JSON.parse(cleanJson);
    } catch (e) {
        console.error('Failed to parse JSON from AI. Raw response:', aiContent.substring(0, 500));
        console.error('Cleaned JSON attempt:', cleanJson.substring(0, 500));
        res.status(500).json({
          error: 'AI response was not valid JSON',
          raw: aiContent.substring(0, 1000),
          cleaned: cleanJson.substring(0, 1000)
        });
        return;
    }

    const validatedData = cvSchema.parse(parsedData);

    // 4. AI Guardian - Validate CV-Job relevance AND CV integrity
    const guardianStart = Date.now();
    console.log('🛡️ [STEP 5] Guardian validation...');
    const guardianResult = await validateCVIntegrity(
      textContent,
      validatedData,
      openai,
      jobDescription || undefined,
      jobInfo?.title || undefined
    );
    timers['5_guardian'] = Date.now() - guardianStart;
    console.log(`⏱️ Guardian done in ${timers['5_guardian']}ms`);

    // Check profile relevance FIRST
    if (!guardianResult.profileRelevant) {
      console.log('🚫 Guardian rejected CV - Profile not relevant for job offer');
      console.log('📝 Reason:', guardianResult.relevanceReason);

      res.status(400).json({
        success: false,
        error: 'PROFILE_NOT_RELEVANT',
        message: guardianResult.relevanceReason || 'Votre profil ne semble pas correspondre à cette offre d\'emploi.',
        suggestion: 'Veuillez essayer avec une offre plus proche de vos compétences et expériences actuelles.',
      });
      return;
    }

    // Then check for invented content
    if (!guardianResult.valid) {
      console.log('🚫 Guardian rejected CV - Invented content detected');
      console.log('Issues:', guardianResult.issues);

      res.status(400).json({
        success: false,
        error: 'CV_INTEGRITY_ISSUE',
        message: 'L\'optimisation a détecté des incohérences.',
        issues: guardianResult.issues,
        inventedItems: guardianResult.inventedItems,
      });
      return;
    }

    console.log('✅ Guardian validation passed - Profile relevant & CV integrity OK');

    // 5. Compute real stats
    const jobSkills = jobInfo?.skills || [];
    const stats = computeStats(validatedData, jobSkills);

    console.log(`📊 Stats: ${stats.keywordsMatched.length} keywords matched, ${stats.sectionsOptimized} sections optimized`);

    // 6. Generate New PDF
    const pdfGenStart = Date.now();
    console.log('📄 [STEP 6] Generating optimized PDF...');
    const outputFilename = `cv_optimized_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), 'uploads', outputFilename);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const generator = new ModernATS_CVGenerator(outputPath);
    await generator.generate(validatedData);
    timers['6_pdf_generation'] = Date.now() - pdfGenStart;
    console.log(`⏱️ PDF generation done in ${timers['6_pdf_generation']}ms`);

    // Log total time and breakdown
    const totalTime = Date.now() - totalStart;
    console.log('\n📊 ═══════════════════════════════════════');
    console.log('⏱️  PIPELINE TIMING SUMMARY');
    console.log('═══════════════════════════════════════');
    Object.entries(timers).sort().forEach(([step, time]) => {
      console.log(`   ${step}: ${time}ms`);
    });
    console.log('───────────────────────────────────────');
    console.log(`   TOTAL: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ CV optimized successfully!');
    console.log(`📊 Optimized for: ${jobInfo ? `"${jobInfo.title}" at ${jobInfo.company}` : 'General ATS optimization'}`);

    // 7. Read PDF and convert to base64
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfBase64 = pdfBuffer.toString('base64');

    // 8. Return JSON response with stats and PDF
    res.json({
      success: true,
      stats: {
        keywordsMatched: stats.keywordsMatched,
        keywordsCount: stats.keywordsMatched.length,
        sectionsOptimized: stats.sectionsOptimized,
        jobTitle: jobInfo?.title || null,
        jobCompany: jobInfo?.company || null,
      },
      pdf: {
        base64: pdfBase64,
        filename: `CV_Optimized${jobInfo?.company ? `_${jobInfo.company.replace(/\s+/g, '_')}` : ''}.pdf`,
      }
    });

    // Cleanup: delete file after sending (optional, keep for debugging)
    fs.unlink(outputPath, (err: Error | null) => {
      if (err) console.error('Error deleting temp file:', err);
    });

  } catch (error) {
    console.error('❌ Error processing CV:', error);
    res.status(500).send('Error processing CV');
  }
});

export default router;
