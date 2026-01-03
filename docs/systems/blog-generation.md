# Blog Generation System Manual

**Purpose**: Generate SEO-optimized blog posts for Lifetrek Medical following brand guidelines and commercial proposal requirements (24 posts over 6 months, 4 posts/month).

**Target Audience**: Sales Engineer / Marketing Team

**Tools Used**:
- **Execution**: `supabase/functions/generate-blog-post` (Edge Function)
- **Execution**: `execution/generate_blog_content.py` (Python script)
- **Orchestration**: n8n workflow `blog_content_pipeline.json`

---

## Content Strategy

### Target Audience
- Medical device manufacturers (OEMs)
- Dental implant companies
- Orthopedic device companies
- Surgical instrument manufacturers
- Quality/regulatory professionals

### Content Categories
1. **Educacional** (Educational) - 40%
   - Technical guides (DFM, tolerances, materials)
   - Regulatory explanations (ISO 13485, ANVISA, FDA)
   - Manufacturing processes (CNC, Swiss turning, CMM inspection)

2. **Produto** (Product) - 30%
   - Equipment capabilities (Citizen L32, ZEISS CMM)
   - Cleanroom standards (ISO 7)
   - Manufacturing services (dental, orthopedic, instruments)

3. **Mercado** (Market) - 20%
   - Industry trends (Trump tariffs, supply chain)
   - Market analysis (Brazil medical device market)
   - Regulatory updates (ANVISA changes)

4. **Prova Social** (Social Proof) - 10%
   - Case studies (anonymized client projects)
   - Success stories (time/cost savings)
   - Client testimonials

---

## Topic Library (Sample Plan)

### Month 1: Foundation
1. **ISO 13485 explicado: O que é e por que importa**
   - Keywords: `iso 13485, certificação médica, dispositivos médicos`
   - Category: Educacional
   
2. **Como escolher fornecedor de implantes ortopédicos no Brasil**
   - Keywords: `fornecedor implantes, ortopedia brasil, escolher fabricante`
   - Category: Educacional

3. **ZEISS CMM: Precisão micrométrica em metrologia médica**
   - Keywords: `zeiss cmm, metrologia médica, precisão micrométrica`
   - Category: Produto

4. **Comparativo: Importação vs Fabricação Local de Dispositivos Médicos**
   - Keywords: `fabricação local, importação dispositivos, made in brazil`
   - Category: Mercado

*(See full topic library in internal planning documents if available)*

---

## Content Generation Workflow

### Input Requirements
1. **Topic**: From topic library above OR custom topic from Sales Engineer
2. **Keywords**: 3-5 target SEO keywords
3. **Category**: Educational, Product, Market, or Social Proof
4. **Research Context** (optional): Perplexity API results, news mentions

### Generation Process

#### Step 1: Research (Optional)
Use Perplexity to gather recent market data if needed.

#### Step 2: Load Context
The system automatically loads:
- Company context: `docs/brand/COMPANY_CONTEXT.md`
- Brand guidelines: `docs/brand/BRAND_BOOK.md`
- SEO directive: `docs/systems/seo-strategy.md`

#### Step 3: Generate Content via AI
You can trigger the generation using the Edge Function or the Python script.

**Using Python Script:**
```bash
python execution/generate_blog_content.py --topic "Your Topic Here"
```

#### Step 4: Quality Validation
Check generated content for:
- [ ] Title length: 50-70 characters
- [ ] SEO title: <60 characters
- [ ] SEO description: 150-160 characters
- [ ] Content length: 800-1500 words
- [ ] H2 headers: 3-5 sections
- [ ] Internal links: 2-3 to Products/Contact/Other posts
- [ ] CTA: Ends with contact form link

#### Step 5: Save as Draft
The system saves the post to the database with status `pending_review`.

#### Step 6: Human Review
- Review content for accuracy.
- Adjust tone/technical details if needed.
- Change status to `published` when ready.

---

## Content Structure Template

### Standard Article Format

```html
<h2>Introdução</h2>
<p>Breve introdução ao tópico (150-200 palavras). Mencione por que é importante para fabricantes de dispositivos médicos.</p>

<h2>Contexto e Definições</h2>
<p>Explique termos técnicos, contexto histórico, ou fundamentos necessários.</p>

<h2>Aplicação Prática</h2>
<p>Como isso se aplica à fabricação de dispositivos médicos? Exemplos concretos.</p>

<h2>A Abordagem da Lifetrek Medical</h2>
<p>Como a Lifetrek aplica esses conceitos? Mencione certificações (ISO 13485), equipamentos (Citizen L32, ZEISS CMM), processos (sala limpa ISO 7).</p>

<h2>Conclusão</h2>
<p>Resumo dos pontos principais. Reforçar valor para o leitor.</p>
```

---

## Troubleshooting

### Issue: AI generates generic content
**Solution**: Add more specific research context. Include Lifetrek-specific details in prompt (equipment models, certifications, client examples).

### Issue: Content too technical
**Solution**: Request "Explain for a non-technical audience". Include analogies and simplified explanations.

### Issue: Content too sales-y
**Solution**: Emphasize educational value. Limit CTAs to conclusion only. Focus on teaching, not selling.

### Issue: Low SEO score
**Solution**: Run `execution/calculate_seo_score.py` to identify specific issues.
