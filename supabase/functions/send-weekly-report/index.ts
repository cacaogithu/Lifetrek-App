import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for cron secret authentication (for scheduled jobs)
    const authHeader = req.headers.get("authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    // Allow either valid JWT (admin user) or cron secret
    const isCronAuth = authHeader === `Bearer ${cronSecret}`;
    
    if (!isCronAuth) {
      // If not cron auth, verify it's a valid admin JWT
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3");
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } }
      });
      
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      if (authError || !user) {
        console.error("Unauthorized access attempt");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user is admin
      const { data: adminCheck } = await supabaseAuth
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (!adminCheck) {
        console.error("Non-admin user attempted to trigger report");
        return new Response(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    console.log(`Starting weekly report generation... (auth: ${isCronAuth ? 'cron' : 'admin'})`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get date range for last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch leads from last week
    const { data: newLeads, error: leadsError } = await supabase
      .from("contact_leads")
      .select("*")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    // Fetch analytics events from last week
    const { data: analyticsEvents, error: analyticsError } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", oneWeekAgo.toISOString());

    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
      throw analyticsError;
    }

    // Calculate statistics
    const stats = {
      totalNewLeads: newLeads?.length || 0,
      highPriorityLeads: newLeads?.filter(l => l.priority === "high").length || 0,
      mediumPriorityLeads: newLeads?.filter(l => l.priority === "medium").length || 0,
      lowPriorityLeads: newLeads?.filter(l => l.priority === "low").length || 0,
      leadsWithHighScore: newLeads?.filter(l => (l.lead_score || 0) >= 4).length || 0,
      chatbotInteractions: analyticsEvents?.filter(e => e.event_type === "chatbot_interaction").length || 0,
      formSubmissions: analyticsEvents?.filter(e => e.event_type === "form_submission").length || 0,
      pageViews: analyticsEvents?.filter(e => e.event_type === "page_view").length || 0,
      uniqueCompanies: new Set(analyticsEvents?.map(e => e.company_email).filter(Boolean)).size
    };

    // Get leads by project type
    const projectTypeCounts: Record<string, number> = {};
    newLeads?.forEach(lead => {
      if (lead.project_types && Array.isArray(lead.project_types)) {
        lead.project_types.forEach((type: string) => {
          projectTypeCounts[type] = (projectTypeCounts[type] || 0) + 1;
        });
      }
    });

    // Get leads by status
    const statusCounts: Record<string, number> = {};
    newLeads?.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });

    // Format project type labels
    const projectTypeLabels: Record<string, string> = {
      dental_implants: "Implantes Dentários",
      orthopedic_implants: "Implantes Ortopédicos",
      spinal_implants: "Implantes de Coluna",
      veterinary_implants: "Implantes Veterinários",
      surgical_instruments: "Instrumentos Cirúrgicos",
      micro_precision_parts: "Peças de Micro Precisão",
      custom_tooling: "Ferramentas Customizadas",
      medical_devices: "Dispositivos Médicos",
      measurement_tools: "Instrumentos de Medição",
      other_medical: "Outros Médicos"
    };

    const statusLabels: Record<string, string> = {
      new: "Novo",
      contacted: "Contatado",
      in_progress: "Em Progresso",
      quoted: "Cotado",
      closed: "Fechado",
      rejected: "Rejeitado"
    };

    // Build project type summary
    const projectTypeSummary = Object.entries(projectTypeCounts)
      .map(([type, count]) => `• ${projectTypeLabels[type] || type}: ${count}`)
      .join("\n");

    // Build status summary
    const statusSummary = Object.entries(statusCounts)
      .map(([status, count]) => `• ${statusLabels[status] || status}: ${count}`)
      .join("\n");

    // Build top leads list (score >= 4)
    const topLeads = newLeads
      ?.filter(l => (l.lead_score || 0) >= 4)
      .slice(0, 5)
      .map(l => `• ${l.name} (${l.company || "N/A"}) - Score: ${l.lead_score || 0}/5 - ${l.email}`)
      .join("\n") || "Nenhum lead de alta pontuação esta semana.";

    // Get admin users for email recipients
    const { data: adminUsers, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id");

    if (adminError) {
      console.error("Error fetching admin users:", adminError);
      throw adminError;
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const admin of adminUsers || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found, skipping email send");
      return new Response(
        JSON.stringify({ success: true, message: "No recipients found", stats }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format date range
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const dateRangeStr = `${dateFormatter.format(oneWeekAgo)} - ${dateFormatter.format(now)}`;

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a202c; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #004F8F 0%, #003D75 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .footer { background: #f7fafc; padding: 20px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f7fafc; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #004F8F; }
    .stat-label { font-size: 12px; color: #718096; text-transform: uppercase; }
    .section { margin: 25px 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #004F8F; margin-bottom: 10px; border-bottom: 2px solid #F07818; padding-bottom: 5px; display: inline-block; }
    .list { background: #f7fafc; padding: 15px; border-radius: 8px; white-space: pre-line; font-size: 14px; }
    .highlight { background: #1A7A3E; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .alert { background: #FEF3C7; border-left: 4px solid #F07818; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
    h1 { margin: 0; font-size: 24px; }
    .subtitle { opacity: 0.9; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório Semanal de Leads</h1>
      <p class="subtitle">Lifetrek Medical CRM - ${dateRangeStr}</p>
    </div>
    
    <div class="content">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalNewLeads}</div>
          <div class="stat-label">Novos Leads</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.leadsWithHighScore}</div>
          <div class="stat-label">Score Alto (4-5)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.highPriorityLeads}</div>
          <div class="stat-label">Alta Prioridade</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.uniqueCompanies}</div>
          <div class="stat-label">Empresas Únicas</div>
        </div>
      </div>

      ${stats.leadsWithHighScore > 0 ? `
      <div class="alert">
        ⚠️ <strong>${stats.leadsWithHighScore} lead(s) com pontuação alta</strong> aguardando ação!
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">🎯 Top Leads da Semana</div>
        <div class="list">${topLeads}</div>
      </div>

      <div class="section">
        <div class="section-title">📁 Por Tipo de Projeto</div>
        <div class="list">${projectTypeSummary || "Nenhum dado disponível"}</div>
      </div>

      <div class="section">
        <div class="section-title">📈 Por Status</div>
        <div class="list">${statusSummary || "Nenhum dado disponível"}</div>
      </div>

      <div class="section">
        <div class="section-title">🌐 Atividade no Website</div>
        <div class="list">• Interações Chatbot: ${stats.chatbotInteractions}
• Submissões de Formulário: ${stats.formSubmissions}
• Visualizações de Página: ${stats.pageViews}</div>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0; font-size: 14px; color: #718096;">
        Este relatório é gerado automaticamente pelo sistema Lifetrek Medical CRM.
        <br>Para mais detalhes, acesse o <a href="https://iijkbhiqcsvtnfernrbs.lovable.app/admin" style="color: #004F8F;">painel administrativo</a>.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email to all admins
    console.log(`Sending report to ${adminEmails.length} admin(s)`);

    const emailResponse = await resend.emails.send({
      from: "Lifetrek CRM <onboarding@resend.dev>",
      to: adminEmails,
      subject: `📊 Relatório Semanal - ${stats.totalNewLeads} Novos Leads (${dateRangeStr})`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Report sent to ${adminEmails.length} recipient(s)`,
        stats,
        recipients: adminEmails.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
