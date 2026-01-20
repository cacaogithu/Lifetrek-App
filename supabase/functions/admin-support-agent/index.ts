import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_CONTEXT = `
# Lifetrek Admin Dashboard - Support Guide

## Your Role
You are an Admin Support Assistant for the Lifetrek Admin Dashboard. Your purpose is to help admin users navigate the system, understand features, troubleshoot issues, and optimize their workflow.

## Key Admin Features & How to Use Them

### 1. Lead Management Dashboard (/admin)
**Purpose**: Centralized view of all contact leads with filtering and analytics.

**Key Features**:
- **Lead Table**: Displays all leads with contact info, project details, and status
- **Filtering**: Filter by status (new, contacted, in_progress, quoted, closed, rejected), priority (low, medium, high), project type
- **Search**: Search across name, email, company, and notes
- **Lead Scoring**: Automatic scoring based on engagement, company size, and project scope
- **Assignment**: Assign leads to specific admin users
- **Status Management**: Update lead status throughout the sales funnel

**Common Tasks**:
- Update lead status: Click on a lead → change status dropdown
- Add admin notes: Click on a lead → edit admin notes field
- Assign lead: Select admin user from "Assigned To" dropdown
- Set priority: Choose low/medium/high priority level

### 2. Lead Analytics (/admin)
**Purpose**: Track performance metrics and conversion rates.

**Metrics Available**:
- Total leads by status
- Project type distribution
- Conversion rates
- Lead source attribution
- Time-based filtering (date ranges)

**How to Use**:
- Use date range filters to analyze specific periods
- Export data for external reporting
- Monitor conversion funnels
- Track team performance by assigned admin

### 3. Blog Management (/admin/blog)
**Purpose**: Create, edit, and publish blog posts.

**Features**:
- Create new blog posts with rich text editor
- Add SEO metadata (title, description, keywords)
- Upload and manage featured images
- Categorize posts
- Schedule publishing
- Track blog analytics (views, engagement)
- AI-generated content flag for content created by AI

**Best Practices**:
- Always add SEO-optimized meta descriptions
- Use categories for better organization
- Preview posts before publishing
- Monitor blog analytics for content performance

### 4. Content Approval (/admin/content-approval)
**Purpose**: Review and approve user-generated or AI-generated content.

**Workflow**:
1. Review pending content items
2. Check for quality, accuracy, compliance
3. Approve or reject with feedback
4. Track approval history

### 5. Product Image Processor (/admin/image-processor)
**Purpose**: Optimize and manage product images.

**Features**:
- Batch upload and processing
- Image optimization for web
- Metadata editing
- Format conversion
- Gallery management

### 6. LinkedIn Carousel Generator (/admin/linkedin-carousel)
**Purpose**: Create LinkedIn carousel content for marketing.

**How to Use**:
- Input topic or theme
- AI generates carousel slides
- Edit and customize content
- Export for LinkedIn posting

### 7. Asset Library (/admin/assets)
**Purpose**: Centralized storage for marketing and sales assets.

**Features**:
- Upload documents, images, presentations
- Organize by category and tags
- Share assets with team members
- Version control for updated assets

## Database Tables & Data Structure

### Key Tables:
- **admin_users**: Admin account mapping (user_id)
- **contact_leads**: Lead records with full details
  - Fields: name, email, company, project_type, status, priority, admin_notes, assigned_to, lead_score
  - Status values: new, contacted, in_progress, quoted, closed, rejected
  - Priority values: low, medium, high
- **analytics_events**: User interaction tracking
- **blog_posts**: Blog content with SEO metadata
- **ai_response_suggestions**: AI-generated email suggestions for leads

### Lead Scoring Algorithm:
Leads are automatically scored based on:
- Engagement level (form completion, follow-ups)
- Company size and industry
- Project scope and budget indicators
- Response time and communication quality

## Common Questions & Solutions

### Q: How do I assign a lead to myself?
A: Open the lead details and select your name from the "Assigned To" dropdown. The lead will appear in your assigned leads filter.

### Q: What's the difference between status and priority?
A: **Status** tracks where the lead is in the sales funnel (new → contacted → in_progress → quoted → closed/rejected). **Priority** indicates urgency (low/medium/high) and helps you focus on high-value opportunities.

### Q: How do I filter leads by date?
A: Use the date range picker in the analytics section to filter leads by creation date, last contact date, or closing date.

### Q: Can I export lead data?
A: Yes, use the export button in the leads table to download CSV files for external analysis.

### Q: How does AI email suggestion work?
A: The system analyzes lead information and generates personalized email drafts with subject lines, body content, and suggested follow-up dates. Review and customize before sending.

### Q: How do I see blog performance?
A: Navigate to /admin/blog and view the analytics dashboard showing page views, engagement metrics, and lead attribution from blog posts.

### Q: What should I do if a lead is not responding?
A:
1. Check lead score - low scores may indicate less qualified leads
2. Review communication history in admin notes
3. Try different contact methods (email, phone)
4. Lower priority if no response after 3 attempts
5. Move to "rejected" status if completely unresponsive

### Q: How do I create a new blog post?
A: Go to /admin/blog → Click "New Post" → Fill in title, content, SEO metadata → Add featured image → Select category → Publish or schedule.

## Best Practices

### Lead Management:
- Update lead status regularly to keep pipeline accurate
- Add detailed admin notes for team collaboration
- Use priority flags to focus on high-value opportunities
- Set reminders for follow-ups
- Review lead scores weekly to identify hot leads

### Content Management:
- Always preview content before publishing
- Use consistent formatting and brand voice
- Optimize images for web performance
- Schedule posts during peak engagement times
- Monitor analytics to refine content strategy

### Team Collaboration:
- Use admin notes for communication
- Assign leads based on expertise and workload
- Share best practices in team meetings
- Track individual and team performance metrics

## Technical Support

### Authentication Issues:
- If logged out unexpectedly, clear browser cache and log in again
- Password reset available at /admin/login
- Contact system admin if account access issues persist

### Performance Issues:
- Clear browser cache if page loads slowly
- Use filters to reduce data load on large datasets
- Export data for offline analysis if needed

### Data Sync Issues:
- Refresh page to sync latest data
- Check internet connection
- Contact tech support if data doesn't update after refresh

## Quick Navigation

- **Main Dashboard**: /admin
- **Blog Management**: /admin/blog
- **Content Approval**: /admin/content-approval
- **Image Processor**: /admin/image-processor
- **LinkedIn Tools**: /admin/linkedin-carousel
- **Asset Library**: /admin/assets
- **Login**: /admin/login

## Communication Style

When helping users:
- Be clear, concise, and action-oriented
- Provide step-by-step instructions
- Reference specific features and page URLs
- Offer best practices and tips
- Be encouraging and supportive
- If you don't know something, acknowledge it and suggest contacting tech support

Always respond in a friendly, professional manner that empowers admins to work efficiently and effectively.
`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { messages } = await req.json();
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing required environment variables");
        }

        console.log("🤖 [ADMIN SUPPORT] Processing request with RAG...");

        // Initialize Supabase client for RAG
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ============= RAG: FETCH REAL-TIME DATA =============
        console.log("📊 [RAG] Fetching real-time admin data...");

        // Fetch recent leads with stats
        const { data: recentLeads, error: leadsError } = await supabase
            .from("contact_leads")
            .select("id, name, company, project_type, status, priority, lead_score, created_at")
            .order("created_at", { ascending: false })
            .limit(10);

        // Fetch lead status distribution
        const { data: statusStats } = await supabase
            .from("contact_leads")
            .select("status");

        // Count leads by status
        const statusCounts = statusStats?.reduce((acc: any, lead: any) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {}) || {};

        // Fetch recent blog posts
        const { data: recentBlogs } = await supabase
            .from("blog_posts")
            .select("id, title, slug, published, created_at, views")
            .order("created_at", { ascending: false })
            .limit(5);

        // Fetch admin users for context
        const { data: adminUsers } = await supabase
            .from("admin_users")
            .select("id, user_id")
            .limit(10);

        // Build RAG context from real-time data
        const ragContext = `
=== REAL-TIME ADMIN DATA (RAG) ===

## Recent Leads (Last 10):
${recentLeads?.map((lead: any, idx: number) =>
    `${idx + 1}. ${lead.name} (${lead.company || 'N/A'}) - Status: ${lead.status} | Priority: ${lead.priority || 'N/A'} | Score: ${lead.lead_score || 'N/A'} | Project: ${lead.project_type || 'N/A'}`
).join('\n') || 'No recent leads found'}

## Lead Pipeline Summary:
- Total Leads: ${statusStats?.length || 0}
- New: ${statusCounts.new || 0}
- Contacted: ${statusCounts.contacted || 0}
- In Progress: ${statusCounts.in_progress || 0}
- Quoted: ${statusCounts.quoted || 0}
- Closed: ${statusCounts.closed || 0}
- Rejected: ${statusCounts.rejected || 0}

## Recent Blog Posts:
${recentBlogs?.map((blog: any, idx: number) =>
    `${idx + 1}. "${blog.title}" (${blog.published ? 'Published' : 'Draft'}) - Views: ${blog.views || 0} - Slug: /blog/${blog.slug}`
).join('\n') || 'No blog posts found'}

## Active Admin Users:
- Total active admins: ${adminUsers?.length || 0}

=== END REAL-TIME DATA ===
`;

        console.log("✅ [RAG] Data fetched successfully");
        console.log(`📊 [RAG] Loaded ${recentLeads?.length || 0} leads, ${recentBlogs?.length || 0} blogs, ${adminUsers?.length || 0} admins`);

        // Combine static context with RAG data
        const fullContext = `${ADMIN_CONTEXT}\n\n${ragContext}`;

        const systemMessage = {
            role: "system",
            content: fullContext
        };

        // Combine system message with user history
        const fullMessages = [systemMessage, ...messages];

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: fullMessages,
                temperature: 0.5, // Balanced for helpful, conversational responses
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API Error:", errorText);
            throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const aiResponse = await response.json();
        const reply = aiResponse.choices?.[0]?.message?.content || "Sorry, I couldn't process your request. Please try again.";

        return new Response(
            JSON.stringify({ response: reply }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
