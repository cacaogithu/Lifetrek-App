# API Cost Analysis - Lifetrek App

## 🚨 Executive Summary

After auditing the codebase, I've identified **multiple high-risk areas** that could cause runaway API costs, particularly with expensive services like:
- **Google Cloud Vertex AI (Imagen-3)** - Image generation
- **OpenRouter API** - LLM calls (Gemini, Stable Diffusion)
- **Supabase Edge Functions** - Orchestration overhead

## 🔍 High-Risk Areas Identified

### 1. **LinkedIn Carousel Generation** ⚠️ CRITICAL RISK
**File:** `/supabase/functions/generate-linkedin-carousel/agents.ts`

**Risk Level:** 🔴 **VERY HIGH**

**Cost Multipliers:**
- **4 AI agents** run sequentially per carousel
- **Image generation** for 5-7 slides per carousel (Stable Diffusion via OpenRouter)
- **Deep research** mode can make multiple API calls
- **Similarity search** with embeddings

**Potential Cost per Carousel:**
```
- Strategist Agent: 1 LLM call (~$0.01)
- Copywriter Agent: 1 LLM call (~$0.01)
- Designer Agent: 5-7 image generations (~$0.35-$0.49 @ $0.07/image)
- Brand Analyst: 1 LLM call (~$0.01)
- Deep Research: 1-3 additional calls (~$0.01-$0.03)
---
TOTAL: ~$0.40-$0.55 per carousel
```

**If triggered repeatedly (bug/loop):**
- 100 carousels = **$40-$55**
- 1000 carousels = **$400-$550**
- 2000 carousels = **$800-$1100** ← **YOUR $1000 INCIDENT**

**Code Evidence:**
```typescript
// Lines 257-300: Designer generates 5-7 images per carousel
for (let i = 0; i < copy.slides.length; i++) {
    const imageUrl = await callOpenRouterImage(imagePrompt);
    // No rate limiting, no cost tracking
}
```

### 2. **Vertex AI Image Generation** ⚠️ HIGH RISK
**File:** `/scripts/tests/ab_test_images.ts`

**Risk Level:** 🔴 **HIGH**

**Cost:** Imagen-3 is **expensive** (~$0.04-$0.08 per image)

**Current Issues:**
- ✅ Only used in test scripts (not production)
- ⚠️ No rate limiting
- ⚠️ No cost tracking
- ⚠️ Direct API key usage (no proxy/monitoring)

### 3. **Chat Function Rate Limiting** ⚠️ MEDIUM RISK
**File:** `/supabase/functions/chat/index.ts`

**Risk Level:** 🟡 **MEDIUM** (Has some protection)

**Current Protection:**
```typescript
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20
```

**Issues:**
- ✅ Has rate limiting (20 requests/minute)
- ✅ Logs usage to `api_usage_logs` table
- ⚠️ No **cost** tracking, only request count
- ⚠️ No daily/monthly spending caps
- ⚠️ Rate limit is per-user, not global

### 4. **Agent Chat Function** ⚠️ MEDIUM RISK
**File:** `/src/components/agents/AgentChat.tsx`

**Risk Level:** 🟡 **MEDIUM**

**Issues:**
- Invokes `agent-chat` edge function
- Multiple agent types with different tools
- No visible rate limiting in frontend
- Could be triggered repeatedly by UI bugs

### 5. **Image Enhancement** ⚠️ LOW-MEDIUM RISK
**File:** `/src/components/ImageEnhancer.tsx`

**Risk Level:** 🟢 **LOW-MEDIUM**

**Issues:**
- Calls `enhance-product-image` function
- User-triggered (less risk of loops)
- No rate limiting visible

## 🎯 Root Causes of $1000 Incident

Based on the code analysis, the most likely causes:

### Scenario 1: Carousel Generation Loop (Most Likely)
```
1. Bug in UI triggers carousel generation repeatedly
2. Each generation creates 5-7 images via Stable Diffusion
3. No circuit breaker or cost cap
4. Runs for hours/days unnoticed
5. Result: 2000+ carousels = $800-$1100
```

### Scenario 2: Vertex AI Imagen Calls
```
1. Test script or function using Vertex AI Imagen-3
2. Loop or retry logic gone wrong
3. Imagen-3 costs $0.04-$0.08 per image
4. 12,500 images @ $0.08 = $1000
```

### Scenario 3: Background Job System (Now Removed)
```
1. Old job queue system (dropped in migration 20260123)
2. Jobs retrying infinitely
3. Each job triggers expensive API calls
4. No cost monitoring
```

## 🛡️ Missing Protections

### 1. **No Cost Tracking**
- ❌ No cost calculation per API call
- ❌ No running total of daily/monthly spend
- ❌ No alerts when approaching budget limits

### 2. **No Circuit Breakers**
- ❌ No automatic shutdown at spending threshold
- ❌ No exponential backoff on errors
- ❌ No "kill switch" for expensive operations

### 3. **No Monitoring**
- ❌ No real-time cost dashboard
- ❌ No alerts for unusual API usage patterns
- ❌ No logging of expensive operations

### 4. **No Request Deduplication**
- ❌ Same carousel could be generated multiple times
- ❌ No caching of expensive operations
- ❌ No idempotency keys

### 5. **No User Quotas**
- ❌ Users can trigger unlimited expensive operations
- ❌ No daily/monthly limits per user
- ❌ No tiered access (free vs paid)

## 📊 Current Protection Status

| Component | Rate Limit | Cost Tracking | Circuit Breaker | Monitoring | Risk Level |
|-----------|------------|---------------|-----------------|------------|------------|
| Chat Function | ✅ 20/min | ❌ | ❌ | ❌ | 🟡 Medium |
| Carousel Gen | ❌ | ❌ | ❌ | ❌ | 🔴 Critical |
| Image Enhancement | ❌ | ❌ | ❌ | ❌ | 🟡 Medium |
| Agent Chat | ❌ | ❌ | ❌ | ❌ | 🟡 Medium |
| Vertex AI | ❌ | ❌ | ❌ | ❌ | 🔴 High |

## 🚀 Recommended Immediate Actions

### Priority 1: Emergency Kill Switch
Add a global spending cap that shuts down expensive operations:

```typescript
const DAILY_SPENDING_CAP = 50; // $50/day
const MONTHLY_SPENDING_CAP = 500; // $500/month

async function checkSpendingCap(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('api_cost_tracking')
        .select('total_cost')
        .eq('date', today)
        .single();
    
    return (data?.total_cost || 0) < DAILY_SPENDING_CAP;
}
```

### Priority 2: Cost Tracking
Log the estimated cost of every expensive operation:

```typescript
const API_COSTS = {
    'gemini-flash': 0.01,
    'stable-diffusion': 0.07,
    'imagen-3': 0.08,
    'embedding': 0.001
};

async function logCost(operation: string, cost: number) {
    await supabase.from('api_cost_tracking').insert({
        operation,
        cost,
        timestamp: new Date().toISOString()
    });
}
```

### Priority 3: Carousel Generation Limits
Add strict limits to carousel generation:

```typescript
const MAX_CAROUSELS_PER_DAY = 10;
const MAX_CAROUSELS_PER_USER_PER_DAY = 3;
```

### Priority 4: Image Generation Cache
Cache generated images to avoid regeneration:

```typescript
// Before generating, check cache
const cacheKey = hash(prompt);
const cached = await supabase
    .from('image_cache')
    .select('url')
    .eq('cache_key', cacheKey)
    .single();

if (cached) return cached.url;
```

## 📈 Cost Monitoring Dashboard

Recommended metrics to track:
1. **Daily API spend** (by service)
2. **Requests per hour** (detect spikes)
3. **Cost per user** (identify heavy users)
4. **Failed requests** (detect retry loops)
5. **Average cost per operation** (detect anomalies)

## 🔧 Technical Implementation

See `API_COST_PROTECTION.md` for detailed implementation guide.
