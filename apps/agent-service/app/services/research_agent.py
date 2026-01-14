from datetime import datetime
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType
from langchain_google_vertexai import ChatVertexAI
# Import Vertex AI Search Retriever
from langchain_google_vertexai import GoogleSearchRetrieval

# Initialize LLM (Gemini via Vertex AI)
llm = ChatVertexAI(
    model_name="gemini-pro", 
    max_output_tokens=2048, 
    temperature=0.7
)

# Initialize Search Tool using Vertex AI Grounding
# This uses the GCP Project credentials (no separate API key needed)
search = GoogleSearchRetrieval()

tools = [
    Tool(
        name="Deep Search",
        func=search.invoke,
        description="useful for when you need to answer questions about current events or verified facts using Google Search"
    )
]

DEEP_RESEARCH_PROMPT_TEMPLATE = """You are a highly skilled Research Agent for Lifetrek, a manufacturer of CNC machinery and medical devices.
Your goal is to conduct deep research on the following topic to support a high-quality LinkedIn post or Blog article.

TOPIC: {topic}

INSTRUCTIONS:
1. Search for recent statistics, market trends, and authoritative articles related to the topic.
2. Focus on "Industrial", "Medical Device", and "Precision Engineering" angles.
3. Verify facts from multiple sources if possible.
4. Output a JSON-structured summary with:
   - "key_findings": List of bullet points.
   - "statistics": List of relevant data points with years/sources.
   - "citations": List of URLs used.
   - "narrative_angle": A suggested angle for the blog post based on this research.

Ensure the output is valid JSON (markdown code block).
"""

async def execute_deep_research(topic: str) -> dict:
    """
    Executes the Deep Research workflow using LangChain + Gemini.
    """
    try:
        # For simplicity in this iteration, we use a simple Chain or just the Search Tool directly if complex reasoning isn't needed yet.
        # But per requirements, we want an "Agent".
        
        agent_executor = initialize_agent(
            tools, 
            llm, 
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, 
            verbose=True,
            handle_parsing_errors=True
        )

        prompt = DEEP_RESEARCH_PROMPT_TEMPLATE.format(topic=topic)
        
        # Run the agent
        response = agent_executor.run(prompt)
        
        # In a real production scenario, we'd use PydanticOutputParser to guarantee JSON.
        # For now, we wrap the string response.
        return {
            "topic": topic,
            "raw_agent_output": response,
            "researched_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {"error": str(e), "status": "failed"}
