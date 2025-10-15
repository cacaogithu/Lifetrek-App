import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 calculator requests per minute per IP
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

interface CalculatorRequest {
  contact: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    message?: string;
  };
  inputs: {
    partComplexity: string;
    annualVolume: number;
    material: string;
    tolerances: string;
    certifications: string[];
    surfaceFinish: string;
    secondaryOps: string[];
  };
  results: {
    estimatedCost: {
      perUnit: number;
      annual: number;
      tooling: number;
    };
    leadTime: {
      prototype: string;
      production: string;
    };
    feasibilityScore: number;
    recommendations: string[];
    costBreakdown: {
      material: number;
      machining: number;
      finishing: number;
      quality: number;
      overhead: number;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
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
    const { contact, inputs, results }: CalculatorRequest = await req.json();

    // Format material name
    const materialMap: Record<string, string> = {
      "aluminum": "Aluminum Alloys",
      "titanium": "Titanium Grade 5",
      "stainless-steel": "Stainless Steel (Medical Grade)",
      "peek": "PEEK Polymer",
      "cobalt-chrome": "Cobalt-Chrome"
    };

    const complexityMap: Record<string, string> = {
      "simple": "Simple",
      "moderate": "Moderate",
      "complex": "Complex",
      "highly-complex": "Highly Complex"
    };

    const toleranceMap: Record<string, string> = {
      "standard": "Standard (±0.1mm)",
      "tight": "Tight (±0.05mm)",
      "ultra-precision": "Ultra-Precision (±0.01mm)"
    };

    const finishMap: Record<string, string> = {
      "standard": "Standard Machined",
      "polished": "Polished Finish",
      "electropolished": "Electropolished (Medical Grade)"
    };

    // Send email to customer
    const customerEmail = await resend.emails.send({
      from: "Lifetrek Medical <onboarding@resend.dev>",
      to: [contact.email],
      subject: "Your Manufacturing Cost Analysis - Lifetrek Medical",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .score-box { background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .score { font-size: 48px; font-weight: bold; color: #22c55e; }
            .cost-box { background: #eff6ff; padding: 15px; margin: 10px 0; border-radius: 6px; }
            .breakdown { margin: 20px 0; }
            .breakdown-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .recommendation { background: #fef3c7; padding: 10px; margin: 8px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Manufacturing Analysis</h1>
              <p>Detailed Cost & Feasibility Report</p>
            </div>
            
            <div class="content">
              <p>Dear ${contact.name},</p>
              
              <p>Thank you for using our Manufacturing Cost Calculator. Below is your comprehensive analysis based on your project requirements.</p>
              
              <div class="score-box">
                <p style="margin: 0; font-weight: bold; margin-bottom: 10px;">Feasibility Score</p>
                <div class="score">${results.feasibilityScore}%</div>
                <p style="margin: 10px 0 0 0;">${results.feasibilityScore >= 80 ? 'Highly Feasible' : results.feasibilityScore >= 60 ? 'Feasible with Considerations' : 'Challenging but Possible'}</p>
              </div>

              <h2>Project Specifications</h2>
              <div class="breakdown">
                <div class="breakdown-item">
                  <strong>Part Complexity:</strong>
                  <span>${complexityMap[inputs.partComplexity]}</span>
                </div>
                <div class="breakdown-item">
                  <strong>Annual Volume:</strong>
                  <span>${inputs.annualVolume.toLocaleString()} units</span>
                </div>
                <div class="breakdown-item">
                  <strong>Material:</strong>
                  <span>${materialMap[inputs.material]}</span>
                </div>
                <div class="breakdown-item">
                  <strong>Tolerances:</strong>
                  <span>${toleranceMap[inputs.tolerances]}</span>
                </div>
                <div class="breakdown-item">
                  <strong>Surface Finish:</strong>
                  <span>${finishMap[inputs.surfaceFinish]}</span>
                </div>
              </div>

              <h2>Cost Estimates</h2>
              <div class="cost-box">
                <div class="breakdown-item">
                  <strong>Cost Per Unit:</strong>
                  <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">$${results.estimatedCost.perUnit.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                  <strong>Annual Cost:</strong>
                  <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">$${results.estimatedCost.annual.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                  <strong>Tooling (One-time):</strong>
                  <span>$${results.estimatedCost.tooling.toLocaleString()}</span>
                </div>
              </div>

              <h3>Cost Breakdown</h3>
              <div class="breakdown">
                <div class="breakdown-item"><span>Material</span><span>${results.costBreakdown.material}%</span></div>
                <div class="breakdown-item"><span>Machining</span><span>${results.costBreakdown.machining}%</span></div>
                <div class="breakdown-item"><span>Finishing</span><span>${results.costBreakdown.finishing}%</span></div>
                <div class="breakdown-item"><span>Quality Control</span><span>${results.costBreakdown.quality}%</span></div>
                <div class="breakdown-item"><span>Overhead</span><span>${results.costBreakdown.overhead}%</span></div>
              </div>

              <h2>Lead Times</h2>
              <div class="breakdown">
                <div class="breakdown-item">
                  <strong>Prototype:</strong>
                  <span>${results.leadTime.prototype}</span>
                </div>
                <div class="breakdown-item">
                  <strong>Production:</strong>
                  <span>${results.leadTime.production}</span>
                </div>
              </div>

              <h2>Expert Recommendations</h2>
              ${results.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://lifetrek-medical.com/contact" class="cta-button">
                  Schedule Free Consultation
                </a>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Review this analysis with your team</li>
                <li>Our engineering team will contact you within 24 hours</li>
                <li>Schedule a free consultation to discuss your project in detail</li>
                <li>Receive a formal quote with production timeline</li>
              </ol>

              ${contact.message ? `<p><strong>Your Message:</strong><br>${contact.message}</p>` : ''}
            </div>

            <div class="footer">
              <p><strong>Lifetrek Medical</strong></p>
              <p>Brazil's Premier Swiss CNC Precision Manufacturing</p>
              <p>Phone: +55 19 3936-7193 | Email: contact@lifetrek-medical.com</p>
              <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                This is an automated estimate. Final pricing may vary based on technical review and specifications.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification to Lifetrek sales team
    const salesEmail = await resend.emails.send({
      from: "Calculator Lead <onboarding@resend.dev>",
      to: ["contact@lifetrek-medical.com"],
      subject: `New Calculator Lead: ${contact.company} - ${contact.name}`,
      html: `
        <h2>New Manufacturing Calculator Lead</h2>
        <h3>Contact Information</h3>
        <ul>
          <li><strong>Name:</strong> ${contact.name}</li>
          <li><strong>Email:</strong> ${contact.email}</li>
          <li><strong>Company:</strong> ${contact.company}</li>
          <li><strong>Phone:</strong> ${contact.phone || 'Not provided'}</li>
        </ul>
        
        <h3>Project Details</h3>
        <ul>
          <li><strong>Complexity:</strong> ${complexityMap[inputs.partComplexity]}</li>
          <li><strong>Volume:</strong> ${inputs.annualVolume.toLocaleString()} units/year</li>
          <li><strong>Material:</strong> ${materialMap[inputs.material]}</li>
          <li><strong>Tolerances:</strong> ${toleranceMap[inputs.tolerances]}</li>
          <li><strong>Finish:</strong> ${finishMap[inputs.surfaceFinish]}</li>
          <li><strong>Certifications:</strong> ${inputs.certifications.join(', ') || 'None'}</li>
        </ul>

        <h3>Cost Estimate</h3>
        <ul>
          <li><strong>Per Unit:</strong> $${results.estimatedCost.perUnit}</li>
          <li><strong>Annual Revenue Potential:</strong> $${results.estimatedCost.annual.toLocaleString()}</li>
          <li><strong>Feasibility Score:</strong> ${results.feasibilityScore}%</li>
        </ul>

        ${contact.message ? `<h3>Additional Message</h3><p>${contact.message}</p>` : ''}

        <p><strong>Action Required:</strong> Follow up within 24 hours to discuss project details.</p>
      `,
    });

    console.log("Emails sent successfully:", { customerEmail, salesEmail });

    return new Response(
      JSON.stringify({ success: true, customerEmail, salesEmail }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-calculator-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
