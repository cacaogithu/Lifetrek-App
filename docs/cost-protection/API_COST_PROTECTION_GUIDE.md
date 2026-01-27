# API Cost Protection - Implementation Guide

## 🎯 Goal

Prevent runaway API costs by implementing comprehensive cost tracking, limits, and monitoring.

## 📋 Implementation Checklist

### Phase 1: Database Infrastructure ✅
- [ ] Run `cost_tracking_migration.sql` to create tables and functions
- [ ] Verify tables created: `api_cost_tracking`, `spending_limits`, `cost_alerts`
- [ ] Test `check_spending_limit()` function
- [ ] Test `log_api_cost()` function
- [ ] Verify RLS policies are active

### Phase 2: Cost Tracking Library ✅
- [ ] Add `costTracking.ts` to `/supabase/functions/_shared/`
- [ ] Update import paths in edge functions
- [ ] Test `withCostTracking()` wrapper
- [ ] Test `checkSpendingLimit()` function
- [ ] Test `getSpendingSummary()` function

### Phase 3: Protect Carousel Generation 🔴 CRITICAL
- [ ] Update `agents.ts` with protected version
- [ ] Add carousel limit check (10/day per user)
- [ ] Add image generation limit (7 images max per carousel)
- [ ] Wrap all API calls in `withCostTracking()`
- [ ] Test carousel generation with limits
- [ ] Verify cost logging works

### Phase 4: Protect Other Edge Functions
- [ ] Update `chat/index.ts` to use cost tracking
- [ ] Update `agent-chat` to use cost tracking
- [ ] Update `enhance-product-image` to use cost tracking
- [ ] Update any other functions making external API calls

### Phase 5: Admin Dashboard
- [ ] Create cost monitoring page in admin panel
- [ ] Show daily/monthly spending
- [ ] Show spending by operation
- [ ] Show recent cost alerts
- [ ] Add ability to adjust spending limits

### Phase 6: Alerts & Monitoring
- [ ] Set up email alerts for cost thresholds
- [ ] Create Slack/Discord webhook for critical alerts
- [ ] Add daily spending report
- [ ] Monitor for unusual patterns

## 🚀 Quick Start

### Step 1: Deploy Database Changes

```bash
# Connect to your Supabase project
cd /path/to/Lifetrek-App

# Run the migration
psql $DATABASE_URL -f cost_tracking_migration.sql

# Or use Supabase CLI
supabase db push
```

### Step 2: Add Cost Tracking Library

```bash
# Copy the cost tracking helper
cp costTracking.ts supabase/functions/_shared/

# Verify it's in the right place
ls -la supabase/functions/_shared/costTracking.ts
```

### Step 3: Update Carousel Generation

```bash
# Backup current file
cp supabase/functions/generate-linkedin-carousel/agents.ts \
   supabase/functions/generate-linkedin-carousel/agents.ts.backup

# Apply protected version
cp agents.protected.ts \
   supabase/functions/generate-linkedin-carousel/agents.ts
```

### Step 4: Update Main Carousel Function

Edit `supabase/functions/generate-linkedin-carousel/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { strategistAgent, copywriterAgent, designerAgent, brandAnalystAgent } from "./agents.ts";
import { checkSpendingLimit, getSpendingSummary } from "../_shared/costTracking.ts";

serve(async (req) => {
  // ... existing CORS and auth code ...

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // NEW: Check spending limit before starting
    const estimatedCarouselCost = 0.50; // ~$0.50 per carousel
    const limitCheck = await checkSpendingLimit(
      supabase,
      user.id,
      "carousel_generation",
      estimatedCarouselCost
    );

    if (!limitCheck.allowed) {
      return new Response(JSON.stringify({
        error: `Spending limit reached: ${limitCheck.reason}`,
        details: {
          current_spent: limitCheck.current_spent,
          limit: limitCheck.limit,
          daily_remaining: limitCheck.daily_remaining
        }
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = await req.json();

    // Run agents with cost protection
    const strategy = await strategistAgent(params, supabase, user.id);
    const copy = await copywriterAgent(params, strategy, supabase, user.id);
    const images = await designerAgent(supabase, user.id, params, copy);
    const review = await brandAnalystAgent(copy, images, supabase, user.id);

    // Return spending summary with result
    const spending = await getSpendingSummary(supabase, user.id);

    return new Response(JSON.stringify({
      strategy,
      copy,
      images,
      review,
      spending_summary: {
        daily_spent: spending.daily,
        daily_remaining: limitCheck.daily_remaining,
        monthly_spent: spending.monthly
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Carousel generation error:', error);

    // Check if it's a spending limit error
    if (error.message?.includes('Spending limit exceeded')) {
      return new Response(JSON.stringify({
        error: 'Daily spending limit reached',
        message: 'Please try again tomorrow or contact support to increase your limit.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Step 5: Update Chat Function

Edit `supabase/functions/chat/index.ts`:

```typescript
import { withCostTracking, API_COSTS } from "../_shared/costTracking.ts";

// Inside serve():
try {
  // ... existing auth code ...

  const { messages } = await req.json();
  const model = DEFAULT_MODEL; // "google/gemini-2.0-flash-001"

  // Wrap OpenRouter call in cost tracking
  const responseText = await withCostTracking(
    supabase,
    user.id,
    "chat",
    "openrouter",
    model,
    async () => {
      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        // ... existing request ...
      });

      const data = await openRouterResponse.json();
      return data.choices?.[0]?.message?.content || "Sem resposta do modelo.";
    }
  );

  return new Response(JSON.stringify({ text: responseText }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

} catch (error: any) {
  // Handle spending limit errors
  if (error.message?.includes('Spending limit exceeded')) {
    return new Response(JSON.stringify({
      error: 'Limite de gastos diário atingido. Tente novamente amanhã.'
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ... existing error handling ...
}
```

## 🎛️ Configuration

### Adjust Spending Limits

```sql
-- Update global daily limit to $100
UPDATE public.spending_limits
SET max_cost = 100.00
WHERE user_id IS NULL AND limit_type = 'daily' AND operation IS NULL;

-- Set custom limit for specific user
INSERT INTO public.spending_limits (user_id, limit_type, operation, max_cost, max_requests)
VALUES 
  ('user-uuid-here', 'daily', NULL, 200.00, NULL),
  ('user-uuid-here', 'daily', 'carousel_generation', 50.00, 20)
ON CONFLICT (user_id, limit_type, operation) 
DO UPDATE SET max_cost = EXCLUDED.max_cost, max_requests = EXCLUDED.max_requests;

-- Disable limit temporarily
UPDATE public.spending_limits
SET is_active = FALSE
WHERE user_id = 'user-uuid-here' AND limit_type = 'daily';
```

### View Current Spending

```sql
-- Today's spending by operation
SELECT 
  operation,
  service,
  COUNT(*) as requests,
  SUM(estimated_cost) as total_cost
FROM public.api_cost_tracking
WHERE date = CURRENT_DATE
GROUP BY operation, service
ORDER BY total_cost DESC;

-- Top spenders
SELECT 
  u.email,
  SUM(act.estimated_cost) as total_spent,
  COUNT(*) as request_count
FROM public.api_cost_tracking act
JOIN auth.users u ON u.id = act.user_id
WHERE act.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.email
ORDER BY total_spent DESC
LIMIT 10;

-- Recent alerts
SELECT 
  alert_type,
  severity,
  operation,
  message,
  created_at
FROM public.cost_alerts
WHERE acknowledged = FALSE
ORDER BY created_at DESC
LIMIT 20;
```

## 📊 Monitoring Dashboard (React Component)

Create `src/pages/Admin/CostMonitoring.tsx`:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function CostMonitoring() {
  const [spending, setSpending] = useState({
    daily: 0,
    monthly: 0,
    by_operation: {}
  });

  useEffect(() => {
    loadSpending();
  }, []);

  const loadSpending = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: dailyData } = await supabase
      .from('api_cost_tracking')
      .select('operation, estimated_cost')
      .eq('date', today);

    const daily = dailyData?.reduce((sum, row) => sum + Number(row.estimated_cost), 0) || 0;
    
    const by_operation: Record<string, number> = {};
    dailyData?.forEach(row => {
      by_operation[row.operation] = (by_operation[row.operation] || 0) + Number(row.estimated_cost);
    });

    setSpending({ daily, monthly: 0, by_operation });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">API Cost Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Today's Spending</h3>
          <p className="text-3xl font-bold mt-2">${spending.daily.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">of $50.00 daily limit</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Monthly Spending</h3>
          <p className="text-3xl font-bold mt-2">${spending.monthly.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">of $500.00 monthly limit</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Operations Today</h3>
          <p className="text-3xl font-bold mt-2">{Object.keys(spending.by_operation).length}</p>
          <p className="text-sm text-muted-foreground mt-1">different operation types</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Operation</h3>
        <div className="space-y-2">
          {Object.entries(spending.by_operation).map(([op, cost]) => (
            <div key={op} className="flex justify-between items-center">
              <span className="text-sm">{op}</span>
              <span className="font-mono">${(cost as number).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

## 🚨 Emergency Procedures

### If Costs Spike Unexpectedly

1. **Immediate Action - Disable Expensive Operations:**
```sql
-- Disable carousel generation globally
UPDATE public.spending_limits
SET max_cost = 0.01
WHERE operation = 'carousel_generation' AND user_id IS NULL;
```

2. **Check Recent Activity:**
```sql
SELECT 
  operation,
  service,
  COUNT(*) as count,
  SUM(estimated_cost) as total_cost,
  MAX(created_at) as last_call
FROM public.api_cost_tracking
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY operation, service
ORDER BY total_cost DESC;
```

3. **Identify Problem User:**
```sql
SELECT 
  u.email,
  act.operation,
  COUNT(*) as requests,
  SUM(act.estimated_cost) as cost
FROM public.api_cost_tracking act
JOIN auth.users u ON u.id = act.user_id
WHERE act.created_at >= NOW() - INTERVAL '1 hour'
GROUP BY u.email, act.operation
ORDER BY cost DESC
LIMIT 5;
```

4. **Block Specific User:**
```sql
INSERT INTO public.spending_limits (user_id, limit_type, operation, max_cost)
VALUES ('problem-user-uuid', 'daily', NULL, 0.00)
ON CONFLICT (user_id, limit_type, operation) 
DO UPDATE SET max_cost = 0.00;
```

## ✅ Testing

### Test Cost Tracking

```typescript
// Test in Deno/Node
import { createClient } from "@supabase/supabase-js";
import { checkSpendingLimit, logAPICost } from "./costTracking.ts";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test 1: Check limit
const result = await checkSpendingLimit(supabase, null, "test_operation", 0.50);
console.log("Limit check:", result);

// Test 2: Log cost
const id = await logAPICost(supabase, {
  userId: null,
  operation: "test_operation",
  service: "test_service",
  model: "test_model",
  estimatedCost: 0.01
});
console.log("Logged cost with ID:", id);

// Test 3: Verify logged
const { data } = await supabase
  .from('api_cost_tracking')
  .select('*')
  .eq('id', id)
  .single();
console.log("Logged data:", data);
```

## 📈 Success Metrics

After implementation, you should see:

- ✅ Zero runaway cost incidents
- ✅ Daily spending stays under $50
- ✅ Monthly spending stays under $500
- ✅ Alerts trigger before limits are hit
- ✅ Users receive clear error messages when limits reached
- ✅ Admin dashboard shows real-time spending

## 🔄 Maintenance

### Weekly Tasks
- Review cost alerts
- Check for unusual patterns
- Adjust limits if needed

### Monthly Tasks
- Review total spending vs budget
- Analyze cost per operation
- Optimize expensive operations
- Update cost estimates if API pricing changes

## 📞 Support

If you encounter issues:
1. Check `cost_alerts` table for recent alerts
2. Review `api_cost_tracking` for unusual patterns
3. Verify spending limits are active
4. Test cost tracking functions manually
