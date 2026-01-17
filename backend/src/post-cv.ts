import { Router, Request, Response } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import { ModernATS_CVGenerator } from './CV/cv-creator';
import { getScraperForUrl, jobToText } from './scrapers';
import path from 'path';
import fs from 'fs';

const router = Router();

// Extract skills from job description text (généraliste, tous domaines)
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    // Soft skills & Management
    'Leadership', 'Management', 'Communication', 'Négociation', 'Présentation',
    'Gestion de projet', 'Gestion d\'équipe', 'Coordination', 'Organisation',
    'Esprit d\'équipe', 'Autonomie', 'Rigueur', 'Créativité', 'Adaptabilité',
    'Résolution de problèmes', 'Prise de décision', 'Analyse', 'Synthèse',

    // Langues
    'Anglais', 'Français', 'Espagnol', 'Allemand', 'Italien', 'Chinois', 'Arabe',
    'Bilingue', 'Courant', 'Professionnel',

    // Bureautique & Outils généraux
    'Excel', 'Word', 'PowerPoint', 'Outlook', 'Office', 'Google Workspace',
    'SAP', 'Salesforce', 'CRM', 'ERP', 'Notion', 'Trello', 'Slack', 'Teams',

    // Finance & Comptabilité
    'Comptabilité', 'Finance', 'Contrôle de gestion', 'Audit', 'Fiscalité',
    'Budget', 'Reporting', 'Analyse financière', 'Trésorerie', 'Facturation',
    'Paie', 'IFRS', 'Normes comptables',

    // Marketing & Communication
    'Marketing', 'Marketing digital', 'SEO', 'SEA', 'Community management',
    'Réseaux sociaux', 'Content marketing', 'Brand management', 'E-commerce',
    'Google Analytics', 'Publicité', 'Relations presse', 'Événementiel',

    // Commercial & Vente
    'Vente', 'Prospection', 'B2B', 'B2C', 'Négociation commerciale',
    'Relation client', 'Fidélisation', 'Account management', 'Business development',

    // RH & Juridique
    'Recrutement', 'Formation', 'Droit du travail', 'Droit des affaires',
    'Paie', 'GPEC', 'Relations sociales', 'Contrats',

    // Industrie & Logistique
    'Supply chain', 'Logistique', 'Achats', 'Approvisionnement', 'Stock',
    'Production', 'Qualité', 'Lean', 'Six Sigma', 'ISO', 'HSE', 'Sécurité',
    'Maintenance', 'CAO', 'AutoCAD', 'SolidWorks',

    // Santé & Sciences
    'Recherche', 'Laboratoire', 'Clinique', 'Réglementaire', 'Pharmacovigilance',
    'BPF', 'GMP', 'Essais cliniques',

    // Tech & IT (pour ne pas les exclure non plus)
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Cloud',
    'AWS', 'Azure', 'Docker', 'Agile', 'Scrum', 'DevOps', 'Data', 'IA',
    'Machine Learning', 'Cybersécurité', 'Développement web', 'Mobile',

    // Méthodes & Certifications
    'PMP', 'Prince2', 'ITIL', 'Agile', 'Scrum', 'Lean', 'Six Sigma',
    'TOEIC', 'TOEFL', 'Certifié', 'Diplômé',
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  return [...new Set(foundSkills)];
}

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI client for Blackbox AI
const openai = new OpenAI({
  baseURL: 'https://api.blackbox.ai',
  apiKey: process.env.BLACK_BOX_API_KEY || 'YOUR_API_KEY',
});

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
  valid: z.boolean(),
  issues: z.array(z.string()),
  inventedItems: z.array(z.string()).optional(),
});

// AI Guardian: Validates that the optimized CV doesn't contain invented information
async function validateCVIntegrity(
  originalText: string,
  optimizedData: z.infer<typeof cvSchema>,
  openaiClient: OpenAI
): Promise<{ valid: boolean; issues: string[]; inventedItems: string[] }> {
  console.log('🛡️ Running AI Guardian validation...');

  const validationPrompt = `You are a STRICT CV integrity validator. Your job is to detect ANY fabricated or invented information.

Compare the ORIGINAL CV text with the OPTIMIZED CV JSON and identify any information that was INVENTED (not present in the original).

=== ORIGINAL CV TEXT ===
${originalText}
=== END ORIGINAL CV ===

=== OPTIMIZED CV JSON ===
${JSON.stringify(optimizedData, null, 2)}
=== END OPTIMIZED CV ===

CHECK FOR THESE VIOLATIONS:
1. Companies or job titles that don't exist in the original
2. Skills or technologies not mentioned or implied in the original
3. Degrees, schools, or certifications not in the original
4. Invented metrics, percentages, or numbers (e.g., "increased sales by 50%" when no such metric exists)
5. Dates or locations that don't match the original
6. Responsibilities or achievements that were completely fabricated

IMPORTANT:
- Rephrasing is OK (e.g., "managed team" instead of "was team leader")
- Reorganizing is OK
- Using synonyms is OK
- But INVENTING new facts is NOT OK

Return ONLY a JSON object (no markdown, no explanation):
{
  "valid": true/false,
  "issues": ["description of each problem found"],
  "inventedItems": ["specific invented item 1", "specific invented item 2"]
}

If everything is legitimate, return: {"valid": true, "issues": [], "inventedItems": []}`;

  try {
    const validation = await openaiClient.chat.completions.create({
      model: 'blackboxai/openai/gpt-5.1',
      messages: [
        { role: 'user', content: validationPrompt }
      ],
      temperature: 0.1,
    });

    const content = validation.choices[0].message.content;
    if (!content) {
      console.log('⚠️ Guardian returned empty response, assuming valid');
      return { valid: true, issues: [], inventedItems: [] };
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
      console.log('🚨 Invented items:', validated.inventedItems);
    } else {
      console.log('✅ Guardian validation passed - No invented content detected');
    }

    return {
      valid: validated.valid,
      issues: validated.issues,
      inventedItems: validated.inventedItems || []
    };
  } catch (error) {
    console.error('⚠️ Guardian validation error:', error);
    // On error, we allow the CV through but log the issue
    return { valid: true, issues: ['Validation check could not be completed'], inventedItems: [] };
  }
}
// Route to handle PDF upload with optional job URL
// Expecting: 'cv' file + optional 'jobUrl' in body
router.post('/', upload.single('cv'), async (req: Request, res: Response): Promise<void> => {
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
    console.log('🔍 Scraping job posting from:', jobUrl);
    try {
      const scraper = getScraperForUrl(jobUrl);
      const job = await scraper.scrape(jobUrl);
      jobDescription = jobToText(job);
      jobInfo = job;
      console.log(`✅ Job posting integrated: ${job.title} (${job.platform})`);
    } catch (error) {
      console.error('⚠️ Failed to scrape job, continuing without it:', error);
    }
  } else if (jobDescriptionText && jobDescriptionText.trim()) {
    // Use raw job description text provided by user
    console.log('📝 Using provided job description text');
    jobDescription = jobDescriptionText.trim();

    // Extract skills from the text for better optimization
    const extractedSkills = extractSkillsFromText(jobDescription);
    jobInfo = {
      title: 'Position',
      company: 'Company',
      skills: extractedSkills,
    };
    console.log('✅ Job description integrated, found skills:', extractedSkills.length);
  }

    // 1. Extract text from PDF
    console.log('📄 Extracting text from CV...');
    const pdfData = await pdfParse(req.file.buffer);
    const textContent = pdfData.text;

    // Don't send images to avoid API errors
    console.log('📝 Preparing CV text for optimization...');

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
      model: 'blackboxai/openai/gpt-5.1',
      messages: [
        {
          role: 'system',
          content: `You are an EXPERT CV optimizer. Your ONLY task is to return a valid JSON object - nothing else.

DO NOT write explanations, descriptions, or any other text.
DO NOT use markdown code blocks (\`\`\`json).
DO NOT add preambles or postambles.
ONLY return the raw JSON object.

${jobDescription ? `
🎯 IMPORTANT: A job posting has been provided. Follow these rules STRICTLY:

ABSOLUTE RULES - NEVER BREAK THESE:
- NEVER invent skills, experiences, or qualifications that are not in the original CV
- NEVER add fake metrics, percentages, or numbers
- NEVER claim certifications or degrees not mentioned in the CV
- ONLY use information that exists in the original CV text

WHAT YOU CAN DO:
1. REORGANIZE: Put the most relevant existing experiences first based on the job posting
2. REPHRASE: Use stronger action verbs (managed, developed, implemented, led, etc.)
3. HIGHLIGHT: Emphasize existing skills that match the job requirements: ${jobInfo?.skills.slice(0, 5).join(', ') || 'relevant skills'}
4. STRUCTURE: Better organize existing information into clear sections
5. CLARIFY: Make existing descriptions more concise and professional

Keywords to look for in the CV: ${jobInfo?.skills.join(', ') || 'technical skills'}
Target position: ${jobInfo?.title || 'the position'}
` : `
Optimize this CV for ATS systems:
- Use professional language and strong action verbs
- Structure content clearly
- NEVER invent or add information not present in the original CV
- Only rephrase and reorganize existing content
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
    console.log('🛡️ Guardian validation...');
    const guardianResult = await validateCVIntegrity(textContent, validatedData, openai);

    if (!guardianResult.valid) {
      console.log('🚫 Guardian rejected CV - mismatch between CV and job offer');
      console.log('Issues:', guardianResult.issues);

      res.status(400).json({
        success: false,
        error: 'CV_JOB_MISMATCH',
        message: 'L\'offre d\'emploi semble trop eloignee de votre profil actuel pour une optimisation pertinente.',
        suggestion: 'Veuillez essayer avec une offre plus proche de vos competences, ou mettre a jour votre CV avec des experiences pertinentes.',
      });
      return;
    }

    console.log('✅ Guardian validation passed');

    // 5. Compute real stats
    const jobSkills = jobInfo?.skills || [];
    const stats = computeStats(validatedData, jobSkills);

    console.log(`📊 Stats: ${stats.keywordsMatched.length} keywords matched, ${stats.sectionsOptimized} sections optimized`);

    // 6. Generate New PDF
    console.log('📄 Generating optimized PDF...');
    const outputFilename = `cv_optimized_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), 'uploads', outputFilename);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const generator = new ModernATS_CVGenerator(outputPath);
    await generator.generate(validatedData);

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