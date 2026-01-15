import asyncio
from datetime import datetime
from app.core.supabase import get_supabase
import logging

logger = logging.getLogger("job_manager")
supabase = get_supabase()

async def process_job(job_record: dict):
    """
    Main entry point for processing background jobs.
    Expected job_record matches 'job_queue' table schema.
    """
    job_id = job_record.get("id")
    job_type = job_record.get("job_type")
    payload = job_record.get("payload", {})
    
    logger.info(f"Processing Job {job_id} of type {job_type}")

    # 1. Update status to Processing
    supabase.table("jobs").update({
        "status": "processing",
        "started_at": datetime.utcnow().isoformat()
    }).eq("id", job_id).execute()

    try:
        # 2. Route to specific handler
        result = await _dispatch_job(job_type, payload, job_id)
        
        # 3. Update status to Completed
        supabase.table("jobs").update({
            "status": "completed",
            "result": result,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()
        
        logger.info(f"Job {job_id} completed successfully")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}")
        # 4. Update status to Failed
        supabase.table("jobs").update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()

async def _dispatch_job(job_type: str, payload: dict, job_id: str = None) -> dict:
    """
    Switch case for job types. 
    Ideally this uses a strategy pattern or registry in the future.
    """
    if job_type == "test_job":
        await asyncio.sleep(2) # Simulate work
        return {"message": "Test job processed", "echo": payload}
    
    elif job_type == "deep_research":
        logger.info("Dispatching to Research Agent")
        
        # Extract topic from payload
        topic = payload.get("topic")
        if not topic:
            raise ValueError("Payload missing 'topic'")
            
        from app.services.research_agent import execute_deep_research
        return await execute_deep_research(topic)
        
    elif job_type == "carousel_generate":
        logger.info("Dispatching to Carousel Agent")
        
        # Extract topic from payload
        topic = payload.get("topic")
        if not topic:
            raise ValueError("Payload missing 'topic'")
            
        from app.services.carousel_agent import execute_carousel_generation
        # Execute and dump Pydantic model to dict
        result = await execute_carousel_generation(topic)
        return result.model_dump()

    elif job_type == "blog_generate":
        logger.info(f"Dispatching to Blog Agent (Job {job_id})")
        if not job_id:
             raise ValueError("Job ID required for blog generation (checkpointing)")
             
        from app.services.blog_agent import execute_blog_generation
        return await execute_blog_generation(payload, job_id)
        
    else:
        raise ValueError(f"Unknown job type: {job_type}")
