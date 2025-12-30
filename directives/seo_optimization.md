# SEO Optimization Directive

**Purpose**: Implement complete SEO strategy for Lifetrek Medical blog to achieve 50-500 organic visits/month and 2-15 leads/month by month 6.

**Owner**: Sales Engineer / Marketing Team

**Tools to Use**:
- Execution: `execution/calculate_seo_score.py` (audit script)
- Execution: `execution/sitemap_generator.py` (sitemap generation)
- External: Google Search Console, Google Keyword Planner

---

## SEO Strategy Overview

### Target Market
- **Geography**: Brazil (primary), Latin America (secondary)
- **Language**: Portuguese (pt-BR)
- **Search Intent**: Informational (how-to, guides) + Commercial (vendor selection, comparison)

### Target Keywords
**Primary** (High volume, high intent):
- fabricação dispositivos médicos brasil
- implantes ortopédicos fornecedor
- iso 13485 certificação
- usinagem cnc médica
- implantes dentários brasil

**Secondary** (Lower volume, specific):
- zeiss cmm metrologia
- sala limpa iso 7
- citizen l32 usinagem
- titânio ti6al4v implantes
- dfm dispositivos médicos

**Long-tail** (Very specific, high conversion):
- como escolher fornecedor implantes ortopédicos brasil
- diferença importação fabricação local dispositivos médicos
- tolerâncias micrométricas implantes médicos
- validação iso 13485 anvisa brasil

---

## On-Page SEO Checklist

For EVERY blog post, validate these elements:

### 1. Title Tag
```html
<title>Primary Keyword: Specific Topic | Lifetrek Medical</title>
```

**Requirements**:
- Length: 50-60 characters (ideal)
- Primary keyword: First 5 words
- Brand name: End of title
- Compelling: Encourages clicks
- Unique: Different from all other pages

**Examples**:
- ✅ GOOD: "ISO 13485 Certificação: Guia Completo | Lifetrek Medical"
- ❌ BAD: "What is ISO 13485 and why you need it for medical devices manufacturing in Brazil"

### 2. Meta Description
```html
<meta name="description" content="Compelling summary with primary keyword and call to action.">
```

**Requirements**:
- Length: 150-160 characters (ideal)
- Primary keyword: First sentence
- Benefit-focused: What will reader learn?
- Call to action: "Saiba mais", "Descubra", "Entenda"
- Unique: Different from all other pages

**Examples**:
- ✅ GOOD: "Descubra como a certificação ISO 13485 garante qualidade em dispositivos médicos. Guia completo com requisitos, processo e benefícios para fabricantes."
- ❌ BAD: "This article talks about ISO 13485 certification and its importance in the medical device industry."

### 3. URL Slug
```
https://lifetrekmedical.com.br/blog/primary-keyword-topic
```

**Requirements**:
- Lowercase only
- Hyphens (not underscores) for spaces
- Primary keyword included
- 3-5 words maximum
- No stop words (de, da, para, com) if possible
- No special characters or accents

**Examples**:
- ✅ GOOD: `iso-13485-certificacao-dispositivos-medicos`
- ❌ BAD: `o-que-e-a-certificacao-iso-13485-e-por-que-voce-precisa-dela`

### 4. Header Structure

```html
<h1>Single H1: Page Title (include primary keyword)</h1>

<h2>Section 1: Secondary Keyword</h2>
<p>Content...</p>

<h3>Subsection 1.1</h3>
<p>Content...</p>

<h2>Section 2: Another Secondary Keyword</h2>
<p>Content...</p>

<h2>Section 3: Long-tail Keyword</h2>
<p>Content...</p>
```

**Requirements**:
- H1: Exactly ONE per page
- H2: 3-6 sections (major topics)
- H3: Subsections within H2 (optional)
- H4-H6: Rarely needed
- Keywords: Include variations in H2/H3
- Hierarchy: Never skip levels (H1→H3 without H2)

### 5. Keyword Optimization

**Primary Keyword Placement**:
- ✅ Title tag (first 5 words)
- ✅ Meta description (first sentence)
- ✅ URL slug
- ✅ H1 heading
- ✅ First paragraph (first 100 words)
- ✅ At least one H2 heading
- ✅ Image alt text (when natural)
- ✅ Conclusion paragraph

**Keyword Density**:
- Primary keyword: 1-2% of total words
- Secondary keywords: 0.5-1% each
- Natural usage: No keyword stuffing
- Variations: Use synonyms and related terms

**Example for "ISO 13485 certificação"**:
- Primary: "ISO 13485 certificação" (8-15 times in 1000-word article)
- Variations: "certificação ISO 13485", "norma ISO 13485", "padrão ISO 13485"
- Related: "qualidade dispositivos médicos", "gestão qualidade", "ANVISA"

### 6. Internal Linking

**Requirements**:
- Minimum: 2-3 internal links per post
- Link to: Products, Contact, related blog posts
- Anchor text: Descriptive, includes keywords
- Opens in: Same tab (not _blank for internal)

**Link Strategy**:
1. **Product Pages**: Link from blog to relevant product/service
   - "Implantes ortopédicos" → `/products#orthopedic`
   - "Usinagem CNC" → `/capabilities#cnc-machining`

2. **Contact Page**: CTA at end of every post
   - "Entre em contato" → `/contact`

3. **Related Posts**: Link to 1-2 related articles
   - "Leia também: [Title of related post]" → `/blog/related-slug`

**Example**:
```html
<p>A Lifetrek Medical oferece <a href="/products#orthopedic">implantes ortopédicos de alta precisão</a> fabricados com certificação ISO 13485.</p>

<p>Saiba mais sobre <a href="/blog/dfm-dispositivos-medicos">Design for Manufacturing para dispositivos médicos</a>.</p>

<p><a href="/contact">Entre em contato com nossa equipe</a> para discutir seu projeto.</p>
```

### 7. Image Optimization

**Requirements for EVERY image**:
- Format: WebP (preferred) or JPG/PNG
- Size: <200KB per image
- Dimensions: Max 1200px width
- Alt text: Descriptive, includes keywords when natural
- File name: descriptive-with-keywords.webp

**Alt Text Examples**:
- ✅ GOOD: "Máquina CNC Citizen L32 usinando implante ortopédico em titânio"
- ❌ BAD: "IMG_1234.jpg" or "image"

**Featured Image**:
- Every post MUST have featured image
- Aspect ratio: 16:9 (1200x675px recommended)
- Alt text: Include post title keywords
- File size: <150KB

### 8. Content Quality

**Requirements**:
- **Length**: 800-1500 words (ideal for SEO)
- **Originality**: 100% unique content (no plagiarism)
- **Readability**: 
  - Short paragraphs (3-4 sentences)
  - Bullet points for lists
  - Subheadings every 200-300 words
  - Flesch reading ease: 60-70 (accessible)
- **Expertise**: Demonstrate Lifetrek's 30+ years experience
- **Updated**: Mention current year (2025)
- **Actionable**: Readers can apply knowledge

---

## Technical SEO Implementation

### 1. Schema Markup (Structured Data)

Every blog post MUST include Article schema:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post Title Here",
  "description": "Meta description here",
  "image": "https://lifetrekmedical.com.br/images/featured-image.webp",
  "author": {
    "@type": "Person",
    "name": "Lifetrek Medical"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Lifetrek Medical",
    "logo": {
      "@type": "ImageObject",
      "url": "https://lifetrekmedical.com.br/logo.png"
    }
  },
  "datePublished": "2025-01-15T10:00:00-03:00",
  "dateModified": "2025-01-15T10:00:00-03:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://lifetrekmedical.com.br/blog/post-slug"
  }
}
</script>
```

**Validation**:
- Test with: https://validator.schema.org/
- Check in Google Search Console: Enhancements → Unparsed structured data
- Fix errors before publishing

### 2. Canonical URL

Every page MUST have canonical tag:

```html
<link rel="canonical" href="https://lifetrekmedical.com.br/blog/post-slug" />
```

**Purpose**: Avoid duplicate content penalties if post is shared elsewhere.

### 3. Sitemap.xml

Generate and submit XML sitemap monthly:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lifetrekmedical.com.br/blog/post-slug</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- More blog posts... -->
</urlset>
```

**Process**:
1. Run `execution/sitemap_generator.py` after publishing new posts
2. Upload to `public/sitemap.xml`
3. Submit to Google Search Console
4. Verify indexing in Coverage report

### 4. Page Speed Optimization

**Target**: <3 seconds load time on 3G connection

**Optimizations**:
- Images: WebP format, lazy loading, responsive sizes
- CSS: Minified, critical CSS inline
- JavaScript: Deferred loading, code splitting
- Fonts: Preload Google Fonts, font-display: swap
- Caching: Browser caching headers (1 year for static assets)

**Testing**:
- Lighthouse (Chrome DevTools): Performance >90
- PageSpeed Insights: Mobile >80, Desktop >90
- GTmetrics: Grade A, <3s load time

### 5. Mobile Optimization

**Requirements**:
- Responsive design: Works on 320px - 1920px width
- Tap targets: Minimum 44x44px for buttons/links
- Font size: Minimum 16px for body text
- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- No horizontal scroll: Content fits without zooming

**Testing**:
- Google Mobile-Friendly Test
- Chrome DevTools: Device emulation (iPhone, Android)
- Real device testing: iOS and Android

---

## Off-Page SEO Strategy

### 1. Backlink Building

**Target**: 10-20 quality backlinks in first 6 months

**Strategies**:
- Industry directories (medical device associations)
- Guest posts on partner websites
- Client testimonials with link back
- Press releases for company milestones
- Industry forum participation (with link in signature)

**Quality over Quantity**:
- Domain Authority: >30 preferred
- Relevance: Medical, manufacturing, Brazil-focused
- Anchor text: Brand name or natural phrases (not exact-match keywords)

### 2. Social Signals

**Amplify every post**:
- LinkedIn Company Page: Share all posts
- LinkedIn Personal Profiles: Sales Engineer, Eduardo Renner
- Industry groups: Medical device manufacturing, quality professionals
- Email newsletter: Include latest posts

### 3. Local SEO (Brazil)

**Optimization**:
- Google Business Profile: Link to blog in posts
- Address NAP consistency: Name, Address, Phone
- Local keywords: "dispositivos médicos brasil", "fabricante são paulo"
- Portuguese language: pt-BR locale

---

## SEO Monitoring & Reporting

### Weekly Monitoring

**Google Search Console**:
- Check Coverage report: Index all new posts
- Monitor Performance: Impressions, clicks, CTR, position
- Fix errors: 4xx, 5xx, mobile usability issues

### Monthly Reporting

**Metrics to Track**:

| Metric | Target Month 3 | Target Month 6 |
|--------|----------------|----------------|
| Indexed Posts | 12 | 24 |
| Avg Search Position | <50 | <20 |
| Organic Traffic | 50-200/mo | 200-500/mo |
| Blog Conversion Rate | 1% | 2-3% |
| Leads from Blog | 1-2/mo | 5-15/mo |
| Top 10 Rankings | 2-3 keywords | 10+ keywords |
| Featured Snippets | 0-1 | 2-3 |
| Domain Authority | +2 | +5 |

**Tools**:
- Google Search Console: Traffic, rankings
- Google Analytics: Visitors, engagement, conversions
- Ahrefs/SEMrush: Backlinks, domain authority (optional)
- `execution/calculate_seo_score.py`: On-page SEO audit

### Quarterly Review

**Actions**:
1. Review top-performing posts: Duplicate success patterns
2. Update underperforming posts: Improve SEO, add content
3. Refresh old posts: Update data, add new sections
4. Keyword gap analysis: New opportunities
5. Competitor analysis: What are they ranking for?

---

## SEO Audit Process

### Run Monthly Audit

Execute Python script for all published posts:

```bash
python execution/calculate_seo_score.py --output audit_report.json
```

**Audit Checks**:
- Title length (50-60 chars)
- Meta description (150-160 chars)
- H1 presence (exactly 1)
- Keyword density (1-2% for primary)
- Internal links (minimum 2)
- Image alt text (100% coverage)
- Word count (800-1500)
- Schema markup (valid JSON-LD)
- Page speed (<3s load time)
- Mobile-friendly (yes/no)

**Scoring**:
- 90-100: Excellent SEO
- 80-89: Good SEO, minor improvements
- 70-79: Fair SEO, needs optimization
- <70: Poor SEO, urgent fixes needed

**Priority Fixes**:
1. Score <70: Fix within 1 week
2. Missing schema: Add immediately
3. Slow page speed: Optimize images
4. Mobile issues: Fix layout/fonts

---

## Keyword Research Process

### For New Topics

**Step 1: Brainstorm Seed Keywords**
- Core topics: ISO 13485, implantes médicos, usinagem CNC, dispositivos médicos
- Lifetrek capabilities: Citizen L32, ZEISS CMM, sala limpa ISO 7
- Client pain points: fornecedor, certificação, qualidade, custo

**Step 2: Use Google Keyword Planner**
1. Go to: https://ads.google.com/keywordplanner
2. Enter seed keywords
3. Filter: Brazil, Portuguese
4. Export: Download CSV with volume and competition

**Step 3: Analyze Competitors**
- Google search: "dispositivos médicos brasil"
- Check top 10 results: What keywords are they targeting?
- Identify gaps: What aren't they covering?

**Step 4: Select Keywords**
For each post, choose:
- 1 primary keyword (high volume/intent)
- 2-3 secondary keywords (related, medium volume)
- 3-5 long-tail keywords (specific, low competition)

**Example for "ISO 13485" post**:
- Primary: `iso 13485 certificação`
- Secondary: `gestão qualidade médica`, `anvisa certificação`
- Long-tail: `como obter iso 13485 brasil`, `requisitos iso 13485 dispositivos médicos`

---

## Common SEO Issues & Fixes

### Issue: Low click-through rate (CTR)
**Symptoms**: Impressions high, clicks low
**Diagnosis**: Poor title/description
**Fix**: 
- Rewrite title to be more compelling
- Add numbers, questions, or "Guia Completo"
- Update meta description with clear benefit

### Issue: High bounce rate
**Symptoms**: Visitors leave quickly
**Diagnosis**: Content doesn't match search intent OR poor UX
**Fix**:
- Review search query: Does content answer it?
- Add intro paragraph addressing search intent immediately
- Improve page speed (<3s load time)
- Add relevant internal links

### Issue: Not ranking at all
**Symptoms**: Zero impressions in Search Console
**Diagnosis**: Not indexed OR too competitive keyword
**Fix**:
- Check indexing: Request indexing in Search Console
- Verify robots.txt not blocking
- Check keyword competition: Choose less competitive variant
- Build backlinks to boost authority

### Issue: Ranking dropped suddenly
**Symptoms**: Previously top 10, now page 3+
**Diagnosis**: Google algorithm update OR competitor improved
**Fix**:
- Check Google update history: core/spam updates?
- Audit content: Still relevant and accurate?
- Update content: Add new information, expand sections
- Check competitors: What did they improve?

### Issue: Duplicate content
**Symptoms**: Google Search Console shows duplicate meta descriptions/titles
**Diagnosis**: Multiple posts with same/similar SEO tags
**Fix**:
- Make each title unique (different angle/keyword)
- Rewrite meta descriptions to differentiate
- Add canonical tags if content is intentionally similar

---

## SEO Best Practices Summary

### Do's
✅ Focus on user intent (answer their questions)
✅ Write for humans first, search engines second
✅ Use keywords naturally (no stuffing)
✅ Update old content regularly (freshness signal)
✅ Build high-quality backlinks (quality > quantity)
✅ Optimize images (WebP, alt text, lazy loading)
✅ Monitor Google Search Console weekly
✅ Test on mobile devices
✅ Write long-form content (800-1500 words)
✅ Include expert insights (Lifetrek's 30+ years)

### Don'ts
❌ Keyword stuffing (unnatural repetition)
❌ Duplicate content (copying competitors)
❌ Thin content (<500 words)
❌ Missing alt text on images
❌ Slow page speed (>3s load time)
❌ Ignoring mobile optimization
❌ Over-optimization (100% keyword density)
❌ Buying backlinks (spam penalties)
❌ Hiding text (white text on white background)
❌ Misleading titles/descriptions (bait and switch)

---

## Update History

- **2025-12-30**: Initial directive created
- **Future**: Update with algorithm changes, new best practices
