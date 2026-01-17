import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { initDb } from './db';
import postCvRouter from './post-cv';
import waitlistRouter from './waitlist';
import jobRouter from './routes/job-route';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/cv', postCvRouter);
app.use('/api/waitlist', waitlistRouter);
app.use('/api/job', jobRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express Backend!');
});

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Backend API!' });
});

// Initialize database and start server
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`📍 Job scraping route: POST /api/job/scrape-job`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
