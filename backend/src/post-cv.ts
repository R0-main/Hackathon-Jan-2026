import { Router, Request, Response } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import { ModernATS_CVGenerator } from './CV/cv-creator';
import { convertPdfToImages } from './utils/pdf-to-image';
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
    // clean job description to extract only 

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

IMPORTANT: Tailor this resume specifically for the job posting above. Match keywords, highlight relevant skills, and align experience with requirements.
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
🎯 CRITICAL: A job posting has been provided. You MUST:
1. Use exact keywords from the job description: ${jobInfo?.skills.join(', ') || 'technical skills'}
2. Highlight skills that match: ${jobInfo?.skills.slice(0, 5).join(', ') || 'relevant skills'}
3. Rewrite experience to align with job requirements for: ${jobInfo?.title || 'the position'}
4. Prioritize relevant experience first
5. Add metrics where possible (percentages, numbers, impact)

You must rework the explaination of the CV Experience to better fit the job description provided. You must round the edges and addapt the CV the best you can to the job description.
` : `
Optimize this CV for ATS systems with professional language and strong action verbs.
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
    console.log('jobs infos:', jobInfo, jobDescription);

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

    // 4. Generate New PDF
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

    // 5. Return the file (and keep it on server)
    res.download(outputPath, `CV_Optimized${jobInfo ? `_${jobInfo.company.replace(/\s+/g, '_')}` : ''}.pdf`, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        } else {
            console.log('✅ File sent successfully (kept in uploads/)');
        }
    });

  } catch (error) {
    console.error('❌ Error processing CV:', error);
    res.status(500).send('Error processing CV');
  }
});

export default router;