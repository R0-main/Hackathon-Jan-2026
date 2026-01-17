import puppeteer from 'puppeteer';

export async function convertPdfToImages(pdfBuffer: Buffer): Promise<string[]> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Convert buffer to base64 to pass to browser
    const pdfBase64 = pdfBuffer.toString('base64');

    // We will run the logic inside the browser
    const images = await page.evaluate(async (pdfData) => {
      // Helper to load script
      function loadScript(src: string) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Load PDF.js
      // We use a specific version from CDN
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      
      // @ts-ignore
      const pdfjsLib = window['pdfjsLib'];
      if (!pdfjsLib) {
          throw new Error('PDF.js not loaded correctly');
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // Load Document
      // atob decodes base64 string to binary string
      const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const extractedImages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for good quality for AI
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
            
            // Return full data URL
            extractedImages.push(canvas.toDataURL('image/jpeg', 0.8));
        }
      }
      return extractedImages;
    }, pdfBase64);

    return images;

  } catch (error) {
    console.error('Error converting PDF to images:', error);
    // Return empty array or throw, depending on how we want to handle it.
    // If conversion fails, we might still want to proceed with just text.
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
