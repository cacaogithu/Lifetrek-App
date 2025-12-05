import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGeneratorOptions {
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  onProgress?: (current: number, total: number) => void;
  disableAnimations?: () => void;
  enableAnimations?: () => void;
}

// Wait for slide to be fully rendered (no animations)
const waitForStableRender = (): Promise<void> => {
  return new Promise(resolve => {
    // Use requestAnimationFrame to wait for paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
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
  // Disable animations for faster capture
  disableAnimations?.();
  
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
      // Navigate to slide
      setCurrentSlide(i);
      
      // Minimal wait - just enough for React to render
      await waitForStableRender();
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms vs 600ms

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

      // Convert canvas to image data with JPEG for faster processing
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      // Add new page for slides after the first
      if (i > 0) {
        pdf.addPage([pageWidth, pageHeight], 'landscape');
      }

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, `slide_${i}`, 'FAST');
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
