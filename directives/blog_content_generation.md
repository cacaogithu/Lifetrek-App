# Blog Content Generation Directive

**Purpose**: Generate SEO-optimized blog posts for Lifetrek Medical following brand guidelines and commercial proposal requirements (24 posts over 6 months, 4 posts/month).

**Owner**: Sales Engineer / Marketing Team

**Tools to Use**:
- Execution: `supabase/functions/generate-blog-post` (Edge Function)
- Execution: `execution/generate_blog_content.py` (Python script)
- Orchestration: n8n workflow `blog_content_pipeline.json`

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

## Topic Library (24 Posts for 6 Months)

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

### Month 2: Technical Depth
5. **Tolerâncias micrométricas em dispositivos médicos: Guia completo**
   - Keywords: `tolerâncias micrométricas, precisão médica, especificações técnicas`
   - Category: Educacional

6. **Guia DFM: Design for Manufacturing para implantes médicos**
   - Keywords: `dfm médico, design for manufacturing, otimização implantes`
   - Category: Educacional

7. **Sala limpa ISO 7: Padrões e requisitos para dispositivos médicos**
   - Keywords: `sala limpa iso 7, cleanroom médico, controle contaminação`
   - Category: Produto

8. **Citizen L32: Usinagem CNC de alta precisão para implantes**
   - Keywords: `citizen l32, cnc médico, usinagem precisão`
   - Category: Produto

### Month 3: Materials & Processes
9. **Materiais para implantes: Titânio Ti-6Al-4V vs Aço Inoxidável 316L**
   - Keywords: `titânio ti6al4v, aço 316l, materiais implantes`
   - Category: Educacional

10. **Processo de validação de implantes médicos segundo ISO 13485**
    - Keywords: `validação implantes, iso 13485, processo validação`
    - Category: Educacional

11. **Usinagem Swiss Turning: Vantagens para componentes médicos miniaturizados**
    - Keywords: `swiss turning, usinagem suíça, componentes miniaturizados`
    - Category: Produto

12. **Tarifas Trump: Impacto na fabricação de dispositivos médicos no Brasil**
    - Keywords: `tarifas importação, dispositivos médicos brasil, trump tariffs`
    - Category: Mercado

### Month 4: Quality & Compliance
13. **Inspeção 100% CMM: Por que é essencial em dispositivos médicos**
    - Keywords: `inspeção cmm, controle qualidade, metrologia tridimensional`
    - Category: Produto

14. **ANVISA: Guia de certificação para fabricantes de dispositivos médicos**
    - Keywords: `anvisa certificação, registro dispositivos, regulamentação brasil`
    - Category: Educacional

15. **Acabamento superficial em implantes: Ra, rugosidade e biocompatibilidade**
    - Keywords: `acabamento superficial, rugosidade implantes, ra médico`
    - Category: Educacional

16. **Case Study: Redução de 40% no custo com fabricação local**
    - Keywords: `case implantes, fabricação local, redução custos`
    - Category: Prova Social

### Month 5: Advanced Topics
17. **Implantes dentários: Especificações técnicas e processos de fabricação**
    - Keywords: `implantes dentários, especificações técnicas, fabricação dental`
    - Category: Produto

18. **Tratamento térmico de componentes médicos em Titânio**
    - Keywords: `tratamento térmico, titânio médico, propriedades mecânicas`
    - Category: Educacional

19. **Instrumentos cirúrgicos: Requisitos de precisão e durabilidade**
    - Keywords: `instrumentos cirúrgicos, precisão cirúrgica, durabilidade médica`
    - Category: Produto

20. **Mercado brasileiro de dispositivos médicos: Tendências 2025**
    - Keywords: `mercado médico brasil, tendências 2025, indústria dispositivos`
    - Category: Mercado

### Month 6: Expertise Showcase
21. **Implantes veterinários: Adaptações e especificidades técnicas**
    - Keywords: `implantes veterinários, dispositivos veterinários, ortopedia animal`
    - Category: Produto

22. **30 anos de excelência: História da Lifetrek Medical**
    - Keywords: `lifetrek medical, 30 anos, história fabricação`
    - Category: Prova Social

23. **Prototipagem rápida de dispositivos médicos: Do CAD ao produto final**
    - Keywords: `prototipagem rápida, cad médico, desenvolvimento produto`
    - Category: Educacional

24. **Checklist completo: Como qualificar um novo fornecedor médico**
    - Keywords: `qualificação fornecedor, auditoria médica, seleção fabricante`
    - Category: Educacional

---

## Content Generation Workflow

### Input Requirements
1. **Topic**: From topic library above OR custom topic from Sales Engineer
2. **Keywords**: 3-5 target SEO keywords
3. **Category**: Educational, Product, Market, or Social Proof
4. **Research Context** (optional): Perplexity API results, news mentions

### Generation Process

#### Step 1: Research (if enabled)
```bash
# Call Perplexity API for market research
curl -X POST "https://api.perplexity.ai/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -d '{
    "model": "sonar",
    "messages": [{
      "role": "user",
      "content": "Pesquise informações recentes sobre: [TOPIC]. Foque em mercado brasileiro de dispositivos médicos, regulamentações ANVISA, e tendências da indústria."
    }]
  }'
```

#### Step 2: Load Context
- Company context: `docs/brand/COMPANY_CONTEXT.md`
- Brand guidelines: `docs/brand/BRAND_BOOK.md`
- SEO directive: `directives/seo_optimization.md`

#### Step 3: Generate Content via AI
Call Edge Function or Python script:
```typescript
const { data } = await supabase.functions.invoke('generate-blog-post', {
  body: {
    topic: "ISO 13485 explicado",
    keywords: ["iso 13485", "certificação médica", "dispositivos médicos"],
    category_id: "uuid-of-educational-category",
    research_context: perplexityResults // optional
  }
});
```

#### Step 4: Quality Validation
Check generated content:
- [ ] Title length: 50-70 characters
- [ ] SEO title: <60 characters
- [ ] SEO description: 150-160 characters
- [ ] Content length: 800-1500 words
- [ ] H2 headers: 3-5 sections
- [ ] Internal links: 2-3 to Products/Contact/Other posts
- [ ] Keywords: Appears in title, first paragraph, H2 headers
- [ ] Brand mentions: References ISO 13485, ANVISA, 30+ years
- [ ] CTA: Ends with contact form link

#### Step 5: Save as Draft
```sql
INSERT INTO blog_posts (
  title, slug, content, excerpt,
  category_id, seo_title, seo_description,
  keywords, tags, status, ai_generated
) VALUES (..., 'pending_review', true);
```

#### Step 6: Human Review
- Sales Engineer reviews content for accuracy
- Adjust tone/technical details if needed
- Approve → Change status to `published`, set `published_at`
- Reject → Add notes, regenerate or edit manually

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

<h3>Exemplo 1: [Caso específico]</h3>
<p>Detalhe um caso de uso.</p>

<h3>Exemplo 2: [Outro caso]</h3>
<p>Outro exemplo relevante.</p>

<h2>A Abordagem da Lifetrek Medical</h2>
<p>Como a Lifetrek aplica esses conceitos? Mencione certificações (ISO 13485), equipamentos (Citizen L32, ZEISS CMM), processos (sala limpa ISO 7).</p>

<h2>Melhores Práticas</h2>
<ul>
  <li>Prática 1</li>
  <li>Prática 2</li>
  <li>Prática 3</li>
</ul>

<h2>Conclusão</h2>
<p>Resumo dos pontos principais. Reforçar valor para o leitor.</p>

<p><strong>Precisa de um parceiro de confiança para fabricação de dispositivos médicos?</strong> <a href="/contact">Entre em contato com a Lifetrek Medical</a> e descubra como nossos 30+ anos de experiência e certificação ISO 13485 podem agregar valor ao seu projeto.</p>
```

---

## Brand Voice Guidelines (from Brand Book)

### Tone Attributes
- **Technical but Accessible**: Expert without jargon overload
- **Confident**: Assured in capabilities
- **Professional**: Business-focused, serious
- **Partnership-Oriented**: Collaborative, supportive
- **Quality-Focused**: Emphasis on precision and excellence

### Writing Rules
**Do:**
- Use active voice
- Be specific with technical details
- Focus on client benefits
- Use "we" for company actions, "you" for client benefits
- Emphasize partnership ("together", "collaborate", "partner")
- Reference certifications (ISO 13485, ANVISA)
- Mention 30+ years of experience

**Don't:**
- Avoid hyperbole or exaggeration
- Don't use marketing clichés ("best in class", "revolutionary")
- Avoid overly technical jargon without explanation
- Don't make claims without backing them up
- Avoid casual or informal language

---

## SEO Optimization Checklist

For each post, ensure:

### On-Page SEO
- [ ] Title tag: 50-60 chars, includes primary keyword
- [ ] Meta description: 150-160 chars, compelling, includes keyword
- [ ] URL slug: lowercase, hyphens, includes keyword
- [ ] H1 tag: One per page, includes primary keyword
- [ ] H2/H3 hierarchy: Logical structure, includes secondary keywords
- [ ] Image alt text: Descriptive, includes keywords when natural
- [ ] Internal links: 2-3 links to Products, Contact, other blog posts
- [ ] External links: 1-2 authoritative sources (ANVISA, ISO, industry publications)
- [ ] Keyword density: 1-2% (natural usage)
- [ ] Word count: 800-1500 words

### Technical SEO
- [ ] Schema markup: Article structured data
- [ ] Canonical URL: Set to avoid duplicates
- [ ] Mobile-friendly: Responsive design
- [ ] Page speed: <3s load time (optimize images)
- [ ] HTTPS: Ensure secure connection

### Content Quality
- [ ] Original content (no plagiarism)
- [ ] Expert perspective (leverage Lifetrek's 30+ years)
- [ ] Actionable information (readers can apply knowledge)
- [ ] Updated information (check date relevance)

---

## Edge Cases & Troubleshooting

### Issue: AI generates generic content
**Solution**: Add more specific research context from Perplexity. Include Lifetrek-specific details in prompt (equipment models, certifications, client examples).

### Issue: Content too technical
**Solution**: Add "Explain for a non-technical audience" to prompt. Include analogies and simplified explanations.

### Issue: Content too sales-y
**Solution**: Emphasize educational value in prompt. Limit CTAs to conclusion only. Focus on teaching, not selling.

### Issue: Missing brand consistency
**Solution**: Reload `BRAND_BOOK.md` in prompt context. Explicitly mention: "Follow Lifetrek brand voice: professional, technical, partnership-oriented."

### Issue: Low SEO score
**Solution**: Run `execution/calculate_seo_score.py` to identify specific issues. Common fixes:
- Shorten title/description
- Add more internal links
- Increase keyword usage (naturally)
- Add image alt text

### Issue: Duplicate content concerns
**Solution**: 
- Always generate new angles on topics
- Use Lifetrek-specific examples and data
- Run plagiarism check before publishing
- Focus on unique expertise (30+ years, ISO 13485 certified)

---

## Success Metrics

Track monthly (aligned with commercial proposal):

### Content Production
- Target: 4 posts/month × 6 months = 24 posts
- AI-generated: 90% (with human review)
- Published on schedule: 100%

### SEO Performance
- **Months 1-3**: 
  - Google indexing: 100% of posts
  - Avg position: Top 50 for target keywords
  - Organic traffic: 50-200 visits/month

- **Months 4-6**:
  - Avg position: Top 20 for target keywords
  - Organic traffic: 200-500 visits/month
  - Featured snippets: 2-3 posts

### Lead Generation
- Conversion rate: 1-3% (blog visitors → contact form)
- Leads from blog: 2-15/month by month 6
- Lead quality: Medical device OEMs, qualified prospects

### Engagement
- Avg time on page: >2 minutes
- Bounce rate: <60%
- Pages per session: >1.5 (internal linking working)

---

## Update History

- **2025-12-30**: Initial directive created
- **Future**: Update with learnings from first batch of posts
