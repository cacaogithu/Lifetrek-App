import asyncio
import json
import logging
from typing import List
from app.core.config import get_settings
from app.schemas.carousel import CarouselPlan, SlideContent, GeneratedImage, CarouselResult, CopywriterOutput

from langchain_google_vertexai import ChatVertexAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser

# For Image Generation (Vertex AI / Gemini)
from google.cloud import aiplatform
try:
    from vertexai.preview.vision import ImageGenerationModel
except ImportError:
    try:
        from vertexai.vision_models import ImageGenerationModel
    except ImportError:
        # Fallback or Mock for testing if environment issues persist
        raise ImportError("Could not import ImageGenerationModel from vertexai")

import vertexai

logger = logging.getLogger("carousel_agent")
settings = get_settings()

# Initialize Vertex AI
vertexai.init(project=settings.google_project_id, location="us-central1")

# --- LLM Initialization ---
llm = ChatVertexAI(
    model_name="gemini-1.5-pro-preview-0409", # Use a capable model
    temperature=0.7,
    max_output_tokens=4096,
    project=settings.google_project_id,
    location="us-central1",
)

# --- Prompts ---

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

Output JSON matching the CarouselPlan schema.
"""

COPYWRITER_PROMPT = """
You are a Senior Medical Copywriter.
Your task is to write the actual content for a LinkedIn Carousel based on this plan.

PLAN:
{plan}

Task:
Write the headline and body text for each slide.
- Headlines must be punchy (under 10 words).
- Body text must be concise (under 30 words per slide).
- Visual descriptions should be detailed for a designer.
- Also write an engaging LinkedIn caption with hashtags.

Output JSON matching the CopywriterOutput schema.
"""

DESIGNER_PROMPT_TEMPLATE = """
Create a prompt for an AI Image Generator (Gemini 3 Pro Image) for this slide.
Slide Context: {visual_description}
Headline to Render: "{headline}"

Style Rules:
- Photorealistic, Cinematic Lighting, Medical/Industrial Aesthetic.
- Brand Colors: Deep Blue (#004F8F), Surgical Green accents.
- IF text is needed, explicitly state: 'Render the text "{headline}" in a modern sans-serif font.'
"""

# --- Agent Functions ---

async def execute_carousel_generation(topic: str) -> CarouselResult:
    logger.info(f"Starting Carousel Generation for: {topic}")
    
    # 1. Strategist
    plan = await _run_strategist(topic)
    
    # 2. Copywriter
    # We might iterate here, but for now simple sequential
    copy_output = await _run_copywriter(plan)
    slides = copy_output.slides
    caption = copy_output.linkedin_caption
    
    # 3. Designer (Parallel Image Generation)
    images = await _generate_images(slides)
    
    return CarouselResult(
        topic=topic,
        plan=plan,
        images=images,
        caption=caption
    )

async def _run_strategist(topic: str) -> CarouselPlan:
    logger.info("Running Strategist Agent...")
    parser = PydanticOutputParser(pydantic_object=CarouselPlan)
    prompt = PromptTemplate(
        template=STRATEGIST_PROMPT + "\n{format_instructions}",
        input_variables=["topic"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    chain = prompt | llm | parser
    return await chain.ainvoke({"topic": topic})

async def _run_copywriter(plan: CarouselPlan) -> CopywriterOutput:
    logger.info("Running Copywriter Agent...")
    parser = PydanticOutputParser(pydantic_object=CopywriterOutput)
    
    # Wrap list in object for better parsing reliability
    # But let's try direct list first or use a wrapper prompt trick
    prompt = PromptTemplate(
        template=COPYWRITER_PROMPT + "\n{format_instructions}",
        input_variables=["plan"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    chain = prompt | llm | parser
    return await chain.ainvoke({"plan": plan.model_dump_json()})

async def _generate_images(slides: List[SlideContent]) -> List[GeneratedImage]:
    logger.info("Running Designer Agent (Image Generation)...")
    
    # Load Image Model (Vertex AI)
    # Note: Requires "imagen-3.0-generate-001" or "imagegeneration@006"
    image_model = ImageGenerationModel.from_pretrained("imagegeneration@006") 
    
    tasks = []
    for slide in slides:
        tasks.append(_generate_single_slide(slide, image_model))
        
    return await asyncio.gather(*tasks)

async def _generate_single_slide(slide: SlideContent, model) -> GeneratedImage:
    # Construct Image Prompt
    # In a real agent, we might use an LLM to refine this prompt first. 
    # For now, we construct it directly from the Visual Description.
    
    full_prompt = f"""
    Professional 3D render, medical device aesthetic, photorealistic.
    {slide.visual_description}
    Crucial: Text "{slide.headline}" must be clearly visible, centered, modern font, white color.
    Brand colors: #004F8F, #1A7A3E.
    """
    
    try:
        response = model.generate_images(
            prompt=full_prompt,
            number_of_images=1,
            aspect_ratio="4:5", # LinkedIn Portrait
            safety_filter_level="block_some",
            person_generation="allow_adult"
        )
        
        # Save or Upload logic would happen here. 
        # Vertex returns a generated image object. We usually upload to GCS or Supabase Storage.
        # For this MVP, we might assume we get a temporary URL or base64.
        # Vertex SDK 1.38+ usually provides a GCS URI if configured, or bytes.
        
        # Simulating URL for now as upload logic is separate
        # In production: upload_to_supabase(response[0]._image_bytes)
        
        return GeneratedImage(
            slide_number=slide.slide_number,
            image_url="https://placeholder.com/generated-image.png", # TODO: Implement Upload
            prompt_used=full_prompt
        )
    except Exception as e:
        logger.error(f"Image generation failed for slide {slide.slide_number}: {e}")
        return GeneratedImage(slide_number=slide.slide_number, image_url="", prompt_used=full_prompt)

