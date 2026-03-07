import * as pdfjsLib from 'pdfjs-dist';

// Robustly handle the import structure
// Some CDN ESM builds wrap the library in a 'default' property, while others export it directly.
const pdfjsModule = pdfjsLib as any;
const pdfjs = pdfjsModule.default?.getDocument ? pdfjsModule.default : pdfjsModule;

// Configure the worker
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Verify library is loaded
    if (typeof pdfjs.getDocument !== 'function') {
      console.error("PDFJS Library not loaded correctly. Exports:", pdfjsModule);
      throw new Error("PDF processing library failed to load. Please refresh.");
    }

    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them with spaces
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('fake worker')) {
        throw new Error("PDF worker failed. Please try a different browser or refresh.");
      }
      if (error.message.includes('Password')) {
        throw new Error("The PDF is password protected.");
      }
    }
    
    throw new Error("Failed to parse PDF. It might be an image-based scan.");
  }
};