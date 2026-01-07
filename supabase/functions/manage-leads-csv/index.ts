import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    // Import CSV data to database
    if (action === 'import') {
      console.log(`📥 Importing ${data.leads?.length || 0} leads...`);
      
      const { leads } = data;
      
      if (!Array.isArray(leads) || leads.length === 0) {
        throw new Error('No leads provided for import');
      }

      // Transform leads to match database schema
      const transformedLeads = leads.map((lead: any) => ({
        nome_empresa: lead.nome_empresa || lead['Nome Empresa'],
        website: lead.website || lead.Website,
        telefone: lead.telefone || lead.Telefone,
        segmento: lead.segmento || lead.Segmento,
        categoria: lead.categoria || lead.Categoria,
        scraped_emails: typeof lead.scraped_emails === 'string' 
          ? JSON.parse(lead.scraped_emails || '[]')
          : (lead.scraped_emails || []),
        linkedin_profiles: typeof lead.linkedin_profiles === 'string'
          ? JSON.parse(lead.linkedin_profiles || '[]')
          : (lead.linkedin_profiles || []),
        decision_makers: typeof lead.decision_makers === 'string'
          ? JSON.parse(lead.decision_makers || '[]')
          : (lead.decision_makers || []),
        has_fda: lead.has_fda || false,
        has_ce: lead.has_ce || false,
        has_iso: lead.has_iso || false,
        has_rd: lead.has_rd || false,
        years_in_business: parseInt(lead.years_in_business || lead.years || 0),
        countries_served: parseInt(lead.countries_served || lead.countries || 0),
        employee_count: parseInt(lead.employee_count || lead.employees || 0),
        predicted_score: parseFloat(lead.predicted_score || lead.Predicted_Score || 0),
        v2_score: parseFloat(lead.v2_score || lead.V2_Score || 0),
        enrichment_status: lead.enrichment_status || lead.Enrichment_Status || 'pending',
        priority: lead.priority || lead.Priority || 'medium',
        source: lead.source || 'csv_import',
        notes: lead.notes || lead.Notes || null,
      }));

      // Upsert leads (insert or update if exists based on nome_empresa)
      const { data: inserted, error } = await supabaseClient
        .from('leads')
        .upsert(transformedLeads, {
          onConflict: 'nome_empresa',
          ignoreDuplicates: false
        })
        .select('id');

      if (error) {
        console.error('Import error:', error);
        throw error;
      }

      console.log(`✅ Successfully imported ${inserted?.length || 0} leads`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          imported: inserted?.length || 0,
          message: `Successfully imported ${inserted?.length || 0} leads`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Export leads as CSV-ready JSON
    if (action === 'export') {
      console.log('📤 Exporting all leads...');
      
      const { data: leads, error } = await supabaseClient
        .from('leads')
        .select('*')
        .order('v2_score', { ascending: false });

      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      console.log(`✅ Exported ${leads?.length || 0} leads`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          leads,
          count: leads?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bulk update leads
    if (action === 'bulk_update') {
      console.log('🔄 Bulk updating leads...');
      
      const { updates } = data;
      
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('No updates provided');
      }

      const promises = updates.map((update: any) => 
        supabaseClient
          .from('leads')
          .update(update.data)
          .eq('id', update.id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        console.error('Bulk update errors:', errors);
        throw new Error(`${errors.length} updates failed`);
      }

      console.log(`✅ Successfully updated ${updates.length} leads`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          updated: updates.length,
          message: `Successfully updated ${updates.length} leads`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: import, export, or bulk_update' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
