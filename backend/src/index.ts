import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { initDb } from './db';
import postCvRouter from './post-cv';
import waitlistRouter from './waitlist';
import jobRouter from './routes/job-route';

import { mcpServer } from './mcp-server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const app = express();
const port = process.env.BACKEND_PORT || 3000;

// Initialize S3 Client for proxy
const s3Client = new S3Client({
  region: (process.env.S3_REGION || process.env.AWS_REGION || 'eu-central-1').trim(),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Keep frontend alive by pinging every 5 minutes
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://hackathon-jan-2026.onrender.com';
const keepFrontendAlive = () => {
  fetch(FRONTEND_URL).catch(() => {});
};
keepFrontendAlive();
setInterval(keepFrontendAlive, 5 * 60 * 1000);

app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the 'outputs' directory
app.use('/outputs', express.static(path.join(process.cwd(), 'outputs')));

// Serve frontend assets
app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));

// MCP Server Integration using StreamableHTTPServerTransport (Stateless/Webhook style)
app.post('/api/mcp', express.json(), async (req: Request, res: Response) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.post('/mcp', express.json(), async (req: Request, res: Response) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});


// JSON Parser for other routes
app.use(express.json());

app.use('/api/cv', postCvRouter);
app.use('/api/waitlist', waitlistRouter);
app.use('/api/job', jobRouter);

app.get('/api/download-cv/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params;
  
  if (typeof filename !== 'string') {
    res.status(400).send('Invalid filename format');
    return;
  }

  const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'hackathon-cv-uploads';

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    const response = await s3Client.send(command);

    if (response.Body) {
      res.setHeader('Content-Type', response.ContentType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Stream the S3 response body to the express response
      // @ts-ignore - S3 body types can be complex, but it is a readable stream in Node
      (response.Body as Readable).pipe(res);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error fetching file from S3:', error);
    res.status(500).send('Error fetching file');
  }
});

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