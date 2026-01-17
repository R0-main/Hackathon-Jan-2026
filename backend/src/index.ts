import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import postCvRouter from './post-cv';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/cv', postCvRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express Backend!');
});

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Backend API!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
