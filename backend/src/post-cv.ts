import { Router, Request, Response } from 'express';
import multer from 'multer';

const router = Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle PDF upload
// Expecting the file field name to be 'cv'
router.post('/', upload.single('cv'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Check if it is a PDF
  if (req.file.mimetype !== 'application/pdf') {
     res.status(400).send('Only PDF files are allowed.');
     return;
  }

  console.log('Received file:', req.file.originalname);
  console.log('Size:', req.file.size);
  // File buffer is available in req.file.buffer

  res.send('CV received successfully');
});

export default router;
