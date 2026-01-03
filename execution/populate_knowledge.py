import os
import json
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Must use service role key for writing if RLS is strict, or ensuring user has rights
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    exit(1)

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY must be set.")
    exit(1)

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)

async def get_embedding(text: str):
    """Generates embedding using Gemini Text Embedding model."""
    try:
        # Using 'models/text-embedding-004' or similar which produces 768 dimensions
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
            title=None
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

async def ingest_document(content: str, metadata: dict):
    """Ingests a document into Supabase."""
    print(f"Ingesting: {metadata.get('title', 'Untitled')}...")
    
    embedding = await get_embedding(content)
    if not embedding:
        print("Skipping due to embedding error.")
        return

    data = {
        "content": content,
        "metadata": metadata,
        "embedding": embedding
    }

    try:
        response = supabase.table("knowledge_embeddings").insert(data).execute()
        # count = len(response.data) if response.data else 0 # supabase-py v2 returns data object
        print(f"Successfully inserted document.")
    except Exception as e:
        print(f"Error inserting into Supabase: {e}")

async def main():
    # Example Documents - In a real scenario, this would load from files
    documents = [
        {
            "content": """
            # Brand Book: Lifetrek Medical
            **Mission**: To lead in the manufacture of high-performance products with an absolute commitment to life.
            **Tone**: Technical, Ethical, Confident, Partnership-Oriented.
            **Colors**: LifeTrek Orange (#FF5722), Medical Blue (#03A9F4).
            **Typography**: Inter, Roboto.
            """,
            "metadata": {"title": "Brand Book", "type": "guidelines"}
        },
        {
            "content": """
            # Alex Hormozi Playbook for Offers
            1. **Grand Slam Offer**: Make an offer so good people feel stupid saying no.
            2. **Value Equation**: (Dream Outcome * Perceived Likelihood of Achievement) / (Time Delay * Effort & Sacrifice).
            3. **Scarcity & Urgency**: Use supply and time limits to increase demand.
            4. **Bonuses**: Add relevant bonuses to increase perceived value without increasing core product cost.
            """,
            "metadata": {"title": "Hormozi Playbook", "type": "strategy"}
        },
        {
            "content": """
            # Email Templates: Cold Outreach
            **Subject**: Manufacturing capacity for [Company]
            Hi [Name],
            I noticed [Company] is scaling production of [Product]. 
            At Lifetrek, we specialize in high-precision CNC machining (Citizen scale) specifically for medical devices (ISO 13485).
            We have open capacity this month to run a sample batch in 30 days.
            Interested in a quote?
            Best, [Sender]
            """,
            "metadata": {"title": "Cold Outreach Template", "type": "template"}
        }
    ]

    for doc in documents:
        await ingest_document(doc["content"], doc["metadata"])

if __name__ == "__main__":
    asyncio.run(main())
