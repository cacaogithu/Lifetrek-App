import { analyzeProductImage } from '../utils/analyzeProductImage';

// This script analyzes all dental product images
const analyzeAllProducts = async () => {
  const baseUrl = 'https://lifetrek-global-site.lovable.app';
  
  const images = [
    { path: '/src/assets/products/dental-implante-optimized.png', name: 'dental-implante' },
    { path: '/src/assets/products/dental-angulados.png', name: 'dental-angulados' },
    { path: '/src/assets/products/dental-fresas-optimized.png', name: 'dental-fresas' },
    { path: '/src/assets/products/dental-instrumentos-optimized.png', name: 'dental-instrumentos' },
    { path: '/src/assets/products/dental-components.jpg', name: 'dental-components' },
    { path: '/src/assets/products/precision-components.png', name: 'precision-components' }
  ];

  console.log('Starting image analysis...\n');

  for (const image of images) {
    try {
      const imageUrl = `${baseUrl}${image.path}`;
      console.log(`Analyzing ${image.name}...`);
      const result = await analyzeProductImage(imageUrl);
      console.log(`Result for ${image.name}:`);
      console.log(`  Name: ${result.name}`);
      console.log(`  Description: ${result.description}`);
      console.log(`  Category: ${result.category}\n`);
    } catch (error) {
      console.error(`Failed to analyze ${image.name}:`, error);
    }
  }
};

analyzeAllProducts();
