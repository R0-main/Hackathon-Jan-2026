import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { CVProcessor, cvSchema } from "./CV/cv-processor";
import fs from "fs";
import path from "path";

export const mcpServer = new McpServer({
  name: "CV Helper",
  version: "1.0.0",
});

const processor = new CVProcessor();

mcpServer.tool(
  "create_optimized_cv",
  "Generates an optimized CV PDF from structured data without AI processing.",
  cvSchema.shape,
  async (args) => {
    try {
        const outputPath = await processor.generatePDF(args);
        
        // Construct a URL for the generated file
        const filename = path.basename(outputPath);
        const baseUrl = process.env.BASE_URL || `https://hackathon-jan-2026-backend.onrender.com`;
        const downloadUrl = `${baseUrl}/outputs/${filename}`;
        
        return {
          content: [
            {
              type: "text",
              text: `CV generated successfully! You can download it here: ${downloadUrl}`,
            },
          ],
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

mcpServer.tool(
  "save_file",
  "Saves a file from the chat to the server. Can save text directly, decode base64, or download from a URL.",
  {
    filename: z.string().describe("The name of the file to save"),
    content: z.string().describe("The file content (text), base64 string, or URL"),
    source_type: z.enum(["text", "base64", "url"]).default("text").describe("The type of the source content"),
  },
  async ({ filename, content, source_type }) => {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, path.basename(filename));
    
    try {
      if (source_type === "url") {
        const response = await fetch(content);
        if (!response.ok) {
           throw new Error(`Failed to download file from URL: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      } else if (source_type === "base64") {
        const buffer = Buffer.from(content, "base64");
        fs.writeFileSync(filePath, buffer);
      } else {
        // Default to text
        fs.writeFileSync(filePath, content, "utf-8");
      }
      
      console.log(`[MCP SAVE] Saved file to ${filePath} (source: ${source_type})`);

      return {
        content: [
          {
            type: "text",
            text: `File '${filename}' saved successfully to ${filePath}`,
          },
        ],
      };
    } catch (error: any) {
      console.error(`[MCP SAVE ERROR] ${error.message}`);
      return {
        content: [
          {
            type: "text",
            text: `Failed to save file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

