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
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const router = Router();

console.log('🚀 Initializing CV optimization route...');

// Initialize S3 Client
const region = (process.env.S3_REGION || process.env.AWS_REGION || 'eu-central-1').trim();
const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

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

// Schema for validation response with evidence-based format
const validationSchema = z.object({
  valid: z.boolean(),
  issues: z.array(z.string()).default([]),
  inventedItems: z.array(z.object({
    path: z.string(),
    value: z.string(),
    evidenceType: z.enum(['QUOTE', 'NOT_FOUND']),
    evidence: z.string(), // Verbatim quote from original CV, or "NOT FOUND"
  })).default([]),
});

// AI Guardian: Validates that the optimized CV doesn't contain invented information
async function validateCVIntegrity(
  originalText: string,
  optimizedData: z.infer<typeof cvSchema>,
  openaiClient: OpenAI
): Promise<{ valid: boolean; issues: string[]; inventedItems: Array<{ path: string; value: string; evidenceType: 'QUOTE' | 'NOT_FOUND'; evidence: string }> }> {
  console.log('🛡️ Running AI Guardian validation...');

  const validationPrompt = `Tu es un VALIDATEUR de CV optimisé. Tu dois distinguer les FAITS (strict) des éléments de STYLE/PERSONNALISATION (tolérant).

═══════════════════════════════════════════════════════════════
CV ORIGINAL
═══════════════════════════════════════════════════════════════
${originalText}

═══════════════════════════════════════════════════════════════
CV OPTIMISÉ (à valider)
═══════════════════════════════════════════════════════════════
${JSON.stringify(optimizedData, null, 2)}

═══════════════════════════════════════════════════════════════
🔴 FACTS - ÊTRE STRICT (rejeter si inventé)
═══════════════════════════════════════════════════════════════
Ces éléments DANS LES EXPÉRIENCES/ÉDUCATION doivent être vérifiables:
- Noms d'entreprises passées (dans experience[].company)
- Titres de poste passés (dans experience[].title)
- Dates et durées d'emploi
- Diplômes, certifications, formations
- Métriques chiffrées inventées (%, €, "augmenté de X%")
- Technologies/compétences NON présentes dans l'original
- Projets ou missions spécifiques inventés

⚠️ VIOLATION = inventer une expérience, entreprise, diplôme, ou métrique

═══════════════════════════════════════════════════════════════
🟢 STYLE/PERSONNALISATION - TOUJOURS ACCEPTER (JAMAIS REJETER)
═══════════════════════════════════════════════════════════════
Ces éléments sont des adaptations LÉGITIMES au poste visé:

✅ header.title → C'est le TITRE ACTUEL/VISÉ du candidat, PAS un poste passé!
   - PEUT être "Consultant Junior en Cybersécurité" même si ce n'était pas dans l'original
   - PEUT être "Développeur Fullstack" même si l'original disait "Développeur"
   - PEUT être adapté au poste visé → JAMAIS une violation
   - ⚠️ NE PAS CONFONDRE avec experience[].title qui sont les postes PASSÉS

✅ summary → Peut mentionner:
   - L'entreprise cible
   - Le poste visé
   - Des compétences SI elles existent dans le CV original
   - Des termes du secteur (logiciels embarqués, IA, cloud) SI liés aux skills existants

✅ Verbes d'action et reformulations professionnelles
✅ Ordre des expériences/skills réorganisé
✅ Regroupement par catégories

═══════════════════════════════════════════════════════════════
✅ IMPLICATIONS TECHNIQUES AUTORISÉES
═══════════════════════════════════════════════════════════════
- C/C++ → logiciels embarqués, systèmes OK
- TypeScript → JavaScript OK
- React/Vue/Angular → JavaScript, HTML, CSS OK
- Node.js → JavaScript, Backend OK
- Python → scripting, automatisation OK

═══════════════════════════════════════════════════════════════
⚠️ CE QUI N'EST PAS UNE VIOLATION
═══════════════════════════════════════════════════════════════
- header.title adapté au poste → OK
- summary qui mentionne l'entreprise cible → OK
- summary qui reformule les compétences existantes → OK
- Termes du domaine (embedded, cloud, etc.) SI skills de base présents → OK

═══════════════════════════════════════════════════════════════
FORMAT DE RÉPONSE
═══════════════════════════════════════════════════════════════
{
  "valid": true/false,
  "issues": ["description courte de chaque VRAIE violation"],
  "inventedItems": [
    {
      "path": "experience[0].company",
      "value": "Acme Corp",
      "evidenceType": "NOT_FOUND",
      "evidence": "NOT FOUND"
    }
  ]
}

RAPPEL CRITIQUE:
- header.title = titre ACTUEL/VISÉ → JAMAIS une violation, même s'il est différent de l'original
- summary personnalisé → JAMAIS une violation
- Seuls les FAITS inventés (expériences passées, entreprises, diplômes, métriques) sont des violations

Si tout est OK: {"valid": true, "issues": [], "inventedItems": []}`;

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
      console.log('🚨 Guardian returned empty response (fail-closed)');
      return { valid: false, issues: ['Guardian returned empty response'], inventedItems: [] };
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

    if (!validated.valid) {
      console.log('🚨 Guardian detected issues:', validated.issues);
      console.log('🚨 Invented items:', JSON.stringify(validated.inventedItems, null, 2));
    } else {
      console.log('✅ Guardian validation passed - No invented content detected');
    }

    return {
      valid: validated.valid,
      issues: validated.issues,
      inventedItems: validated.inventedItems || []
    };
  } catch (error) {
    console.error('🚨 Guardian validation error (fail-closed):', error);
    // FAIL-CLOSED: If Guardian fails, reject the CV for safety
    return {
      valid: false,
      issues: ['Guardian validation failed - rejecting for safety'],
      inventedItems: []
    };
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

Return valid JSON starting with {. Do not wrap in markdown code blocks. No explanations, no preambles.

${jobDescription ? `
🎯 OBJECTIF: Créer un CV UNIQUE et PERSONNALISÉ pour cette offre spécifique.

═══════════════════════════════════════════════════════════════
⚡ PERSONNALISATION OBLIGATOIRE - CHAQUE CV DOIT ÊTRE DIFFÉRENT
═══════════════════════════════════════════════════════════════

0️⃣ HEADER - PRÉSERVER LES COORDONNÉES COMPLÈTES
⚠️ CRITIQUE: Le champ "contact" doit contenir TOUTES les informations de contact du CV original:
- Email (OBLIGATOIRE si présent)
- Téléphone (OBLIGATOIRE si présent)
- LinkedIn (si présent)
- Adresse/Ville (si présente)
- GitHub/Portfolio (si présent)
Format: séparer par virgule ou retour ligne. Ex: "email@exemple.com, +33 6 12 34 56 78, Paris, linkedin.com/in/nom"

1️⃣ SUMMARY (SECTION LA PLUS IMPORTANTE)
Le summary DOIT être personnalisé mais BASÉ SUR LE CV ORIGINAL:
- Mentionner le type de poste visé et l'entreprise cible
- Mettre en avant les 2-3 compétences QUI EXISTENT DANS LE CV ORIGINAL et sont pertinentes pour cette offre
- ⚠️ NE PAS inventer de compétences ou termes techniques absents du CV original
- ⚠️ NE PAS ajouter "logiciels embarqués", "architectures matérielles", etc. sauf si EXPLICITEMENT dans le CV
- Ce summary doit être personnalisé mais HONNÊTE - ne mentionner que ce que le candidat sait vraiment faire

2️⃣ EXPÉRIENCES - ORDRE PAR PERTINENCE
- Réordonner les expériences: la PLUS PERTINENTE pour ce poste en PREMIER
- Pour chaque expérience, reformuler les tâches en mettant l'accent sur ce qui matche avec l'offre
- Si une expérience n'a aucun lien avec le poste → la mettre en dernier ou la résumer brièvement

3️⃣ SKILLS - FILTRAGE ET PRIORISATION
- ⚠️ UTILISER UNIQUEMENT CES NOMS DE CATÉGORIES COURTS (max 12 caractères):
  • "Langages" (pour les langages de programmation)
  • "Frameworks" (pour les frameworks/librairies)
  • "Outils" (pour les outils: Git, Docker, AWS, etc.)
  • "Langues" (pour les langues parlées: Français, Anglais, etc.)
  • "Autres" (pour tout le reste si nécessaire)
- Lister EN PREMIER les skills qui apparaissent dans l'offre
- Les skills non pertinents peuvent être omis

4️⃣ ADAPTATION DU VOCABULAIRE
- Utiliser les MÊMES TERMES que l'offre d'emploi
- Adapter le niveau de formalité au secteur (startup vs grand groupe)

═══════════════════════════════════════════════════════════════
🚫 INTERDICTIONS STRICTES (FACTS - ne jamais inventer)
═══════════════════════════════════════════════════════════════
❌ JAMAIS inventer des entreprises, postes ou missions qui n'existent pas dans l'original
❌ JAMAIS ajouter de métriques chiffrées (%, €, nombres, "augmenté de X%") non présentes
❌ JAMAIS inventer des certifications, diplômes ou formations
❌ JAMAIS ajouter une compétence technique si elle n'est pas dans le CV original OU une implication directe (voir liste ci-dessous)

═══════════════════════════════════════════════════════════════
✅ REFORMULATIONS AUTORISÉES (STYLE)
═══════════════════════════════════════════════════════════════
✅ RÉORGANISER l'ordre des expériences et skills
✅ VERBES D'ACTION: "j'ai fait" → "Développé", "Conçu", "Mis en œuvre"
✅ SYNONYMES PROFESSIONNELS: "mods" → "extensions logicielles"
✅ TITRES DESCRIPTIFS pour activités informelles: freelance → "Développeur Freelance", projets perso → "Projet Personnel"
✅ FUSIONNER des expériences similaires en une seule

═══════════════════════════════════════════════════════════════
✅ IMPLICATIONS TECHNIQUES AUTORISÉES (liste exhaustive)
═══════════════════════════════════════════════════════════════
Tu peux UNIQUEMENT ajouter ces skills si leur "source" est présente dans le CV:
- TypeScript → JavaScript (OK)
- React/Vue/Angular → JavaScript, HTML, CSS (OK)
- Node.js → JavaScript (OK)
- Études en France → Français langue maternelle (OK)
- Contexte pro anglais mentionné → Anglais professionnel (OK)

⚠️ INTERDICTIONS SPÉCIFIQUES:
- C/C++ seul NE PERMET PAS d'ajouter "logiciels embarqués", "systèmes embarqués", "architectures matérielles"
- Sauf si le CV mentionne explicitement du travail embedded/IoT/hardware

⚠️ TOUT AUTRE AJOUT DE SKILL EST INTERDIT si non présent explicitement.

═══════════════════════════════════════════════════════════════
CONTEXTE DE L'OFFRE
═══════════════════════════════════════════════════════════════
Poste visé: ${jobInfo?.title || 'le poste'}
Entreprise: ${jobInfo?.company || 'non spécifiée'}
Mots-clés PRIORITAIRES (à mettre en valeur SI LE CANDIDAT LES POSSÈDE): ${jobInfo?.skills.join(', ') || 'compétences techniques'}
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
    "name": "Prénom Nom",
    "title": "Titre adapté au poste",
    "contact": "email@exemple.com, +33 6 12 34 56 78, Paris, linkedin.com/in/nom"
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
    "Langages": ["JavaScript", "Python"],
    "Frameworks": ["React", "Node.js"],
    "Outils": ["Git", "Docker"],
    "Langues": ["Français", "Anglais"]
  }
}

CRITICAL REMINDER: Return ONLY the JSON object. No markdown. No explanations. Just the JSON.`
        },
        {
          role: 'user',
          content: userMessageContent,
        },
      ],
      temperature: 0.15, // Low for reliability, variety comes from instructions
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

    // 4. AI Guardian - Validate CV integrity (strict mode - no auto-correction)
    const guardianStart = Date.now();
    console.log('🛡️ [STEP 5] Guardian validation...');
    const guardianResult = await validateCVIntegrity(textContent, validatedData, openai);
    timers['5_guardian'] = Date.now() - guardianStart;
    console.log(`⏱️ Guardian done in ${timers['5_guardian']}ms`);

    if (!guardianResult.valid) {
      console.log('🚫 Guardian rejected CV - integrity issues detected');
      console.log('Issues:', guardianResult.issues);
      console.log('Invented items:', JSON.stringify(guardianResult.inventedItems, null, 2));

      // Determine error type for better UX
      const isSystemError = guardianResult.issues.some(i =>
        i.includes('failed') || i.includes('empty response')
      );

      if (isSystemError) {
        res.status(500).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Une erreur est survenue lors de la validation. Veuillez réessayer.',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'CV_INTEGRITY_ISSUE',
          message: 'Cette offre semble trop éloignée de ton profil actuel. Essaie avec un poste plus proche de tes compétences.',
          // Don't expose details to user, but log them server-side
        });
      }
      return;
    }

    console.log('✅ Guardian validation passed');

    // 5. Compute real stats
    const jobSkills = jobInfo?.skills || [];
    const stats = computeStats(validatedData, jobSkills);

    console.log(`📊 Stats: ${stats.keywordsMatched.length} keywords matched, ${stats.sectionsOptimized} sections optimized`);

    // 6. Generate New PDF
    const pdfGenStart = Date.now();
    console.log('📄 [STEP 6] Generating optimized PDF...');
    
    // In-memory generation
    const generator = new ModernATS_CVGenerator();
    const pdfBuffer = await generator.generate(validatedData);
    timers['6_pdf_generation'] = Date.now() - pdfGenStart;
    console.log(`⏱️ PDF generation done in ${timers['6_pdf_generation']}ms`);

    // 7. Upload to S3
    const uploadStart = Date.now();
    console.log('☁️ [STEP 7] Uploading to AWS S3...');
    const outputFilename = `cv_optimized_${Date.now()}.pdf`;
    
    const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'hackathon-cv-uploads';

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: outputFilename,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        }));
        timers['7_s3_upload'] = Date.now() - uploadStart;
        console.log(`⏱️ S3 upload done in ${timers['7_s3_upload']}ms`);
    } catch (err) {
        console.error('❌ Failed to upload to S3:', err);
        // Continue to return the PDF even if upload fails
    }

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

    // 8. Return JSON response with stats and PDF
    const pdfBase64 = pdfBuffer.toString('base64');

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

  } catch (error) {
    console.error('❌ Error processing CV:', error);
    res.status(500).send('Error processing CV');
  }
});

export default router;
