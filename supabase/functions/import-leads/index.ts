import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadRow {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  source?: string;
  industry?: string;
  employees?: string;
  lead_score?: number;
  linkedin_url?: string;
  cnpj?: string;
  revenue_range?: string;
  project_type?: string;
  technical_requirements?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some(r => r.role === "admin" || r.role === "super_admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { leads, skipDuplicates = true } = await req.json();

    if (!leads || !Array.isArray(leads)) {
      return new Response(JSON.stringify({ error: "Invalid leads data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[ImportLeads] Processing ${leads.length} leads...`);

    // Prepare all leads for bulk upsert
    const preparedLeads = [];
    let skipped = 0;

    for (const lead of leads as LeadRow[]) {
      // Skip if no email AND no company
      if (!lead.email && !lead.company) {
        skipped++;
        continue;
      }

      const emailNormalized = lead.email ? lead.email.toLowerCase().trim() : null;
      const companyNormalized = lead.company ? lead.company.trim() : null;

      // Parse lead_score - handle string or number
      let leadScore = 50;
      if (lead.lead_score) {
        const parsed = typeof lead.lead_score === 'string' 
          ? parseFloat(lead.lead_score) 
          : lead.lead_score;
        if (!isNaN(parsed)) {
          leadScore = Math.min(100, Math.max(0, Math.round(parsed)));
        }
      }

      // Generate email placeholder for company-only leads
      const finalEmail = emailNormalized || 
        `${companyNormalized?.toLowerCase().replace(/[^a-z0-9]/g, '_')}@placeholder.lead`;

      preparedLeads.push({
        name: lead.name || companyNormalized || "Desconhecido",
        email: finalEmail,
        company: companyNormalized,
        phone: lead.phone || "N/A",
        website: lead.website || null,
        city: lead.city || null,
        state: lead.state || null,
        source: lead.source || "csv_import",
        industry: lead.industry || null,
        employees: lead.employees || null,
        lead_score: leadScore,
        linkedin_url: lead.linkedin_url || null,
        cnpj: lead.cnpj || null,
        revenue_range: lead.revenue_range || null,
        project_type: lead.project_type || "imported",
        technical_requirements: lead.technical_requirements || "Importado via CSV",
        message: lead.message || null,
        status: "new" as const,
        priority: leadScore >= 70 ? "high" as const : leadScore >= 40 ? "medium" as const : "low" as const,
      });
    }

    console.log(`[ImportLeads] Prepared ${preparedLeads.length} leads for upsert, skipped ${skipped} invalid`);

    // Bulk upsert all leads at once
    let inserted = 0;
    let errors: string[] = [];

    if (preparedLeads.length > 0) {
      const { data, error: upsertError } = await supabase
        .from("contact_leads")
        .upsert(preparedLeads, { 
          onConflict: "email",
          ignoreDuplicates: skipDuplicates 
        })
        .select("id");

      if (upsertError) {
        console.error(`[ImportLeads] Bulk upsert error:`, upsertError);
        errors.push(upsertError.message);
      } else {
        inserted = data?.length || preparedLeads.length;
      }
    }

    console.log(`[ImportLeads] Complete: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        errors: errors.slice(0, 10), // Only return first 10 errors
        totalErrors: errors.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[ImportLeads] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});