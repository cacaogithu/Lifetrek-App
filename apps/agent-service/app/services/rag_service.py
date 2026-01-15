from typing import List, Dict
from langchain_google_vertexai import VertexAIEmbeddings
from app.core.supabase import get_supabase
import logging

logger = logging.getLogger("rag_service")
supabase = get_supabase()

# Initialize Embeddings
# Uses Google Vertex AI (text-embedding-004 or similar)
embeddings = VertexAIEmbeddings(model_name="text-embedding-004")

async def search_assets(query: str, limit: int = 5) -> List[Dict]:
    """
    Semantic search for assets in product_catalog.
    """
    try:
        # 1. Generate Embedding
        query_vector = await embeddings.aembed_query(query)
        
        # 2. Call Supabase RPC
        response = supabase.rpc("match_product_assets", {
            "query_embedding": query_vector,
            "match_threshold": 0.6, # Slightly lower threshold for broader recall
            "match_count": limit
        }).execute()
        
        # 3. Return results
        return response.data
        
    except Exception as e:
        logger.error(f"RAG Search failed: {e}")
        return []

async def index_product(product_id: str, text_to_embed: str):
    """
    Generate and store embedding for a product.
    Should be called when product is created/updated.
    """
    try:
        vector = await embeddings.aembed_query(text_to_embed)
        
        supabase.table("product_catalog").update({
            "embedding": vector
        }).eq("id", product_id).execute()
        
        logger.info(f"Indexed product {product_id}")
        
    except Exception as e:
        logger.error(f"Indexing failed for {product_id}: {e}")
