from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.supabase import get_supabase
from app.services.research_agent import execute_deep_research
import json
import logging

logger = logging.getLogger("blog_agent")
supabase = get_supabase()

# --- State Definition ---
class BlogState(TypedDict):
    topic: str
    target_audience: str
    research_data: dict
    strategy_outline: str
    blog_content: str
    image_prompt: str
    image_url: str
    current_step: str
    status: str
    evaluation: dict

# --- LLM Setup ---
llm = ChatVertexAI(
    model_name="gemini-pro",
    max_output_tokens=4096,
    temperature=0.7
)

# --- Nodes ---

async def research_node(state: BlogState):
    logger.info(f"Researching: {state['topic']}")
    await _update_checkpoint(state['job_id'], "researching", state)
    
    research_result = await execute_deep_research(state['topic'])
    
    return {
        "research_data": research_result,
        "current_step": "strategy"
    }

async def strategy_node(state: BlogState):
    logger.info(f"Strategizing: {state['topic']}")
    await _update_checkpoint(state['job_id'], "strategizing", state)
    
    research_summary = json.dumps(state.get('research_data', {}).get('key_findings', []))
    
    prompt = f"""
    You are a Content Strategist. Create a blog post outline for the topic: "{state['topic']}".
    Target Audience: {state.get('target_audience', 'General Professional')}
    
    Research Context:
    {research_summary}
    
    Output a structured outline with H2 and H3 headings.
    """
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    
    return {
        "strategy_outline": response.content,
        "current_step": "writing"
    }

async def writing_node(state: BlogState):
    logger.info(f"Writing: {state['topic']}")
    await _update_checkpoint(state['job_id'], "writing", state)
    
    prompt = f"""
    You are a professional Copywriter. Write a full blog post based on this outline.
    
    Outline:
    {state['strategy_outline']}
    
    Tone: Professional, Insightful, Engaging.
    Format: Markdown.
    """
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    
    return {
        "blog_content": response.content,
        "current_step": "designing"
    }

async def image_node(state: BlogState):
    logger.info(f"Designing: {state['topic']}")
    await _update_checkpoint(state['job_id'], "designing", state)
    
    # Generate Prompt
    prompt_gen = f"""
    Create a detailed image generation prompt for a blog post header image.
    Topic: {state['topic']}
    Key Themes: {state['strategy_outline'][:200]}...
    
    Output ONLY the prompt.
    """
    response = await llm.ainvoke([HumanMessage(content=prompt_gen)])
    image_prompt = response.content
    
    image_url = "https://via.placeholder.com/800x400.png?text=Blog+Header" 
    
    return {
        "image_prompt": image_prompt,
        "image_url": image_url,
        "current_step": "evaluating"
    }

async def evaluation_node(state: BlogState):
    logger.info(f"Evaluating: {state['topic']}")
    await _update_checkpoint(state['job_id'], "evaluating", state)
    
    prompt = f"""
    You are a Brand Editor. Evaluate this blog post for quality, tone, and adherence to the topic.
    
    Topic: {state['topic']}
    Content:
    {state['blog_content']}
    
    Output JSON with:
    - score (0-100)
    - feedback (string)
    - needs_revision (boolean)
    """
    
    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        # Clean up code blocks if present
        content = response.content.replace("```json", "").replace("```", "")
        evaluation = json.loads(content)
    except:
        evaluation = {"score": 0, "feedback": "Evaluation failed", "needs_revision": True}
        
    return {
        "evaluation": evaluation,
        "current_step": "completed"
    }

# --- Helpers ---

async def _update_checkpoint(job_id: str, step: str, state: BlogState):
    """
    Persists current state to Supabase for resumption/monitoring.
    """
    try:
        # Filter out large objects if needed, or store full state
        checkpoint = {
            "step": step,
            "state": {k: v for k, v in state.items() if k != "job_id"} # Exclude job_id redundancy
        }
        
        supabase.table("jobs").update({
            "checkpoint_data": checkpoint,
            "status": f"processing:{step}" # Informative status
        }).eq("id", job_id).execute()
        
    except Exception as e:
        logger.error(f"Failed to checkpoint job {job_id}: {e}")

# --- Graph Construction ---

def build_graph():
    workflow = StateGraph(BlogState)
    
    workflow.add_node("research", research_node)
    workflow.add_node("strategy", strategy_node)
    workflow.add_node("writing", writing_node)
    workflow.add_node("image", image_node)
    workflow.add_node("evaluation", evaluation_node)
    
    workflow.set_entry_point("research")
    
    workflow.add_edge("research", "strategy")
    workflow.add_edge("strategy", "writing")
    workflow.add_edge("writing", "image")
    workflow.add_edge("image", "evaluation")
    workflow.add_edge("evaluation", END)
    
    return workflow.compile()

# --- Execution Entry Point ---

async def execute_blog_generation(payload: dict, job_id: str) -> dict:
    """
    Entry point called by job_manager.
    """
    app = build_graph()
    
    initial_state = {
        "topic": payload.get("topic"),
        "target_audience": payload.get("target_audience"),
        "job_id": job_id,
        "research_data": {},
        "strategy_outline": "",
        "blog_content": "",
        "image_prompt": "",
        "image_url": "",
        "evaluation": {},
        "current_step": "start"
    }
    
    # Execute the graph
    # LangGraph's ainvoke returns the final state
    final_state = await app.ainvoke(initial_state)
    
    return {
        "blog_post": {
            "title": final_state["topic"],
            "content": final_state["blog_content"],
            "image": final_state["image_url"]
        },
        "metadata": {
            "strategy": final_state["strategy_outline"],
            "research": final_state["research_data"],
            "evaluation": final_state["evaluation"]
        }
    }
