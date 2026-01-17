import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postCvRouter from './post-cv';
import waitlistRouter from './waitlist';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/cv', postCvRouter);
app.use('/api/waitlist', waitlistRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express Backend!');
});

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Backend API!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
