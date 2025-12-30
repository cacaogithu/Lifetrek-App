# Lifetrek Medical - Email Templates

Este diretório contém templates de email HTML profissionais e responsivos para campanhas de outreach da Lifetrek Medical.

## 📋 Templates Disponíveis

### 1. Base Template (`base-template.html`)
Template base com toda a estrutura de branding da Lifetrek. Use como referência para criar novos templates.

**Características:**
- Header com logo e tagline
- Seções de conteúdo personalizáveis
- Botões CTA com cores da marca
- Footer com certificações e links
- Design responsivo para mobile

### 2. Cold Email - Ortopedia (`cold-email-orthopedic.html`)
Template para primeiro contato com fabricantes de dispositivos ortopédicos.

**Uso:**
- Sistemas de trauma e coluna
- Implantes ortopédicos
- Parafusos e placas

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[linhas específicas / trauma / coluna]` - Linha de produtos específica
- `[mercado / país X]` - Mercado/país de atuação

### 3. Cold Email - Odontologia (`cold-email-dental.html`)
Template para primeiro contato com empresas de implantes dentários.

**Uso:**
- Implantes dentários
- Pilares e componentes
- Kits cirúrgicos odontológicos

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[mercado X]` - Mercado de atuação

### 4. Follow-up Template (`follow-up-template.html`)
Template para emails de acompanhamento (2ª ou 3ª tentativa de contato).

**Uso:**
- Retomar conversas sem resposta
- Adicionar valor com case studies
- Oferecer múltiplas opções de próximo passo

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[tipo de componente/nicho]` - Tipo de componente mencionado anteriormente
- `[nicho similar]` - Nicho similar para case study

### 5. Reply - Inbound Inquiry (`reply-inbound-inquiry.html`)
Template para responder consultas recebidas (inbound).

**Uso:**
- Responder leads que entraram em contato
- Qualificar o projeto
- Solicitar informações técnicas

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[tipo de componente/projeto]` - Tipo de componente/projeto mencionado
- `[EMPRESA]` - Nome da empresa
- `[aplicação/nicho]` - Aplicação ou nicho específico
- `[NICHO]` - Nicho para experiência relevante
- `[SEU NOME]` - Nome do vendedor/engenheiro

## 🎨 Guia de Branding

### Cores Principais
- **Primary Blue:** `#004F8F` - Botões CTA, títulos principais
- **Primary Blue Hover:** `#003D75` - Estados hover
- **Innovation Green:** `#1A7A3E` - Destaques positivos, checkmarks
- **Energy Orange:** `#F07818` - Chamadas de atenção, urgência
- **Text Primary:** `#2C3E50` - Texto principal
- **Text Muted:** `#5A6C7D` - Texto secundário
- **Background Light:** `#F5F7FA` - Fundos suaves

### Tipografia
- **Font Family:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Body Text:** 16px (15px em mobile)
- **Headings:** 20-28px, font-weight: 700
- **Line Height:** 1.7 para legibilidade

### Componentes Reutilizáveis

#### Highlight Box
```html
<div class="highlight-box">
    <p>Texto destacado com borda azul</p>
</div>
```

#### CTA Button
```html
<div class="cta-container">
    <a href="[LINK]" class="cta-button">Texto do Botão</a>
</div>
```

#### Feature List
```html
<div class="value-props">
    <div class="value-item">
        <div class="value-icon">
            <div class="value-icon-circle">✓</div>
        </div>
        <div class="value-content">
            <div class="value-title">Título</div>
            <div class="value-desc">Descrição</div>
        </div>
    </div>
</div>
```

## 📱 Responsividade

Todos os templates são responsivos e otimizados para:
- Desktop (600px+)
- Tablet (480px - 600px)
- Mobile (< 480px)

### Breakpoints
- `@media only screen and (max-width: 600px)` - Ajustes para mobile

## ✅ Checklist de Personalização

Antes de enviar um email, verifique:

- [ ] Substituir todos os placeholders `[NOME]`, `[EMPRESA]`, etc.
- [ ] Verificar links de CTA (mailto, URLs)
- [ ] Confirmar informações de contato no footer
- [ ] Testar em diferentes clientes de email (Gmail, Outlook, Apple Mail)
- [ ] Verificar ortografia e gramática
- [ ] Confirmar que o nicho/segmento está correto

## 🧪 Testes

### Clientes de Email Testados
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail

### Ferramentas de Teste Recomendadas
- [Litmus](https://litmus.com/) - Teste em múltiplos clientes
- [Email on Acid](https://www.emailonacid.com/) - Validação de renderização
- [Mail Tester](https://www.mail-tester.com/) - Score de deliverability

## 📊 Melhores Práticas

### Subject Lines (Assuntos)
- Máximo 50 caracteres
- Específico ao nicho
- Evitar palavras de spam ("grátis", "urgente", etc.)
- Mencionar certificação ou benefício claro

**Exemplos:**
- ✅ "Fornecedor ISO 13485 p/ sistemas de trauma e coluna"
- ✅ "Apoio em usinagem de implantes odontológicos"
- ❌ "Oportunidade incrível para sua empresa!"

### Corpo do Email
- Máximo 150-200 palavras para cold emails
- Personalização na primeira linha
- Um problema claro + uma solução
- CTA único e específico
- Tom consultivo, não vendedor

### Timing
- Melhores dias: Terça, Quarta, Quinta
- Melhores horários: 9h-11h ou 14h-16h (horário de Brasília)
- Evitar: Segunda de manhã, Sexta à tarde, finais de semana

### Follow-up Cadence
1. **Dia 0:** Cold email inicial
2. **Dia 3:** Follow-up com valor adicional (case study)
3. **Dia 7:** Follow-up final com múltiplas opções
4. **Dia 14:** Breakup email (porta aberta)

## 🔗 Integração com CRM

Estes templates podem ser integrados com:
- Supabase (já configurado no projeto)
- HubSpot
- Pipedrive
- ActiveCampaign

### Campos de Merge Tags
Para automação, use estas variáveis:
- `{{contact.first_name}}` → Nome
- `{{contact.company}}` → Empresa
- `{{contact.industry}}` → Nicho/Indústria
- `{{contact.product_line}}` → Linha de produtos
- `{{contact.country}}` → País/Mercado

## 📝 Notas de Implementação

### Para Desenvolvedores
- Todos os estilos são inline para compatibilidade
- Tabelas usadas para layout (padrão em email HTML)
- Reset CSS incluído para normalização
- Imagens devem ser hospedadas externamente (CDN)

### Para Equipe de Vendas
- Sempre personalizar a primeira linha
- Mencionar algo específico da empresa/produto
- Manter tom profissional mas acessível
- Focar em "big fast value" (valor rápido)
- Um CTA claro por email

## 📞 Suporte

Para dúvidas sobre os templates:
- **Técnicas:** Equipe de desenvolvimento
- **Conteúdo:** Equipe de marketing/vendas
- **Design:** Seguir BRAND_BOOK.md na raiz do projeto

## 🔄 Versionamento

- **v1.0** (Dez 2024) - Templates iniciais criados
  - Base template
  - Cold email ortopedia
  - Cold email odontologia
  - Follow-up
  - Reply inbound

---

**Última atualização:** Dezembro 2024  
**Mantido por:** Equipe Lifetrek Medical

---

## 🎯 Sales Engineer Usage Guide (English)

### CRITICAL: Every Email Must Be Personalized

**Never send a template as-is.** Each email requires company-specific research and customization.

### Before Sending ANY Email

Complete this pre-send checklist:

- [ ] **Company Website Reviewed** (5-10 min)
  - Note 2-3 specific products/services they offer
  - Identify their target market (OEM, distributor, end-user)
  - Check for recent news/press releases (Google News search)
  
- [ ] **LinkedIn Research** (5 min)
  - Company page: employee count, recent posts, growth signals
  - Decision maker profile: background, recent activity, common connections
  
- [ ] **Competitive Context** (2 min)
  - Who are they likely using now?
  - What pain points might they have?
  - How does Lifetrek differentiate?

### Template-Specific Personalization Guide

#### Cold Email  - Orthopedic (`cold-email-orthopedic.html`)

**When to use:**
- Orthopedic implant manufacturers (trauma, spine, joints)
- Companies producing screws, plates, rods, cages, instruments
- Lead mentions "orthopedic", "spinal", "trauma" in industry field

**Required personalizations:**

1. **Opening line (Line 1):**
   - ❌ Generic: "We work with medical device companies..."
   - ✅ Specific: "I noticed [Company] manufactures titanium pedicle screws for cervical fusion procedures..."
   - **How to find:** Look at their website product page, note specific product names

2. **Pain point (Mid-section):**
   -Match their likely challenge:
     - High-scrap rates with complex geometries → "reduce scrap from 15% to <3%"
     - Tight tolerances for FDA compliance → "consistently hit ±0.0001" tolerances"
     - Material challenges (titanium, PEEK) → "extensive experience with biocompatible materials"

3. **Proof point (Value props section):**
   - If they mention ISO 13485: Highlight "We're ISO 13485 certified..."
   - If they're OEM: "We've helped OEMs reduce lead times by 40%..."
   - If they're startup: "We work with emerging companies, flexible MOQs..."

4. **CTA alignment:**
   - OEM → "Quick call to discuss your production challenges?"
   - Distributor → "See our capabilities deck for your product line?"
   - In-house manufacturing → "Review specifications together?"

**Example good personalization:**
```
Subject: ISO 13485 partner for titanium spinal screws

Hi [First Name],

I noticed [Company] manufactures polyaxial pedicle screw systems for lumbar fusion - 
a product line where precision and biocompatibility are non-negotiable.

We're an ISO 13485-certified precision machine shop specializing in complex orthopedic 
components. We've helped similar OEMs reduce scrap rates from 12% to under 3% on 
titanium Grade 5 screws with your exact tolerance requirements.

Would a 15-minute call make sense to explore if we could support your production?

Best,
[Your Name]
```

---

#### Cold Email - Dental (`cold-email-dental.html`)

**When to use:**
- Dental implant manufacturers
- Abutment, healing cap, prosthetic component producers
- Companies in orthodontics, restorative dentistry

**Key differences from orthopedic:**
- Focus on biocompatible materials: titanium, zirconia, PEEK
- Mention surface treatments and coatings if applicable
- Highlight high-volume production capabilities (dental is often higher volume)

**Personalization points:**
Same structure as orthopedic, but dental-specific examples:
- "I saw [Company] produces zirconia abutments for multi-unit restorations..."
- "implant systems compatible with Nobel Biocare platforms..."
- "tight tolerances required for proper seating and osseointegration..."

---

#### Follow-Up Template (`follow-up-template.html`)

**When to use:**
- 5-7 business days after initial email (no response)
- After a discovery call (confirming next steps)
- After sending proposal (checking in)

**Personalization strategy:**

1. **Reference previous context:**
   - "Following up on my email about [specific topic]..."
   - "After our call about [specific pain point]..."

2. **Add NEW value:**
   - Share a relevant case study
   - Link to an article/resource
   - Offer a specific insight about their market

3. **Keep it SHORT:**
   - 3-4 sentences max
   - Single clear CTA
   - No pressure, just helpfulness

**Example:**
```
Subject: Quick follow-up - [Company] spinal screw production

Hi [Name],

Quick follow-up on my email about supporting your titanium screw production.

I just came across this case study of a similar OEM we helped reduce their cycle 
time by 35% on polyaxial screw assemblies - thought it might be relevant: [link]

Still interested in a brief call to explore fit?

Best,
[Your Name]
```

---

#### Reply - Inbound Inquiry (`reply-inbound-inquiry.html`)

**When to use:**
- Lead contacted you (form submission, email, LinkedIn)
- Response time: < 4 hours (same business day)

**Key principles:**
- Thank them for reaching out
- Acknowledge their specific inquiry
- Ask clarifying questions to qualify
- Provide next steps

**Qualifying questions to include:**
- "What volumes are you currently producing?"
- "What tolerances are required?"
- "What material(s)?"
- "What's driving the inquiry? (new product, current vendor issues, capacity)"
- "Timeline for decision?"

---

### Common Mistakes to Avoid

❌ **Sending template without personalization**
- Results in low response rates, damages credibility

❌ **Generic opening lines**
- "We specialize in medical device manufacturing..." (they don't care about you yet)
- Better: "I noticed you manufacture X, which requires Y..."

❌ **Too much about Lifetrek, not enough about them**
- Focus: 70% about their needs/challenges, 30% about how you can help

❌ **Multiple CTAs in one email**
- Pick ONE: schedule call OR see deck OR answer question
- Multiple CTAs = analysis paralysis

❌ **Promising timelines/specs without engineering review**
- Never say "We can deliver in 2 weeks" or "We can hit those tolerances"
- Always: "Let me review with our engineering team and get back to you"

---

### Response Handling

**If they respond positively:**
- Reply within 2 hours
- Suggest 2-3 specific meeting times
- Share meeting link (Calendly, Google Meet)

**If they respond with objections:**
- Acknowledge concern
- Ask clarifying questions
- Provide relevant case study or proof point
- Don't argue - seek to understand

**If they say "not interested":**
- Thank them for responding
- Ask if you can follow up in 6 months
- Request feedback (why not a fit?)
- Update CRM to "Do Not Contact" if they request

**If they ask for pricing:**
- Never quote without specs
- Response: "To provide accurate pricing, I'd need to understand your specific requirements. Could we schedule a quick call to review specifications?"

---

### Metrics to Track

For each template, track:
- **Send volume**
- **Open rate** (if using tracking)
- **Response rate** (% who reply)
- **Meeting rate** (% who schedule call)
- **Conversion rate** (% who become opportunities)

Use this data to:
- Identify which templates perform best
- A/B test subject lines
- Refine personalization approaches
- Share learnings with team

---

### Quick Reference: Personalization Variables

Replace these placeholders in every template:

| Placeholder | Example | Where to Find |
|-------------|---------|---------------|
| `[NOME]` / `[First Name]` | "John" | LinkedIn, company website team page |
| `[EMPRESA]` / `[Company]` | "Acme Medical Devices" | Email signature, website |
| `[Product/line]` | "titanium spinal screws" | Website products page |
| `[Market/niche]` | "orthopedic trauma systems" | Website, LinkedIn, press releases |
| `[Certification]` | "ISO 13485" | Website footer, about page |
| `[Pain point]` | "reducing scrap rates" | Industry knowledge, LinkedIn posts |

