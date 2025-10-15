import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 chat requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(ip);

  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (rateLimitData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  rateLimitData.count++;
  return true;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI assistant for Lifetrek, a precision medical device contract manufacturer based in Brazil. You have comprehensive knowledge about:

COMPANY OVERVIEW:
- 30+ years of experience in precision Swiss CNC machining
- ISO 13485:2016 certified for medical device manufacturing
- ANVISA approved facility
- 30+ global partners including major medical device OEMs
- 100% ISO certified operations

CORE CAPABILITIES:
- Swiss-Type CNC Machining: Multi-axis (up to 12-axis) precision manufacturing with ±0.001mm tolerance for parts from Ø0.5-32mm
- Advanced Metrology: ISO 17025 certified lab with ZEISS Contura G2 3D CMM, optical inspection, surface roughness testing (Ra < 0.05μm)
- Cleanroom Manufacturing: ISO 7 (Class 10,000) certified cleanrooms for sterile assembly and packaging
- Surface Treatment: Electropolishing lines producing mirror finishes (Ra < 0.1μm) with enhanced biocompatibility
- Laser Marking: Permanent traceability marking on all components

EQUIPMENT:
- CNC Machines: Citizen L20-VIII LFV, Citizen L32, Tornos GT-26, FANUC Robodrill, Walter Helitronic tool grinders
- Metrology: ZEISS Contura G2 CMM, Optical CNC measurement, Olympus microscopes, Vickers hardness testers
- Finishing: Automated electropolishing lines, laser marking systems
- Software: Esprit CAM programming, advanced CAD/CAM capabilities

PRODUCTS & SERVICES:
- Medical Implants: Orthopedic screws, plates, spinal implants, dental implants
- Surgical Instruments: Precision surgical tools and specialty instruments
- Veterinary Implants: Specialized animal healthcare devices
- Materials: Titanium alloys (Ti-6Al-4V), stainless steel (316L, 17-4PH), cobalt-chrome

MANUFACTURING PROCESS:
1. Design Engineering: CAD/CAM programming and DFM analysis
2. Precision Machining: Swiss CNC manufacturing with live tooling
3. Surface Finishing: Electropolishing, passivation, laser marking
4. Quality Verification: Comprehensive dimensional and material testing

QUALITY & CERTIFICATIONS:
- ISO 13485:2016 Medical Device Quality Management
- ANVISA Brazilian regulatory approval
- Full batch traceability and documentation
- First Article Inspection (FAI) reports
- Material certificates and test reports

Always provide helpful, accurate information about Lifetrek's capabilities. If asked about pricing or specific quotes, recommend scheduling a free assessment. Be professional, knowledgeable, and emphasize quality, precision, and regulatory compliance

Do not output "**" or *. Write quick short sentences that might help the user navigate. Usually, ask questions back to try to better understand the user, and collect informatino from him. Answer the first question, and ask for their segment to help them out better. Then name, email e .`;

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
