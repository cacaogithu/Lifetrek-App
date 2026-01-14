from fastapi import FastAPI, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings, Settings
from app.services.job_manager import process_job

app = FastAPI(title="Lifetrek Agent Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check(settings: Settings = Depends(get_settings)):
    return {
        "status": "healthy", 
        "project": settings.PROJECT_NAME, 
        "environment": settings.environment
    }

@app.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receives Supabase Database Webhook (INSERT on job_queue).
    Triggered by pg_net or standard webhook configuration.
    """
    body = await request.json()
    
    # Validation: Ensure it's an INSERT to job_queue
    if body.get("table") == "job_queue" and body.get("type") == "INSERT":
        record = body.get("record", {})
        # Spawn background task
        background_tasks.add_task(process_job, record)
        return {"status": "queued", "job_id": record.get("id")}
    
    return {"status": "ignored", "reason": "Not a job_queue INSERT event"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
