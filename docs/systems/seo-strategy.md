# SEO Strategy & Implementation Guide

**Purpose**: Implement complete SEO strategy for Lifetrek Medical blog to achieve 50-500 organic visits/month.

**Target Audience**: Sales Engineer / Marketing Team

## SEO Strategy Overview

### Target Market
- **Geography**: Brazil (primary), Latin America (secondary)
- **Language**: Portuguese (pt-BR)
- **Search Intent**: Informational (how-to, guides) + Commercial (vendor selection)

### Target Keywords
**Primary** (High volume, high intent):
- fabricação dispositivos médicos brasil
- implantes ortopédicos fornecedor
- iso 13485 certificação
- usinagem cnc médica

## On-Page SEO Checklist

For **EVERY** blog post, validate these elements:

### 1. Title Tag
- **Format**: `Primary Keyword: Specific Topic | Lifetrek Medical`
- **Length**: 50-60 characters
- **Example**: "ISO 13485 Certificação: Guia Completo | Lifetrek Medical"

### 2. Meta Description
- **Length**: 150-160 characters
- **Content**: Compelling summary with primary keyword and CTA.
- **Example**: "Descubra como a certificação ISO 13485 garante qualidade em dispositivos médicos. Guia completo com requisitos e benefícios."

### 3. URL Slug
- **Format**: `https://lifetrekmedical.com.br/blog/primary-keyword-topic`
- **Rules**: Lowercase only, hyphens for spaces, include primary keyword.

### 4. Header Structure
- **H1**: Exactly ONE per page (Page Title).
- **H2**: 3-6 sections (major topics).
- **H3**: Subsections within H2.

### 5. Keyword Optimization
- **Primary Keyword**: In Title, URL, H1, first paragraph, and at least one H2.
- **Density**: 1-2% natural usage (no stuffing).

### 6. Internal Linking
- **Minimum**: 2-3 internal links per post.
- **Link to**: Products, Contact page, other related posts.

### 7. Image Optimization
- **Format**: WebP preferred.
- **Alt text**: Descriptive, includes keywords when natural.
- **Size**: <200KB per image.

## Technical SEO Implementation

### Schema Markup
Every blog post MUST include Article schema (`application/ld+json`).

### Canonical URL
Every page MUST have a canonical tag pointing to itself (or the original source).

### Page Speed
Target <3 seconds load time. Optimize images and use caching.

## SEO Audit Process

**Run Monthly Audit:**

Execute the audit script for all published posts:
```bash
python execution/calculate_seo_score.py --output audit_report.json
```

**Scoring**:
- **90-100**: Excellent
- **<70**: Needs urgent fixes

## Best Practices Summary

### Do's
- ✅ Focus on user intent
- ✅ Write for humans first
- ✅ Use keywords naturally
- ✅ Build high-quality backlinks
- ✅ Optimize images

### Don'ts
- ❌ Keyword stuffing
- ❌ Duplicate content
- ❌ Thin content (<500 words)
- ❌ Missing alt text
