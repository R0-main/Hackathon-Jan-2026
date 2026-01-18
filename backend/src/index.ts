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

const app = express();
const port = process.env.BACKEND_PORT || 3000;

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

// JSON Parser for other routes
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