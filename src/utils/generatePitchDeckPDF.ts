import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export interface PDFGeneratorOptions {
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  onProgress?: (current: number, total: number) => void;
}

export const generatePitchDeckPDF = async ({
  totalSlides,
  setCurrentSlide,
  onProgress
}: PDFGeneratorOptions): Promise<void> => {
  // Create PDF with 16:9 landscape aspect ratio
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167] // A4-ish 16:9 aspect
  });

  const pageWidth = 297;
  const pageHeight = 167;

  try {
    for (let i = 0; i < totalSlides; i++) {
      // Navigate to slide
      setCurrentSlide(i);
      
      // Wait for animation and render to complete
      await new Promise(resolve => setTimeout(resolve, 600));

      onProgress?.(i + 1, totalSlides);

      // Find the slide element
      const slideElement = document.querySelector('[data-slide]') as HTMLElement;
      
      if (!slideElement) {
        console.error(`Slide ${i + 1} not found`);
        continue;
      }

      // Capture slide as high-res canvas
      const canvas = await html2canvas(slideElement, {
        scale: 2, // 2x resolution for crisp output
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: slideElement.offsetWidth,
        height: slideElement.offsetHeight
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add new page for slides after the first
      if (i > 0) {
        pdf.addPage([pageWidth, pageHeight], 'landscape');
      }

      // Add image to PDF, filling the entire page
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }

    // Save the PDF
    pdf.save('Lifetrek_Medical_Pitch_Deck.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
