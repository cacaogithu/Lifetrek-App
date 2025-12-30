# Sales Engineer Onboarding Guide

Welcome to Lifetrek Medical! This guide will help you get started in your new role.

## Welcome & Overview

### Your Role

As our Sales Engineer, you're not just selling - you're solving problems. Your mission:
- Build trust with prospects through technical expertise
- Identify and qualify opportunities for precision medical device manufacturing
- Create a consistent pipeline of qualified leads
- Bridge the gap between customer needs and our engineering capabilities

### Platform Capabilities

This platform helps you:
1. **Access curated leads** - 200+ pre-qualified manufacturing companies
2. **Send personalized outreach** - Template library with customization guidance
3. **Generate LinkedIn content** - AI-powered carousel creation
4. **Track pipeline** - Manage your outreach and follow-ups

### Success Metrics

We measure success by:
- **Quality conversations** - Not just volume of outreach
- **Pipeline health** - Qualified opportunities moving forward
- **Customer feedback** - Learning and improving from every interaction
- **Problem-solving** - Tackling challenges creatively

---

## Platform Training

### 1. Accessing Your Leads Dashboard

**Location:** Navigate to `/admin` or use the Sales Engineer Dashboard

**Your Leads List:**
- **200 high-priority companies** ready for outreach
- Pre-filtered for quality (Lead Score >= 10)
- All have email + decision maker contact
- 93% include phone numbers
- 100% have LinkedIn company pages

**Understanding Lead Scores:**
- **70-79:** Good quality - has core data (website, email, decision maker)
- **80-89:** High quality - additional data (phone, LinkedIn)
- **90-95:** Excellent - comprehensive data, verified sources

**Priority Levels:**
- **High (93%):** Score >= 13, has LinkedIn + phone
- **Medium (7%):** Score >= 11, partial data

**File Location:** `.tmp/sales_engineer_leads.csv`

### 2. Using Email Templates

**Template Library:** `admin/email-templates/`

**Available Templates:**
1. `cold-email-orthopedic.html` - For orthopedic device manufacturers
2. `cold-email-dental.html` - For dental implant/device companies
3. `follow-up-template.html` - For second/third touchpoints
4. `reply-inbound-inquiry.html` - For responding to inquiries
5. `base-template.html` - Generic template for other verticals

**CRITICAL: Personalization Required**

Never send a template as-is. Follow the [Email Template Usage Guide](#email-template-usage-guide) below.

### 3. LinkedIn Content Generation

**Location:** Navigate to `/linkedin-carousel`

**How to use:**
1. Choose "Plan Mode" for strategic angles OR "Generate Mode" for specific content
2. Enter topic (e.g., "Precision Machining for Spinal Screws")
3. Add target audience, pain points, proof points
4. Generate carousel
5. Download as PDF or copy caption

**Brand Guidelines:** All content auto-follows brand voice from our brand book.

---

## Brand Guidelines Review

**Required Reading:**

Before your first outreach, read these documents (est. 1 hour total):

1. **[Brand Book](file:///Users/rafaelalmeida/lifetrek-mirror/docs/brand/BRAND_BOOK.md)** (30 min)
   - Our mission, values, voice
   - Visual identity guidelines
   - Do's and don'ts

2. **[Company Context](file:///Users/rafaelalmeida/lifetrek-mirror/docs/brand/COMPANY_CONTEXT.md)** (15 min)
   - Our capabilities and machines
   - Certifications and quality standards
   - Differentiators

3. **[LinkedIn Best Practices](file:///Users/rafaelalmeida/lifetrek-mirror/docs/guides/LINKEDIN_BEST_PRACTICES.md)** (20 min)
   - Content strategy
   - Engagement tactics
   - Hook formulas

**Verification:** Complete the [Brand Checklist](file:///Users/rafaelalmeida/lifetrek-mirror/docs/brand/BRAND_CHECKLIST.md) and submit to your manager.

---

## Daily Workflow

### Morning Routine (30-45 min)

1. **Review Pipeline** (10 min)
   - Check for new responses
   - Review today's follow-ups
   - Update lead statuses

2. **Company Research** (20-30 min)
   - Deep-dive 3-5 target accounts
   - Review websites, LinkedIn, recent news
   - Identify pain points and fit

3. **Set Daily Goals** (5 min)
   - Outreach targets
   - Follow-up tasks
   - Research objectives

### Mid-Day Activities

**Outreach Block (2-3 hours)**
- Send 8-10 personalized emails
- Make 3-5 discovery calls (if scheduled)
- LinkedIn engagement (comment on prospect posts)

**Research Block (1 hour)**
- Continue deep-dive research
- Prepare for upcoming calls
- Update CRM notes

### End-of-Day Routine (15-20 min)

1. **Log Activities**
   - Update CRM with day's outreach
   - Note key learnings or insights

2. **Follow-up Planning**
   - Schedule tomorrow's follow-ups
   - Queue next day's outreach emails

3. **Review Progress**
   - Check daily goal completion
   - Identify blockers for tomorrow

---

## Email Template Usage Guide

### General Personalization Checklist

Before sending ANY email, research and personalize:

- [ ] Company website reviewed (note 2-3 specific products/services)
- [ ] Recent news or press releases found (Google News search)
- [ ] LinkedIn company page checked (recent posts, employee count)
- [ ] Decision maker LinkedIn profile reviewed (background, posts)
- [ ] Competitive landscape understood (who else they might use)

### Template-Specific Guidance

#### Cold Email - Orthopedic

**When to use:**
- Orthopedic implant manufacturers
- Companies producing screws, plates, rods, cages
- Lead mentions "orthopedic" or "spinal" in industry

**Key personalization points:**
1. **Opening line:** Reference specific product from their website
   - ❌ "We work with medical device companies..."
   - ✅ "I noticed [Company] manufactures titanium pedicle screws for spinal fusion..."

2. **Pain point:** Identify their likely challenge
   - High-scrap rates with complex geometries
   - Tight tolerances for FDA compliance
   - Material challenges (titanium, PEEK)

3. **Proof point:** Match to their situation
   - If they mention ISO 13485: "We're ISO 13485 certified..."
   - If they're OEM: "We've helped OEMs reduce lead times..."
   - If they're startup: "We work with emerging companies..."

4. **CTA:** Align with their business model
   - OEM → "Quick call to discuss your production challenges?"
   - Distributor → "See our capabilities deck?"

#### Cold Email - Dental

**When to use:**
- Dental implant manufacturers
- Abutment, crown, restoration companies
- Lead mentions "dental" in industry

**Key personalization points:**
Similar to orthopedic, but focus on:
- Biocompatible materials (titanium, zirconia)
- Surface treatments and coatings
- High-volume production capabilities

#### Follow-Up Template

**When to use:**
- 5-7 days after initial email (no response)
- After a call/meeting (next steps)
- After proposal sent (checking in)

**Personalization:**
- Reference previous touchpoint
- Add new value (case study, article, insight)
- Keep it short (3-4 sentences max)

---

## Resources & Support

### Key Contacts

**Your Manager:** [Manager Name]
- Daily questions and check-ins
- Pipeline reviews
- Strategic guidance

**Technical Support:** Engineering Team
- Deep technical questions about capabilities
- Feasibility assessments
- Quote support

**Marketing:** Content Team
- LinkedIn content collaboration
- Case study development
- Collateral requests

### Escalation Process

**When to escalate:**
1. Customer asks technical question beyond your knowledge → Engineering
2. Pricing/quote request → Manager + Engineering  
3. RFQ received → Manager (immediately)
4. Complaint or quality concern → Manager (immediately)

**How to escalate:**
- Slack message with context
- @ mention relevant team
- Follow up if no response in 4 hours

### FAQs

**Q: How do I know if a lead is a good fit?**
A: Look for: medical device manufacturing, precision machining needs, ISO  certification interest, 10-500 employee range, located in North America.

**Q: What if they ask for a quote?**
A: Never quote without engineering review. Say: "Let me connect you with our engineering team to understand your specs and provide an accurate quote."

**Q: How many emails should I send per day?**
A: Quality over quantity. 8-10 highly personalized emails > 50 generic blasts.

**Q: What if someone unsubscribes?**
A: Respect it immediately. Update CRM to mark "Do Not Contact."

**Q: Can I call leads directly?**
A: Yes! Phone numbers are provided. Best times: Tuesday-Thursday, 10am-12pm or 2pm-4pm (their timezone).

---

## Next Steps

1. ✅ **Complete Brand Checklist** - Submit to manager when done
2. ✅ **Review Your Leads List** - Familiarize yourself with top 20 prospects
3. ✅ **Read [30-60-90 Day Plan](file:///Users/rafaelalmeida/lifetrek-mirror/docs/product/SE_30_60_90_PLAN.md)** - Understand your roadmap
4. ✅ **Send First 5 Personalized Emails** - Start building pipeline
5. ✅ **Schedule First Check-in** - Book 30-min with manager for end of Week 1

---

## Welcome to the Team!

Remember: You're here to solve problems, not just execute tasks. Bring curiosity, take ownership, and don't hesitate to ask questions.

Let's build something great together. 🚀
