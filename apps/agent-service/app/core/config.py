from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lifetrek Agent Service"
    google_project_id: str
    supabase_url: str
    supabase_service_role_key: str
    
    # Optional: LangSmith/Version
    environment: str = "local"

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
