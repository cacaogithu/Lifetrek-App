from typing import List, Optional
from pydantic import BaseModel, Field

class SlideContent(BaseModel):
    slide_number: int
    layout: str = Field(..., description="suggested_layout: 'title', 'text_heavy', 'image_split', 'list'")
    headline: str
    body_text: str
    visual_description: str = Field(..., description="Description for the designer agent")

class CarouselPlan(BaseModel):
    topic: str
    target_audience: str
    goal: str
    strategic_angle: str
    slides: List[SlideContent]

class GeneratedImage(BaseModel):
    slide_number: int
    image_url: str
    prompt_used: str

class CarouselResult(BaseModel):
    topic: str
    plan: CarouselPlan
    images: List[GeneratedImage]
    final_zip_url: Optional[str] = None
