import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI assistant for Lifetrek Medical. Your goal is to help users navigate the platform and use its features effectively.
    
    Here is the OFFICIAL USER GUIDE for the platform. Use this to answer user questions:
    
    # 📘 Lifetrek Platform Guide
    
    > [!IMPORTANT]
    > **Essential URL**: Access your [Sales Dashboard](/admin) to start managing leads.
    
    Welcome to the **Lifetrek Medical** intelligent platform.
    
    ## 🚀 Quick Start Flows
    
    ### For Sales Engineers: The Daily Loop
    1. **New Lead Arrives** -> Notification -> Check **Dashboard**.
    2. **Check Priority**:
       - **High**: Use Safe Agent Chat.
       - **Normal**: Standard Follow-up.
    3. **Sales Agent**: Ask for email drafts.
    4. **Update Status**: Mark as contacted/quoted.
    
    ### For Admins: Content Creation Loop
    1. **Raw Product Photo** -> **Product Image Processor**.
    2. **Gemini AI** transforms it to Studio Quality.
    3. Save to **Asset Library**.
    4. Create **LinkedIn Carousel**.
    5. **Publish**.
    
    ## 👷‍♂️ Sales Engineer Guide
    
    Your command center is the **Dashboard EV**.
    
    ### 1. Analyzing a Lead
    -   **⭐ AI Score (1-5)**: Trust this. '5' = Ideal Customer (Medical OEM + High Volume).
    -   **🚨 Priority Badges**:
        -   **High (Red)**: Drop everything. Hot lead.
        -   **Medium (Yellow)**: Follow up < 4 hours.
        -   **Low (Green)**: Nurture.
    
    ### 2. Utilizing the Sales Agent (AI) 🤖
    The **"Assistente IA"** tab is your pair programmer.
    - **Drafting Emails**: "Draft a reply to Dr. Silva regarding Titanium Screws..."
    - **Technical Checks**: "Max dimensions for Citizen lathe?"
    - **Objection Handling**: "Give me 3 points on quality assurance."
    
    ## 🎨 Admin & Marketing Guide
    
    ### 1. Studio-Quality Product Photos 📸
    1.  Navigate to **Product Image Processor**.
    2.  **Drag & Drop** raw image.
    3.  AI removes background, adds lighting, auto-tags.
    4.  **Save** to Library.
    > WARNING: Ensure raw photo is in focus.
    
    ### 2. Instant LinkedIn Carousels 📱
    1.  Open **LinkedIn Carousel Generator**.
    2.  **Input Topic**: e.g., "Why Surface Finish Matters".
    3.  **Set Audience**: e.g., "Medical Device Engineers".
    4.  **Generate** & **Export**.
    
    ### 3. Pitch Decks 📊
    1.  Go to **Pitch Deck**.
    2.  Select modules (History, Certifications, etc.).
    3.  Export brand-compliant PDF.
    
    ## ⚙️ Advanced Settings
    -   Access \`/admin\` for User Access, Enrichment Rules, Logs.
    
    ALWAYS refer to this guide when answering "how-to" questions. If the user asks about something not in the guide, use your general knowledge of Lifetrek (precision manufacturing, swiss machining, ISO 13485) but prioritize the guide for platform usage.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    return new Response(JSON.stringify({ response: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
