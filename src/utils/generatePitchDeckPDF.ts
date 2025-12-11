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
  // Apply PDF export mode to document root for global CSS overrides
  document.documentElement.classList.add('pdf-export-mode');
  
  // Disable animations for clean capture
  disableAnimations?.();
  
  // Wait for mode changes to take effect
  await waitForDOMUpdate(300);
  
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
      
      // Wait for DOM to fully update
      await waitForDOMUpdate(400);

      // Find the slide element
      const slideElement = document.querySelector('[data-slide]') as HTMLElement;
      
      if (!slideElement) {
        console.error(`Slide ${i + 1} not found`);
        continue;
      }

      // Wait for all images in slide to load
      await waitForImages(slideElement);
      
      // Additional wait for fonts and styles
      await waitForDOMUpdate(300);

      onProgress?.(i + 1, totalSlides);

      // Capture slide as high-res canvas with improved settings
      const canvas = await html2canvas(slideElement, {
        scale: 2, // Good balance between quality and speed
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: slideElement.offsetWidth,
        height: slideElement.offsetHeight,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Add pdf-export-mode to cloned document
          clonedDoc.documentElement.classList.add('pdf-export-mode');
          
          const clonedSlide = clonedDoc.querySelector('[data-slide]') as HTMLElement;
          if (clonedSlide) {
            // Detect if slide has dark background
            const hasDarkBg = clonedSlide.classList.contains('bg-primary') ||
                              clonedSlide.className.includes('from-primary') ||
                              clonedSlide.className.includes('bg-gradient-to-br');
            
            clonedSlide.style.backgroundColor = hasDarkBg ? '#003366' : '#ffffff';
          }
          
          // Process all elements for PDF compatibility
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.style) return;
            
            // Remove problematic CSS properties
            htmlEl.style.backdropFilter = 'none';
            (htmlEl.style as any).webkitBackdropFilter = 'none';
            htmlEl.style.animation = 'none';
            htmlEl.style.transition = 'none';
            
            // Remove mask-image (not supported by html2canvas)
            htmlEl.style.maskImage = 'none';
            (htmlEl.style as any).webkitMaskImage = 'none';
            
            // Fix gradient text - replace with solid color
            if (htmlEl.classList.contains('bg-clip-text') || 
                htmlEl.classList.contains('text-transparent')) {
              htmlEl.style.webkitBackgroundClip = 'border-box';
              htmlEl.style.backgroundClip = 'border-box';
              htmlEl.style.background = 'transparent';
              (htmlEl.style as any).webkitTextFillColor = 'unset';
              htmlEl.style.color = '#003A5D'; // Brand primary blue
            }
            
            // Fix GlassCard backgrounds - make solid
            if (htmlEl.classList.contains('bg-background/50') || 
                htmlEl.classList.contains('bg-card/50') ||
                htmlEl.classList.contains('bg-card/30')) {
              htmlEl.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            }
            
            // Fix gradient underlines - simplify to solid
            if (htmlEl.classList.contains('bg-gradient-to-r') && 
                htmlEl.classList.contains('from-accent-orange')) {
              htmlEl.style.background = 'linear-gradient(to right, #E65100, #1E6F50, transparent)';
            }
          });
        }
      });

      // Use PNG for better quality
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add new page for slides after the first
      if (i > 0) {
        pdf.addPage([pageWidth, pageHeight], 'landscape');
      }

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, `slide_${i}`, 'FAST');
    }

    // Save the PDF
    pdf.save('Lifetrek_Medical_Pitch_Deck.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Remove PDF export mode
    document.documentElement.classList.remove('pdf-export-mode');
    // Re-enable animations
    enableAnimations?.();
  }
};
