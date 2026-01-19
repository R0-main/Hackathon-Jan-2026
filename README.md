# Hack Your CV 🚀

**Hack Your CV** is an intelligent tool designed to optimize your resume for specific job applications. By analyzing your existing CV against a job description, it generates a tailored, keyword-optimized PDF that maximizes your chances of passing Applicant Tracking Systems (ATS) and catching recruiters' eyes.

🌐 **Try it now:** [hackyourcv.fr](https://hackyourcv.fr)

![Diagram](assets/diagrame.png)

## ✨ Features

- **📄 CV Upload:** Easily upload your existing PDF resume.
- **🎯 Job Targeting:** Paste a job description or provide a link (LinkedIn, Indeed, Welcome to the Jungle).
- **🤖 AI Optimization:** Our engine analyzes the job requirements and your profile to highlight relevant skills and keywords.
- **🛡️ Integrity Check:** Ensures the generated CV remains truthful to your actual experience while being optimized.
- **👀 Live Preview:** Review and validate the changes before downloading your new CV.

## 🤖 MCP Server & ChatGPT App

This project exposes a **Model Context Protocol (MCP) Server**, allowing AI agents to interact directly with our CV optimization engine.

### ChatGPT App Integration
We have a dedicated **ChatGPT App** that leverages this MCP server. This allows you to:
1.  **Chat with your CV:** Ask questions about how your profile matches a specific job.
2.  **Automated Optimization:** Ask ChatGPT to "optimize my CV for this job link," and it will fetch the job details and generate the optimized PDF directly within the chat interface.
3.  **Job Analysis:** Get detailed insights on job postings and gap analysis for your profile.

The MCP server provides tools like:
- `fetch_job_data`: To extract structured data from job URLs.
- `create_optimized_cv`: To generate the final PDF based on the analyzed data.

## 🚀 Getting Started

Visit [hackyourcv.fr](https://hackyourcv.fr) to start optimizing your CV today!
