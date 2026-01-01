/**
 * Utility for generating Supabase Storage URLs for website assets
 * 
 * Usage:
 * import { getAssetUrl } from '@/lib/storage-url';
 * 
 * <img src={getAssetUrl('products/syringes-hero.webp')} alt="..." />
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'website-assets';

/**
 * Get the public URL for an asset stored in website-assets bucket
 * @param path - Path to the asset within the bucket (e.g., 'products/syringes.webp')
 * @returns Full public URL to the asset
 */
export const getAssetUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
};

/**
 * Get asset URL with transform options for optimized delivery
 * @param path - Path to the asset within the bucket
 * @param options - Transform options (width, height, quality, format)
 * @returns Transformed image URL
 */
export const getTransformedAssetUrl = (
  path: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'webp';
    resize?: 'cover' | 'contain' | 'fill';
  } = {}
): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  const params = new URLSearchParams();
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.quality) params.set('quality', options.quality.toString());
  if (options.format) params.set('format', options.format);
  if (options.resize) params.set('resize', options.resize);
  
  const queryString = params.toString();
  const transformPath = queryString 
    ? `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET_NAME}/${cleanPath}?${queryString}`
    : getAssetUrl(path);
    
  return transformPath;
};

/**
 * Asset path constants for organized access
 */
export const ASSET_PATHS = {
  // Hero backgrounds
  hero: {
    factory: 'hero/factory-background.webp',
    reception: 'hero/reception-hero.webp',
  },
  // Product category images
  products: {
    syringes: 'products/syringes.webp',
    needles: 'products/needles.webp',
    bloodCollection: 'products/blood-collection.webp',
    infusion: 'products/infusion.webp',
    veterinary: 'products/veterinary.webp',
    labware: 'products/labware.webp',
  },
  // Equipment images
  equipment: (filename: string) => `equipment/${filename}`,
  // Client logos
  clients: (filename: string) => `clients/${filename}`,
  // Facility images
  facilities: (filename: string) => `facilities/${filename}`,
} as const;
