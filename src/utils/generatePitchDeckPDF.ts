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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, ms);
      });
    });
  });
};

// Wait for all images to load
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });
  return Promise.all(promises).then(() => {});
};

export const generatePitchDeckPDF = async ({
  totalSlides,
  setCurrentSlide,
  onProgress,
  disableAnimations,
  enableAnimations
}: PDFGeneratorOptions): Promise<void> => {
  // Apply PDF export mode to the entire slide container
  const slideContainer = document.querySelector('[data-slide]')?.parentElement;
  slideContainer?.classList.add('pdf-export-mode');
  
  // Disable animations for clean capture
  disableAnimations?.();
  
  // Wait for mode changes to take effect
  await waitForDOMUpdate(200);
  
  // Create PDF with 16:9 landscape aspect ratio (A4 landscape dimensions)
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
      
      // Wait for DOM to fully update
      await waitForDOMUpdate(300);

      // Find the slide element
      const slideElement = document.querySelector('[data-slide]') as HTMLElement;
      
      if (!slideElement) {
        console.error(`Slide ${i + 1} not found`);
        continue;
      }

      // Wait for all images in slide to load
      await waitForImages(slideElement);
      
      // Additional wait for fonts and styles
      await waitForDOMUpdate(200);

      onProgress?.(i + 1, totalSlides);

      // Capture slide as high-res canvas with improved settings
      const canvas = await html2canvas(slideElement, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#003366', // Fallback background color matching primary
        logging: false,
        width: slideElement.offsetWidth,
        height: slideElement.offsetHeight,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Apply PDF export mode to cloned document
          const clonedSlide = clonedDoc.querySelector('[data-slide]');
          if (clonedSlide) {
            clonedSlide.classList.add('pdf-export-mode');
            // Also add to parent for proper cascade
            clonedSlide.parentElement?.classList.add('pdf-export-mode');
          }
          
          // Force remove backdrop-filter from all elements
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              htmlEl.style.backdropFilter = 'none';
              (htmlEl.style as any).webkitBackdropFilter = 'none';
              htmlEl.style.animation = 'none';
              htmlEl.style.transition = 'none';
            }
          });
        }
      });

      // Use PNG for better gradient quality (vs JPEG compression artifacts)
      const imgData = canvas.toDataURL('image/png');

      // Add new page for slides after the first
      if (i > 0) {
        pdf.addPage([pageWidth, pageHeight], 'landscape');
      }

      // Add image to PDF - fill entire page
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, `slide_${i}`, 'FAST');
    }

    // Save the PDF
    pdf.save('Lifetrek_Medical_Pitch_Deck.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Remove PDF export mode
    slideContainer?.classList.remove('pdf-export-mode');
    // Re-enable animations
    enableAnimations?.();
  }
};
