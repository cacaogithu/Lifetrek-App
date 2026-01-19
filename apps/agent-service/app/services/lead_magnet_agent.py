import google.generativeai as genai
from app.core.config import get_settings
import logging
from datetime import datetime

logger = logging.getLogger("lead_magnet_agent")
settings = get_settings()

COMPANY_CONTEXT = """
# Lifetrek Medical - Company Context & Brand Book
**Mission**: "To lead in the manufacture of high-performance products... with an absolute commitment to life."
**Tagline**: "Global Reach, Local Excellence."
**Tone**: Technical, Ethical, Confident, Partnership-Oriented.
**Key Themes**:
- **Risk Reduction**: "Manufacturing Capabilities That De-Risk Your Supply Chain".
- **Precision**: "Micron-level accuracy", "Zero-Defect Manufacturing".
- **Compliance**: "Regulatory Confidence", "ISO 13485:2016", "ANVISA".
- **Speed**: "Faster Time to Market".

## Infrastructure & Machinery (Technical Specs)
Lifetrek operates a world-class facility in **Indaiatuba / SP, Brazil**.
- **Citizen M32 / L20 (Swiss-Type CNC Lathe)**: Complex medical implants, 12-axis control.
- **ZEISS Contura (3D CMM)**: Micron-level automated inspection.
- **ISO Class 7 Cleanrooms**: Assembly and packaging.
- **Electropolishing**: Mirror finish for biocompatibility.
"""

async def execute_lead_magnet_generation(persona: str, topic: str, template_id: str) -> dict:
    """
    Generates a lead magnet using Gemini.
    """
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        raise ValueError("Missing GOOGLE_API_KEY")

    genai.configure(api_key=api_key)
    formatted_template_id = template_id.lower().strip() # Normalize

    # Template definitions
    template_instructions = ""
    if formatted_template_id == 'tco-calculator':
        template_instructions = """
        - Focus: CFO/Supply Chain.
        - Style: Structured table representation (Excel-like).
        - Key Sections: Total Landed Cost Analysis, Freight comparison, Exchange rate impact, Capital tied in inventory.
        - LinkedIn CTA: Comments "CALCULO".
        """
    elif formatted_template_id == 'dfm-checklist':
        template_instructions = """
        - Focus: P&D/Product Engineering.
        - Style: 2-3 page technical checklist.
        - Key Sections: Geometry (deep holes, threads), Dia/Depth ratios for Ti/SS/PEEK, Surface reqs (Ra, electropolishing), Swiss-type optimized tolerances.
        - LinkedIn CTA: Comments "DFM".
        """
    elif formatted_template_id == 'iso-audit-checklist':
        template_instructions = """
        - Focus: QA/RA Managers.
        - Style: Audit Matrix with scoring fields.
        - Key Sections: QMS/ISO 13485, Metrology traceability (CMM), Change control (ECN), Cleanroom ISO Class 7 specs.
        - LinkedIn CTA: Comments "AUDITORIA".
        """
    elif formatted_template_id == 'capital-planner':
        template_instructions = """
        - Focus: Finance/Ops.
        - Style: Strategic logic guide + Planilha map.
        - Key Sections: Current vs JIT local supply scenario, Opportunity cost calculation, % Capital released.
        - LinkedIn CTA: Comments "CAPITAL".
        """
    
    prompt = f"""
    Role: You are a Senior Growth Marketer for Lifetrek Medical, specializing in B2B Lead Gen for Medical Device Manufacturing.
    Task: Lead Magnet Content Generation.
    
    Industry Persona: {persona}
    Template Type: {formatted_template_id}
    Specific Topic/Context: {topic}
    
    Company Context:
    {COMPANY_CONTEXT}
    
    Requirements based on Template Type:
    {template_instructions}

    General Rules:
    - Output language: Portuguese (pt-BR).
    - Tone: Technical, Professional, Data-driven.
    - Include the specific LinkedIn CTA at the very end.
    
    Format: Professional Markdown.
    """

    logger.info(f"Generating Lead Magnet for {persona} on {topic}")
    
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    content = response.text

    return {
        "persona": persona,
        "topic": topic,
        "templateId": formatted_template_id,
        "content": content,
        "generated_at": datetime.utcnow().isoformat()
    }
