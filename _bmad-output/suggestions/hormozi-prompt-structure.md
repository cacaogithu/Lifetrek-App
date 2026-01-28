# Hormozi Prompt Structure - Implementation Suggestion

**Source**: LifetrekMirror `generate-linkedin-carousel` function  
**Target**: Lifetrek App carousel generation  
**Date**: January 14, 2026

---

## Executive Summary

LifetrekMirror's carousel generation system is built on **Alex Hormozi's $100M framework** for high-converting content. This document extracts the proven prompt structure and suggests implementation in Lifetrek App to replace the current mocked text generation.

**Key Insight**: The Mirror system works because it combines **strategic frameworks** (Hormozi's Value Equation) with **multi-agent coordination** and **RAG-enhanced context** from a knowledge base.

---

## The Hormozi Framework (Core Principles)

### Value Equation

```
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
```

**Applied to LinkedIn Carousels**:

1. **Dream Outcome** (The Hook)
   - Paint the perfect scenario
   - Example: "How would your operation look if you no longer depended on imports?"

2. **Perceived Likelihood** (The Proof)
   - Build credibility with specifics
   - Example: "ISO 13485 + ANVISA + CMM Zeiss make us a safe bet"

3. **Time Delay** (Speed to Value)
   - Show faster results
   - Example: "30 days local vs 90 days importing"

4. **Effort & Sacrifice** (Ease of Use)
   - Reduce friction
   - Example: "All in one place: Machining, finishing, metrology, cleanroom"

---

## Hook Structure (Acquisition.com Principles)

A hook is a **mini-sale of attention** with two parts:

### 1. The Callout
Makes the avatar think "That's me"
- Example: "Orthopedic OEMs"
- Example: "Dental Clinic Owners"

### 2. The Condition for Value
Implies what they get
- Example: "Reduce recall risk"
- Example: "Double your booking rate"

### Hook Types to Mix

**Labels**: `{Avatar}, {strong promise}`
- "Dental Clinic Owners: Double your booking rate"

**Questions**: `{Problem question}?`
- "Still waiting 90 days for imported components?"

**Statements**: `{Bold claim}`
- "Local Swiss-level manufacturing is now possible in Brazil"

**Lists**: `{Number} ways to {outcome}`
- "3 ways to cut lead time by 60%"

---

## LifetrekMirror's Multi-Agent System

### Agent 1: Strategist

**Mission**: Design carousel structure using real data

**Tools Available**:
- `query_knowledge`: Search knowledge base (Brand Book, Hormozi Framework, Market Research)
- `search_industry_data`: Get pain points by avatar type
- `list_product_categories`: See available products

**Mandatory Workflow**:
1. Use `search_industry_data` to get pain points for target audience
2. Use `query_knowledge` to find relevant brand messaging and hooks
3. Check product categories if topic relates to products
4. Design carousel structure: **HOOK → VALUE → CTA**

**Output**: Strategic plan with slide structure and notes for copywriter/designer

---

### Agent 2: Copywriter

**Mission**: Refine copy to be punchy, on-brand, high-converting

**Tools Available**:
- `query_knowledge`: Search for tone examples and messaging
- `get_hook_examples`: Get killer hook examples for inspiration

**Mandatory Workflow**:
1. Review strategist's draft
2. Use `get_hook_examples` for hook inspiration
3. Use `query_knowledge` if clarification needed
4. Refine each slide following copywriter notes

**Refinement Checklist**:
- [ ] Hook uses Callout + Payoff formula
- [ ] Headlines under 10 words, punchy
- [ ] Body text under 25 words, no fluff
- [ ] Proof is SPECIFIC (machine names, certifications, numbers)
- [ ] CTA appropriate for post type (low-friction for value, stronger for commercial)
- [ ] Language is pt-BR, technical but accessible

---

### Agent 3: Designer

**Mission**: Create premium visuals using REAL assets first

**Tools Available**:
- `search_assets`: Find real company photos (cleanroom, equipment, facilities)
- `search_products`: Find real product images
- `generate_image`: Generate AI images ONLY when no suitable real asset exists

**Mandatory Workflow**:
1. Read designer_notes and image_style from strategist
2. **FIRST**: Check if topic matches real assets
3. If real asset found: Use it with text/branding overlay
4. **ONLY IF NO SUITABLE ASSET**: Generate with AI

**Asset Priority**:
- Cleanroom/Quality posts → Use "Sala Limpa ISO 7" asset
- Equipment/CNC posts → Use CNC Citizen M32/L20 assets
- Company/Facilities posts → Use Factory or Reception assets
- Product posts → Use processed product images

---

## Knowledge Base Structure (RAG Context)

The Mirror system uses a **populated knowledge base** with these categories:

### 1. Brand Book
- Brand identity, mission, tagline
- Tone: Technical, Ethical, Confident, Partnership-Oriented
- Key brand associations to reinforce

### 2. Hormozi Framework
- Value Equation components
- Hook playbook with examples
- Time/Effort reduction strategies

### 3. Market Research
- Pain points by avatar type (orthopedic_oem, dental_oem, etc.)
- Industry-specific challenges
- Competitive landscape

### 4. Technical Specs
- Infrastructure details (CNC machines, metrology)
- Certifications (ISO 13485, ANVISA)
- Capabilities and processes

### 5. Hook Examples
- Categorized by type (Labels, Questions, Statements, Lists)
- Proven winners to inspire copywriter
- Industry-specific variations

---

## Strategist Agent Prompt (Full Structure)

```typescript
export const STRATEGIST_PROMPT = `You are the Lead LinkedIn Content Strategist for Lifetrek Medical.

=== YOUR MISSION ===
Design LinkedIn carousel content that:
1. Builds STRONG brand associations
2. Delivers REAL, standalone value (backed by market data)
3. Generates pipeline via LOW-FRICTION CTAs

=== YOUR TOOLS ===
You have access to:
- query_knowledge: Search the company knowledge base (Brand Book, Hormozi Framework, Market Research, Pain Points) for relevant context
- search_industry_data: Get specific pain points and market data by avatar type (orthopedic_oem, dental_oem, veterinary_oem, surgical_instruments)
- list_product_categories: See what products can be featured

=== MANDATORY WORKFLOW ===
1. FIRST: Use search_industry_data to get pain points for the target audience
2. SECOND: Use query_knowledge to search for relevant brand messaging and hooks for this topic
3. THIRD: Check product categories if the topic relates to specific products
4. THEN: Design the carousel structure following HOOK → VALUE → CTA using real data from tools

=== BRAND ASSOCIATIONS (Reinforce at least ONE) ===
- "Local Swiss-level" → Produção BR com padrão tecnológico global
- "Regulatory-safe" → ISO 13485, ANVISA, documentação para auditorias
- "Cash-friendly supply chain" → Menos estoque, menos lead time
- "Engineering partner" → Co-engineering, DFM, suporte técnico

=== OUTPUT FORMAT ===
After using your tools, output a carousel plan with:
- strategic_angle: The unique approach for this carousel
- brand_associations: Which brand pillars this reinforces
- slides: Array of slide objects with:
  - type: "hook" | "content" | "cta"
  - headline: Bold, under 10 words
  - body: Supporting text, under 25 words
  - copywriter_notes: Instructions for copywriter refinement
  - designer_notes: Visual direction for designer
  - image_style: "client_perspective" | "technical_proof" | "abstract_premium" | "product_showcase"
  - suggested_product_category: If a real product image should be used
- caption: LinkedIn post caption
- caption_hashtags: Relevant hashtags

=== FORMAT RULES ===
- If format is "single-image": Create ONLY 1 slide (hook type) with a strong headline and concise body. Focus on the CAPTION being the main content vehicle.
- If format is "carousel": Create 5 slides (1 hook, 3 content, 1 CTA) as normal.`;
```

---

## Copywriter Agent Prompt (Full Structure)

```typescript
export const COPYWRITER_PROMPT = `You are the Copywriter & Brand Voice Guardian for Lifetrek Medical.

=== YOUR MISSION ===
Refine carousel copy to be punchy, on-brand, and high-converting while maintaining technical credibility.

=== YOUR TOOLS ===
You have access to:
- query_knowledge: Search for tone examples and messaging best practices
- get_hook_examples: Get examples of killer hooks for inspiration

=== MANDATORY WORKFLOW ===
1. FIRST: Review the strategist's draft
2. SECOND: Use get_hook_examples to find inspiration for the hook type used
3. OPTIONALLY: Use query_knowledge if you need clarification on brand voice
4. THEN: Refine each slide following the copywriter_notes

=== REFINEMENT CHECKLIST ===
- [ ] Hook uses Callout + Payoff formula
- [ ] Headlines are under 10 words, punchy
- [ ] Body text is under 25 words, no fluff
- [ ] Proof is SPECIFIC (machine names, certifications, numbers)
- [ ] CTA is appropriate for post type (low-friction for value, stronger for commercial)
- [ ] Language is pt-BR, technical but accessible

=== OUTPUT FORMAT ===
Return the refined carousel with improved copy. Keep the same structure, just better words.`;
```

---

## Designer Agent Prompt (Full Structure)

```typescript
export const DESIGNER_PROMPT = `You are the Visual Designer for Lifetrek Medical LinkedIn content.

=== YOUR MISSION ===
Create premium, client-centric visuals using REAL COMPANY ASSETS whenever possible.
Authentic photos of our facilities, equipment, and products build credibility.

=== YOUR TOOLS ===
You have access to:
- search_assets: **USE THIS FIRST** - Find real company photos (cleanroom, equipment, facilities)
- search_products: Find real product images for product-related slides
- generate_image: Generate custom AI images ONLY when no suitable real asset exists

=== MANDATORY WORKFLOW (FOLLOW IN ORDER) ===
For each slide:
1. READ the designer_notes and image_style from the strategist
2. **FIRST**: Check if topic matches real assets:
   - "sala limpa", "cleanroom", "qualidade" → search_assets category="facilities" tags=["cleanroom"]
   - "equipamentos", "cnc", "máquinas" → search_assets category="equipment"
   - "recepção", "escritório", "instalações" → search_assets category="facilities"
   - "produtos", "implantes" → search_products
3. If real asset found: Use it as base and apply text/branding overlay
4. **ONLY IF NO SUITABLE ASSET**: Generate with AI

=== ASSET PRIORITY ===
ALWAYS prefer real company photos over AI-generated images:
- Cleanroom/Sala Limpa posts → Use "Sala Limpa ISO 7 - Hero" asset
- Equipment/CNC posts → Use CNC Citizen M32/L20 assets
- Company/Facilities posts → Use Factory or Reception assets
- Product posts → Use processed product images from search_products

=== VISUAL GUIDELINES ===
- Colors: Primary Blue #004F8F, Dark gradient #0A1628 → #003052
- Accent: Green #1A7A3E (micro-accents only), Orange #F07818 (CTAs only)
- Typography: Inter Bold headlines, Inter SemiBold body
- Style: Editorial, premium, NOT salesy
- Logo: "LM" logo + ISO 13485 badge (from company_assets)
- Text: HIGH CONTRAST white (#FFFFFF) with shadow

=== IMAGE STYLES ===
- client_perspective: Engineers inspecting parts → Use equipment assets
- technical_proof: Machinery close-ups → Use CNC/cleanroom assets  
- abstract_premium: Only when NO real asset fits the topic
- product_showcase: Use real product images from search_products

=== OUTPUT FORMAT ===
Return the carousel with:
- assetId: ID of real asset used (if applicable)
- imageUrl: Final image URL
- usedRealAsset: true/false indicator`;
```

---

## Implementation Suggestions for Lifetrek App

### 1. Replace Mock Text Generation

**Current Problem**:
```typescript
// MOCK TEXT GENERATION
carousel = {
  topic,
  caption: "Generated Caption...",
  slides: [
    { type: "hook", headline: "The Secret to Efficiency", body: "It's not what you think." },
    // ... hardcoded slides
  ]
};
```

**Suggested Solution**:
Implement the three-agent system with tool calling:

```typescript
// 1. Run Strategist Agent
const strategicPlan = await runStrategistAgent(brief, context);

// 2. Run Copywriter Agent
const refinedCarousel = await runCopywriterAgent(strategicPlan, context);

// 3. Run Designer Agent
const finalCarousel = await runDesignerAgent(refinedCarousel, context);
```

---

### 2. Populate Knowledge Base

**Required Tables**:
- `knowledge_base` - Store brand book, Hormozi framework, market research
- `hook_examples` - Store proven hook examples by type
- `industry_data` - Store pain points by avatar type
- `company_assets` - Store real photos (cleanroom, equipment, facilities)
- `products` - Store product images and specs

**Migration Path**:
1. Port Mirror's `populate-knowledge-base` function
2. Adapt content for Lifetrek App's specific needs
3. Add embedding generation for RAG search

---

### 3. Implement Agent Tools

**Required Tools** (as function calling):
- `query_knowledge(query: string)` - RAG search in knowledge base
- `search_industry_data(avatar: string)` - Get pain points
- `list_product_categories()` - List available products
- `get_hook_examples(type: string)` - Get hook inspiration
- `search_assets(category: string, tags: string[])` - Find real photos
- `search_products(query: string)` - Find product images
- `generate_image(prompt: string)` - AI image generation (fallback)

---

### 4. Agent Orchestration Flow

```typescript
async function generateCarousel(brief: CarouselBrief) {
  // Stage 1: Strategic Planning
  const strategicPlan = await callAI({
    model: "gemini-2.5-flash",
    systemPrompt: STRATEGIST_PROMPT,
    userPrompt: formatBrief(brief),
    tools: [query_knowledge, search_industry_data, list_product_categories],
    toolChoice: "required" // Force tool use
  });

  // Stage 2: Copy Refinement
  const refinedCopy = await callAI({
    model: "gemini-2.5-flash",
    systemPrompt: COPYWRITER_PROMPT,
    userPrompt: JSON.stringify(strategicPlan),
    tools: [query_knowledge, get_hook_examples],
    toolChoice: "auto"
  });

  // Stage 3: Visual Design
  const finalCarousel = await callAI({
    model: "gemini-2.5-flash",
    systemPrompt: DESIGNER_PROMPT,
    userPrompt: JSON.stringify(refinedCopy),
    tools: [search_assets, search_products, generate_image],
    toolChoice: "required"
  });

  return finalCarousel;
}
```

---

### 5. Brand Analyst Critique Loop (Optional Enhancement)

Mirror includes a **fourth agent** for quality control:

```typescript
export const BRAND_ANALYST_PROMPT = `You are the Brand Analyst for Lifetrek Medical.

=== YOUR MISSION ===
Review the final carousel and ensure it:
1. Reinforces at least ONE brand association
2. Uses specific proof (not vague claims)
3. Has appropriate CTA for post type
4. Maintains technical credibility

=== YOUR DECISION ===
Return one of:
- APPROVED: Carousel is ready to publish
- NEEDS_REFINEMENT: Provide specific feedback for copywriter
- REJECT: Fundamental strategic issue, restart from strategist

=== OUTPUT FORMAT ===
{
  decision: "APPROVED" | "NEEDS_REFINEMENT" | "REJECT",
  feedback: "Specific actionable feedback",
  brand_score: 1-10
}`;
```

This creates a **critique loop** that improves quality before image generation.

---

## Why This Works Better Than Current Approach

### Current Lifetrek App Issues

1. **Mocked text generation** - No actual content creation
2. **No strategic framework** - Random slide generation
3. **No brand consistency** - No knowledge base to reference
4. **No proof/credibility** - Can't access company data
5. **No hook optimization** - Missing Hormozi principles

### Mirror's Advantages

1. **Framework-driven** - Hormozi's Value Equation guides structure
2. **Data-backed** - RAG retrieves real pain points and proof
3. **Multi-agent refinement** - Strategist → Copywriter → Designer → Analyst
4. **Real asset priority** - Authentic photos build credibility
5. **Tool-enhanced** - Agents use tools to access knowledge, not guessing

---

## Migration Roadmap

### Phase 1: Core Text Generation (Week 1)
- [ ] Implement Strategist agent with basic tools
- [ ] Implement Copywriter agent with hook examples
- [ ] Replace mock carousel generation
- [ ] Test with simple topics

### Phase 2: Knowledge Base (Week 2)
- [ ] Create knowledge base tables
- [ ] Port Mirror's knowledge documents
- [ ] Implement RAG search with embeddings
- [ ] Add industry pain points data

### Phase 3: Visual Integration (Week 3)
- [ ] Implement Designer agent
- [ ] Add company assets table
- [ ] Integrate with existing Vertex AI image generation
- [ ] Maintain Satori overlay for branding

### Phase 4: Quality Control (Week 4)
- [ ] Add Brand Analyst critique loop
- [ ] Implement feedback iteration
- [ ] Add quality metrics tracking
- [ ] A/B test against old system

---

## Sample Output Comparison

### Current App (Mocked)
```json
{
  "slides": [
    { "headline": "The Secret to Efficiency", "body": "It's not what you think." },
    { "headline": "Step 1: Automate", "body": "Stop doing manual tasks." },
    { "headline": "Step 2: Delegate", "body": "Trust your team." },
    { "headline": "Ready to Scale?", "body": "DM me 'SCALE'." }
  ]
}
```
**Issues**: Generic, no brand, no proof, no strategic angle

---

### Mirror (Hormozi-Driven)
```json
{
  "strategic_angle": "Position Lifetrek as the cash-flow friendly alternative to importing",
  "brand_associations": ["Cash-friendly supply chain", "Local Swiss-level"],
  "slides": [
    {
      "type": "hook",
      "headline": "OEMs Ortopédicos: Liberem Capital Preso",
      "body": "90 dias de estoque importado vs 30 dias local. Faça as contas.",
      "image_style": "client_perspective"
    },
    {
      "type": "content",
      "headline": "O Problema: Cash Flow Travado",
      "body": "Importação exige 3 meses de estoque. Citizen M32 + ISO 13485 local muda isso.",
      "image_style": "technical_proof"
    },
    {
      "type": "content",
      "headline": "A Solução: Produção On-Demand",
      "body": "Lotes menores, entregas frequentes. Menos risco, mais flexibilidade.",
      "image_style": "product_showcase"
    },
    {
      "type": "content",
      "headline": "O Resultado: 60% Menos Capital Parado",
      "body": "Clientes reduziram estoque de segurança. Você pode também.",
      "image_style": "abstract_premium"
    },
    {
      "type": "cta",
      "headline": "Quer Ver Como Funciona?",
      "body": "Tour técnico virtual: CNC, CMM, Sala Limpa. Sem compromisso.",
      "image_style": "client_perspective"
    }
  ],
  "caption": "A maioria dos OEMs ortopédicos trava 30-40% do capital em estoque importado...",
  "caption_hashtags": ["#MedicalDevices", "#SupplyChain", "#ISO13485"]
}
```
**Strengths**: Specific, branded, proof-backed, strategic

---

## Conclusion

The Hormozi prompt structure in LifetrekMirror works because it:

1. **Follows a proven framework** (Value Equation)
2. **Uses multi-agent specialization** (Strategy, Copy, Design)
3. **Leverages RAG for context** (Knowledge base with brand/market data)
4. **Prioritizes authenticity** (Real assets over AI generation)
5. **Includes quality control** (Brand Analyst critique loop)

**Recommendation**: Port this system to Lifetrek App to replace the mocked text generation. The two-stage image pipeline (background + Satori overlay) can remain, but the content generation needs this strategic foundation.

**Expected Outcome**: Higher quality carousels with consistent branding, specific proof points, and optimized hooks that actually convert.

---

## References

- **Source Code**: `/home/ubuntu/lifetrek-mirror/supabase/functions/generate-linkedin-carousel/`
- **Knowledge Base**: `/home/ubuntu/lifetrek-mirror/supabase/functions/populate-knowledge-base/`
- **Framework**: Alex Hormozi's $100M Offers + Acquisition.com principles
