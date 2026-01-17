import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CVProcessor } from './CV/cv-processor';
import fs from 'fs';

const router = Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

const processor = new CVProcessor();

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
    const outputPath = await processor.processCV(req.file.buffer);

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

// Route to handle PDF from URL
router.get('/from-url', async (req: Request, res: Response): Promise<void> => {
    const fileUrl = req.query.url as string;

    if (!fileUrl) {
        res.status(400).send('Missing url query parameter.');
        return;
    }

    try {
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            res.status(400).send(`Failed to fetch file from URL: ${response.statusText}`);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const outputPath = await processor.processCV(buffer);

        res.download(outputPath, 'CV_Optimized.pdf', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });
        });

    } catch (error) {
        console.error('Error processing CV from URL:', error);
        res.status(500).send('Error processing CV from URL');
    }
});

export default router;