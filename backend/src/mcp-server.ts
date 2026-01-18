import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { CVProcessor, cvSchema } from "./CV/cv-processor";
import { getScraperForUrl, jobToText } from "./scrapers/index";
import fs from "fs";
import path from "path";

export const mcpServer = new McpServer({
  name: "CV Helper",
  version: "1.0.0",
});

const processor = new CVProcessor();

// Register the CV Widget resource
const cvHtmlPath = path.join(process.cwd(), 'public/index.html');

mcpServer.registerResource(
  "cv-widget",
  "ui://widget/cv.html",
  z.any(),
  async (uri) => {
    let cvHtmlContent = "";
    try {
        if (fs.existsSync(cvHtmlPath)) {
            cvHtmlContent = fs.readFileSync(cvHtmlPath, "utf-8");
        } else {
            cvHtmlContent = "<h1>CV Widget</h1><p>Widget not found.</p>";
        }
    } catch (e) {
        cvHtmlContent = "<h1>Error loading widget</h1>";
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: cvHtmlContent,
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "create_optimized_cv",
  {
    description: "Generates an optimized CV PDF from structured data without AI processing.",
    inputSchema: cvSchema.shape,
    _meta: {
      "openai/outputTemplate": "ui://widget/cv.html",
      "openai/toolInvocation/invoking": "Generating CV...",
      "openai/toolInvocation/invoked": "CV Generated",
    },
  },
  async (args) => {
    try {
        const outputPath = await processor.generatePDF(args);
        
        // Construct a URL for the generated file
        const filename = path.basename(outputPath);
        const baseUrl = process.env.BASE_URL || `http://localhost:3000`;
        const downloadUrl = `${baseUrl}/outputs/${filename}`;
        
        return {
          content: [
            {
              type: "text",
              text: `# Here is your optimized CV\n\nYou can download it here: 📥 ${downloadUrl}`,
            },
          ],
          structuredContent: {
            downloadUrl: downloadUrl,
            message: "Your CV is optimized using react"
          }
        };
    } catch (error: any) {
        console.error(`[MCP ERROR] ${error.message}`);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to generate CV: ${error.message}`,
                }
            ],
            isError: true
        }
    }
  }
);

mcpServer.registerTool(
  "fetch_job_data",
  {
    description: "Fetches job posting data from LinkedIn, Indeed, or Welcome to the Jungle URLs. Returns structured job information including title, company, requirements, and skills.",
    inputSchema: {
      url: z.string().url().describe("The URL of the job posting to fetch"),
    },
  },
  async ({ url }) => {
    try {
      const scraper = getScraperForUrl(url);
      const jobData = await scraper.scrape(url);
      
      console.log(`[MCP FETCH JOB] Successfully fetched job from ${jobData.platform}: ${jobData.title}`);
      
      // Format the job data as text for the LLM
      const jobText = jobToText(jobData);
      
      return {
        content: [
          {
            type: "text",
            text: `# 📋 Job Posting Fetched\n\n${jobText}`,
          },
        ],
        structuredContent: jobData as unknown as Record<string, unknown>,
      };
    } catch (error: any) {
      console.error(`[MCP FETCH JOB ERROR] ${error.message}`);
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to fetch job data: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);


