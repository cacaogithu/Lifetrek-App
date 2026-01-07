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

    let inserted = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (const lead of leads as LeadRow[]) {
      // Skip if no email
      if (!lead.email) {
        skipped++;
        continue;
      }

      // Check for duplicate by email
      if (skipDuplicates) {
        const { data: existing } = await supabase
          .from("contact_leads")
          .select("id")
          .eq("email", lead.email.toLowerCase().trim())
          .single();

        if (existing) {
          skipped++;
          continue;
        }
      }

      // Prepare lead data
      const leadData = {
        name: lead.name || "Desconhecido",
        email: lead.email.toLowerCase().trim(),
        company: lead.company || null,
        phone: lead.phone || "N/A",
        website: lead.website || null,
        city: lead.city || null,
        state: lead.state || null,
        source: lead.source || "csv_import",
        industry: lead.industry || null,
        employees: lead.employees || null,
        lead_score: lead.lead_score || 50,
        linkedin_url: lead.linkedin_url || null,
        cnpj: lead.cnpj || null,
        revenue_range: lead.revenue_range || null,
        project_type: lead.project_type || "imported",
        technical_requirements: lead.technical_requirements || "Importado via CSV",
        message: lead.message || null,
        status: "new" as const,
        priority: "medium" as const,
      };

      const { error: insertError } = await supabase
        .from("contact_leads")
        .insert(leadData);

      if (insertError) {
        console.error(`[ImportLeads] Error inserting ${lead.email}:`, insertError);
        errors.push(`${lead.email}: ${insertError.message}`);
      } else {
        inserted++;
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