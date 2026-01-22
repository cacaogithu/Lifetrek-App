import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent-orchestrator")

app = FastAPI()

# --- Configuration ---
# We use GOOGLE_API_KEY for Gemini (simpler than Vertex Service Account)
GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY") 
if not GOOGLE_API_KEY:
    logger.warning("GEMINI_API_KEY not set. Agents will fail.")

# Initialize LLM (Gemini 2.0 Flash or 1.5 Pro)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp", 
    google_api_key=GOOGLE_API_KEY,
    temperature=0.7
)

# --- Schemas ---
class AgentRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    agent_role: str = "orchestrator" # orchestrator, strategist, copywriter, designer

class AgentResponse(BaseModel):
    response: str
    metadata: Dict[str, Any] = {}

# --- Prompts & Agents ---

STRATEGIST_PROMPT = """
You are a World-Class Content Strategist for Lifetrek Medical (CNC Machining & MedTech).
Your goal is to plan a high-impact LinkedIn Carousel.

TOPIC: {topic}

Context:
Lifetrek manufactures high-precision medical components. 
Brand Voice: Professional, Innovative, Precision-Obsessed, Trustworthy.

Task:
Create a strategic plan for a 5-slide carousel.
- Slide 1: Hook (High impact)
- Slide 2: Problem/Context
- Slide 3: Solution/Insight (The "Meat")
- Slide 4: Proof/Technical Detail
- Slide 5: CTA (Call to Action)

Output a structured PLAN in markdown format.
"""

# --- Routes ---

@app.post("/chat")
async def chat_endpoint(request: AgentRequest):
    """
    Unified Chat Endpoint.
    Handles distinct agent roles or acts as the Orchestrator delegating tasks.
    """
    try:
        logger.info(f"Received chat request: {request.message} [Role: {request.agent_role}]")
        
        if request.agent_role == "strategist":
            # Direct Strategist Call
            prompt = PromptTemplate.from_template(STRATEGIST_PROMPT)
            chain = prompt | llm
            result = await chain.ainvoke({"topic": request.message})
            response_text = result.content
            
        elif request.agent_role == "orchestrator":
            # Orchestrator Logic (Simple Router for now)
            # In future: Use LangGraph here for complex State
            system_prompt = "You are the Orchestrator. You help the user create content by delegating to the Strategist, Copywriter, or Designer."
            messages = [("system", system_prompt)] + [(h["role"], h["content"]) for h in request.history] + [("user", request.message)]
            
            result = await llm.ainvoke(messages)
            response_text = result.content
            
        else:
            response_text = f"Agent role '{request.agent_role}' not yet implemented in Python."

        return JSONResponse(content={"response": response_text, "metadata": {"role": request.agent_role}})

    except Exception as e:
        logger.error(f"Error in chat_endpoint: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
async def health_check():
    return {"status": "ok", "runtime": "supabase-python"}
