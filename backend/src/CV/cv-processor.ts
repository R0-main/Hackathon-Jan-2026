import OpenAI from 'openai';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import path from 'path';
import fs from 'fs';
import { ModernATS_CVGenerator } from './cv-creator';
import { convertPdfToImages } from '../utils/pdf-to-image';

// Initialize OpenAI client for Blackbox AI
const openai = new OpenAI({
  baseURL: 'https://api.blackbox.ai',
  apiKey: process.env.BLACK_BOX_API_KEY || 'YOUR_API_KEY',
});

// Zod Schema for CV data
export const cvSchema = z.object({
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

export type CVData = z.infer<typeof cvSchema>;

export class CVProcessor {
  /**
   * Generates a PDF from the provided CV data JSON.
   * Returns the path to the generated PDF.
   */
  async generatePDF(data: CVData): Promise<string> {
    const validatedData = cvSchema.parse(data);

    const outputFilename = `cv_optimized_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), 'public/assets', outputFilename); // Saved in public/assets folder
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const generator = new ModernATS_CVGenerator(outputPath);
    await generator.generate(validatedData);

    return outputPath;
  }

  /**
   * Processes a PDF buffer, extracts info, calls AI, and generates a new PDF.
   * Returns the path to the generated PDF.
   */
  async processCV(pdfBuffer: Buffer): Promise<string> {
    // 1. Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const textContent = pdfData.text;

    // Convert PDF to images
    let images: string[] = [];
    try {
      images = await convertPdfToImages(pdfBuffer);
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
        throw new Error(`AI response was not valid JSON: ${cleanJson}`);
    }

    // 4. Generate New PDF using the refactored method
    return await this.generatePDF(parsedData);
  }
}
