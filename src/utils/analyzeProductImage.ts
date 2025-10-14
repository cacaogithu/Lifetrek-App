import { supabase } from "@/integrations/supabase/client";

export interface ProductAnalysis {
  name: string;
  description: string;
  category: string;
}

export const analyzeProductImage = async (imageUrl: string): Promise<ProductAnalysis> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-product-image', {
      body: { imageUrl }
    });

    if (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }

    return data as ProductAnalysis;
  } catch (error) {
    console.error('Failed to analyze product image:', error);
    throw error;
  }
};
