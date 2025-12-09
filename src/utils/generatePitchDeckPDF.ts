import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { flushSync } from 'react-dom';

export interface PDFGeneratorOptions {
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  onProgress?: (current: number, total: number) => void;
  disableAnimations?: () => void;
  enableAnimations?: () => void;
}

// Wait for DOM to fully update and render
const waitForDOMUpdate = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => {
    // First wait for React to flush
    requestAnimationFrame(() => {
      // Then wait for paint
      requestAnimationFrame(() => {
        // Then add buffer time for images/fonts
        setTimeout(resolve, ms);
      });
    });
  });
};

export const generatePitchDeckPDF = async ({
  totalSlides,
  setCurrentSlide,
  onProgress,
  disableAnimations,
  enableAnimations
}: PDFGeneratorOptions): Promise<void> => {
  // Disable animations for clean capture
  disableAnimations?.();
  
  // Wait for animation disable to take effect
  await waitForDOMUpdate(100);
  
  // Create PDF with 16:9 landscape aspect ratio
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167] // 16:9 aspect ratio
  });

  const pageWidth = 297;
  const pageHeight = 167;

  try {
    for (let i = 0; i < totalSlides; i++) {
      // Use flushSync to force synchronous React render
      flushSync(() => {
        setCurrentSlide(i);
      });
      
      // Wait for DOM to fully update (images, fonts, styles)
      await waitForDOMUpdate(400);

      onProgress?.(i + 1, totalSlides);

      // Find the slide element
      const slideElement = document.querySelector('[data-slide]') as HTMLElement;
      
      if (!slideElement) {
        console.error(`Slide ${i + 1} not found`);
        continue;
      }

      // Capture slide as high-res canvas
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: slideElement.offsetWidth,
        height: slideElement.offsetHeight,
        onclone: (clonedDoc) => {
          // Remove any animation classes from cloned document
          const clonedSlide = clonedDoc.querySelector('[data-slide]');
          if (clonedSlide) {
            clonedSlide.classList.add('pdf-export-mode');
          }
        }
      });

      // Convert canvas to image data with JPEG for smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Add new page for slides after the first
      if (i > 0) {
        pdf.addPage([pageWidth, pageHeight], 'landscape');
      }

      // Add image to PDF - fill entire page
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, `slide_${i}`, 'MEDIUM');
    }

    // Save the PDF
    pdf.save('Lifetrek_Medical_Pitch_Deck.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Re-enable animations
    enableAnimations?.();
  }
};
