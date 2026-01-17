import { Router, Request, Response } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { z } from 'zod';
import { PDFParse } from 'pdf-parse';
import { ModernATS_CVGenerator } from './CV/cv-creator';
import { convertPdfToImages } from './utils/pdf-to-image';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI client for Blackbox AI
const openai = new OpenAI({
  baseURL: 'https://api.blackbox.ai',
  apiKey: process.env.BLACK_BOX_API_KEY || 'YOUR_API_KEY', // Fallback to avoid crash if env not set, but won't work
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

// Route to handle PDF upload
// Expecting the file field name to be 'cv'
router.post('/', upload.single('cv'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Check if it is a PDF
  if (req.file.mimetype !== 'application/pdf') {
     res.status(400).send('Only PDF files are allowed.');
     return;
  }

  try {
    // 1. Extract text from PDF
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const textContent = pdfData.text;

    // Convert PDF to images
    let images: string[] = [];
    try {
      images = await convertPdfToImages(req.file.buffer);
    } catch (err) {
      console.error('Failed to convert PDF to images, proceeding with text only:', err);
    }

    const userMessageContent: any[] = [
      { type: "text", text: `Here is the resume text:\n\n${textContent}` }
    ];

    images.forEach(image => {
      userMessageContent.push({
        type: "image_url",
        image_url: {
          url: image
        }
      });
    });

    // 2. Send to Blackbox AI
    const completion = await openai.chat.completions.create({
      model: 'blackboxai/openai/gpt-5.1',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that parses resumes and extracts structured data. 
          You must return ONLY a valid JSON object matching the following structure exactly. Do not add markdown formatting like 
          
          Structure example:
          {
            "header": {
                "name": "Jean TEST",
                "title": "Lead Développeur Python",
                "contact": "jean@email.com • 06 00 00 00 00 • Paris"
            },
            "summary": "Développeur expérimenté...",
            "experience": [
                {
                    "title": "Lead Developer",
                    "company": "TechCorp",
                    "location": "Paris",
                    "dates": "2020 - Présent",
                    "description": "Supervision technique...",
                    "tasks": ["Conception d'architectures...", "Mise en place de Docker..."]
                }
            ],
            "education": [ { "degree": "Master Informatique", "school": "Université Paris-Saclay", "year": "2018" } ],
            "skills": {
                "Langages": ["Python", "JavaScript"],
                "DevOps": ["Docker", "CI/CD"]
            }
          }
          `
        },
        {
          role: 'user',
          content: userMessageContent as any,
        },
      ],
      temperature: 0.1, // Low temperature for consistent formatting
    });

    const aiContent = completion.choices[0].message.content;

    if (!aiContent) {
        throw new Error('No content received from AI');
    }

    // 3. Parse and Validate JSON
    const cleanJson = aiContent.replace(/```json\n?|\n?```/g, '').trim();
    
    let parsedData;
    try {
        parsedData = JSON.parse(cleanJson);
    } catch (e) {
        console.error('Failed to parse JSON from AI:', cleanJson);
        res.status(500).json({ error: 'AI response was not valid JSON', raw: cleanJson });
        return;
    }

    const validatedData = cvSchema.parse(parsedData);

    // 4. Generate New PDF
    const outputFilename = `cv_optimized_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), outputFilename);
    const generator = new ModernATS_CVGenerator(outputPath);
    
    await generator.generate(validatedData);

    // 5. Return the file
    res.download(outputPath, 'CV_Optimized.pdf', (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
        // Cleanup file after sending
        fs.unlink(outputPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });
    });

  } catch (error) {
    console.error('Error processing CV:', error);
    res.status(500).send('Error processing CV');
  }
});

export default router;