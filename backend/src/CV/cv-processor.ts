import OpenAI from 'openai';
import { z } from 'zod';
import pdfParse from 'pdf-parse';
import path from 'path';
import fs from 'fs';
import { ModernATS_CVGenerator } from './cv-creator';
import { convertPdfToImages } from '../utils/pdf-to-image';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
   * Returns the S3 URL to the generated PDF.
   */
  async generatePDF(data: CVData): Promise<string> {
    const validatedData = cvSchema.parse(data);
    const outputFilename = `cv_optimized_${Date.now()}.pdf`;
    
    // Generate PDF in memory
    const generator = new ModernATS_CVGenerator();
    const pdfBuffer = await generator.generate(validatedData);

    // Upload to S3
    const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'hackathon-cv-uploads';
    let region = (process.env.S3_REGION || process.env.AWS_REGION || 'eu-central-1').trim();
    
    // Force correct region for known bucket
    if (bucketName === 'hackathon-origin-42-school') {
        region = 'eu-north-1';
    }

    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    
    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: outputFilename,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        }));
        
        // Generate a presigned URL valid for 1 hour (3600 seconds)
        // const command = new GetObjectCommand({
        //     Bucket: bucketName,
        //     Key: outputFilename,
        // });

        // // Use a fresh, minimal client for signing to avoid unwanted middleware
        // const signerClient = new S3Client({
        //     region: region,
        //     credentials: {
        //         accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        //         secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
        //     },
        //     // Force signature v4 and disable checksums explicitly if possible via config
        // });
        
        // // Explicitly set signableHeaders to prevent AWS SDK from automatically adding x-amz-checksum-mode
        // // which causes signature mismatch when browser doesn't send it
        // const signedUrl = await getSignedUrl(signerClient, command, { 
        //     expiresIn: 3600,
        //     signableHeaders: new Set(['host'])
        // });
        
        // return signedUrl;

        // Return a simple proxy URL to avoid signature issues
        const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || 'https://nellie-unadopted-achingly.ngrok-free.dev';
        return `${baseUrl}/api/download-cv/${outputFilename}`;

    } catch (err) {
        console.error('Failed to upload CV to S3 or generate signed URL:', err);
        throw new Error('Failed to save generated CV.');
    }
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
