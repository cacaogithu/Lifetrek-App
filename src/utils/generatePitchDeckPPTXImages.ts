import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import { toast } from 'sonner';

export interface PPTXImagesGeneratorOptions {
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  onProgress?: (current: number, total: number) => void;
}

export const generatePitchDeckPPTXImages = async ({
  totalSlides,
  setCurrentSlide,
  onProgress
}: PPTXImagesGeneratorOptions): Promise<void> => {
  const pres = new pptxgen();

  // Set presentation properties
  pres.author = 'Lifetrek Medical';
  pres.title = 'Lifetrek Medical - Pitch Deck';
  pres.subject = 'Manufatura Contratada ISO 13485';
  pres.company = 'Lifetrek Medical';

  // Define slide dimensions (16:9)
  pres.defineLayout({ name: 'CUSTOM_16x9', width: 13.333, height: 7.5 });
  pres.layout = 'CUSTOM_16x9';

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
        backgroundColor: '#ffffff',
        logging: false,
        width: slideElement.offsetWidth,
        height: slideElement.offsetHeight
      });

      // Convert canvas to base64 image data
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create slide and add image as background
      const slide = pres.addSlide();
      
      slide.addImage({
        data: imgData,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        sizing: { type: 'cover', w: '100%', h: '100%' }
      });
    }

    // Save the PPTX
    await pres.writeFile({ fileName: 'Lifetrek_Medical_Pitch_Deck_HD.pptx' });
    
  } catch (error) {
    console.error('Error generating PPTX with images:', error);
    throw error;
  }
};
