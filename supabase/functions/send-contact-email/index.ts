import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ContactEmailRequest {
  name: string;
  email: string;
  company?: string;
  phone: string;
  projectTypes: string[];
  annualVolume?: string;
  technicalRequirements: string;
  message?: string;
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  dental_implants: "Implantes Dentários",
  orthopedic_implants: "Implantes Ortopédicos",
  spinal_implants: "Implantes Espinhais",
  veterinary_implants: "Implantes Veterinários",
  surgical_instruments: "Instrumentos Cirúrgicos",
  micro_precision_parts: "Peças de Micro Precisão",
  custom_tooling: "Ferramental Customizado",
  medical_devices: "Dispositivos Médicos",
  measurement_tools: "Ferramentas de Medição",
  other_medical: "Outros Médicos",
};

const formatProjectTypes = (types: string[]): string => {
  return types.map(type => PROJECT_TYPE_LABELS[type] || type).join(", ");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, phone, projectTypes, annualVolume, technicalRequirements, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email for:", { name, email, company, projectTypes });

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Lifetrek Medical <noreply@lifetrek-medical.com>",
      to: [email],
      subject: "Recebemos sua solicitação de cotação - We received your quote request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Obrigado pelo seu interesse, ${name}!</h1>
          <h2 style="color: #003366;">Thank you for your interest, ${name}!</h2>
          
          <p style="font-size: 16px; color: #333;">
            Recebemos sua solicitação de cotação e entraremos em contato em breve com uma proposta personalizada.<br>
            <em>We have received your quote request and will contact you soon with a personalized proposal.</em>
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #003366; margin-top: 0;">Detalhes da sua solicitação / Your request details:</h2>
            <p style="color: #666;"><strong>Nome / Name:</strong> ${name}</p>
            <p style="color: #666;"><strong>E-mail / Email:</strong> ${email}</p>
            ${company ? `<p style="color: #666;"><strong>Empresa / Company:</strong> ${company}</p>` : ''}
            <p style="color: #666;"><strong>Telefone / Phone:</strong> ${phone}</p>
            <p style="color: #666;"><strong>Tipos de Projeto / Project Types:</strong> ${formatProjectTypes(projectTypes)}</p>
            ${annualVolume ? `<p style="color: #666;"><strong>Volume Anual / Annual Volume:</strong> ${annualVolume}</p>` : ''}
            <p style="color: #666;"><strong>Requisitos Técnicos / Technical Requirements:</strong><br>${technicalRequirements}</p>
            ${message ? `<p style="color: #666;"><strong>Mensagem Adicional / Additional Message:</strong><br>${message}</p>` : ''}
          </div>
          
          <p style="font-size: 16px; color: #333;">
            Atenciosamente,<br>
            <strong>Equipe Lifetrek Medical</strong><br>
            <em>Best regards,<br>Lifetrek Medical Team</em>
          </p>
        </div>
      `,
    });

    console.log("Customer email sent successfully:", customerEmailResponse);

    // Send notification email to Lifetrek
    const notificationEmailResponse = await resend.emails.send({
      from: "Formulário de Contato <noreply@lifetrek-medical.com>",
      to: ["contato@lifetrek-medical.com"],
      subject: `Nova Cotação: ${formatProjectTypes(projectTypes)} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Nova Solicitação de Cotação</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #003366; margin-top: 0;">Informações do Cliente:</h2>
            <p style="color: #666;"><strong>Nome:</strong> ${name}</p>
            <p style="color: #666;"><strong>E-mail:</strong> ${email}</p>
            ${company ? `<p style="color: #666;"><strong>Empresa:</strong> ${company}</p>` : ''}
            <p style="color: #666;"><strong>Telefone:</strong> ${phone}</p>
            <p style="color: #666;"><strong>Tipos de Projeto:</strong> ${formatProjectTypes(projectTypes)}</p>
            ${annualVolume ? `<p style="color: #666;"><strong>Volume Anual Esperado:</strong> ${annualVolume}</p>` : ''}
            
            <h3 style="color: #003366; margin-top: 20px;">Requisitos Técnicos:</h3>
            <p style="color: #666; white-space: pre-wrap;">${technicalRequirements}</p>
            
            ${message ? `<h3 style="color: #003366; margin-top: 20px;">Mensagem Adicional:</h3><p style="color: #666; white-space: pre-wrap;">${message}</p>` : ''}
          </div>
        </div>
      `,
    });

    console.log("Customer email sent successfully:", customerEmailResponse);

    // Save lead to database
    const { data: leadData, error: leadError } = await supabase
      .from('contact_leads')
      .insert({
        name,
        email,
        company,
        phone,
        project_types: projectTypes,
        annual_volume: annualVolume,
        technical_requirements: technicalRequirements,
        message,
        status: 'new',
        priority: 'medium'
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error saving lead to database:', leadError);
      // Continue even if lead save fails - emails already sent
    }

    const leadId = leadData?.id;
    console.log('Lead saved successfully:', leadId);

    // Research company and generate AI suggestions (non-blocking)
    let companyResearch = null;
    let aiSuggestion = null;

    if (leadId) {
      try {
        // Call research-company function
        console.log('Researching company...');
        const researchResponse = await fetch(`${supabaseUrl}/functions/v1/research-company`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, company, website: null })
        });

        if (researchResponse.ok) {
          companyResearch = await researchResponse.json();
          console.log('Company research completed');

          // Generate AI response suggestion using Lovable AI
          const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
          if (lovableApiKey) {
            console.log('Generating AI response suggestion...');
            
            const systemPrompt = `You are a senior B2B sales consultant for Lifetrek Medical, a precision medical device manufacturing company specializing in dental implants, orthopedic components, surgical instruments, and custom medical parts.

Your role is to analyze incoming leads and suggest professional, compelling email responses that:
1. Address the prospect's specific needs and technical requirements
2. Highlight Lifetrek's relevant capabilities and experience
3. Build credibility and trust
4. Create urgency and next steps

Consider the company research context when available to personalize your response.`;

            const userPrompt = `Generate a professional email response suggestion for this new lead:

**Lead Information:**
- Name: ${name}
- Company: ${company || 'Not provided'}
- Email: ${email}
- Phone: ${phone}
- Project Types: ${formatProjectTypes(projectTypes)}
- Annual Volume: ${annualVolume || 'Not specified'}
- Technical Requirements: ${technicalRequirements}
${message ? `- Additional Message: ${message}` : ''}

${companyResearch ? `**Company Research:**
- Domain: ${companyResearch.domain}
- Industry: ${companyResearch.industry || 'Unknown'}
- Website Summary: ${companyResearch.website_summary?.substring(0, 500) || 'Not available'}
- LinkedIn Info: ${companyResearch.linkedin_info?.substring(0, 500) || 'Not available'}` : ''}

Provide your suggestion in JSON format with these fields:
- subject_line: compelling subject line (max 80 chars)
- email_body: complete email body (professional, warm, action-oriented)
- key_points: array of 3-5 key talking points to emphasize
- follow_up_date: suggested follow-up date (YYYY-MM-DD format, 2-3 days from now)
- priority_level: "low", "medium", or "high" based on lead quality`;

            const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                tools: [{
                  type: 'function',
                  function: {
                    name: 'generate_response_suggestion',
                    description: 'Generate a structured email response suggestion',
                    parameters: {
                      type: 'object',
                      properties: {
                        subject_line: { type: 'string' },
                        email_body: { type: 'string' },
                        key_points: { 
                          type: 'array',
                          items: { type: 'string' }
                        },
                        follow_up_date: { type: 'string' },
                        priority_level: { 
                          type: 'string',
                          enum: ['low', 'medium', 'high']
                        }
                      },
                      required: ['subject_line', 'email_body', 'key_points', 'follow_up_date', 'priority_level'],
                      additionalProperties: false
                    }
                  }
                }],
                tool_choice: { type: 'function', function: { name: 'generate_response_suggestion' } }
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
              if (toolCall) {
                const suggestion = JSON.parse(toolCall.function.arguments);
                console.log('AI suggestion generated');

                // Save AI suggestion to database
                const { data: savedSuggestion } = await supabase
                  .from('ai_response_suggestions')
                  .insert({
                    lead_id: leadId,
                    subject_line: suggestion.subject_line,
                    email_body: suggestion.email_body,
                    key_points: suggestion.key_points,
                    follow_up_date: suggestion.follow_up_date,
                    priority_level: suggestion.priority_level,
                    company_research_id: companyResearch?.id
                  })
                  .select()
                  .single();

                aiSuggestion = savedSuggestion || suggestion;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in research/AI generation (non-critical):', error);
        // Don't fail the main request if research/AI fails
      }
    }

    // Send enhanced notification email to Lifetrek team
    const enhancedNotificationEmail = await resend.emails.send({
      from: "Formulário de Contato <noreply@lifetrek-medical.com>",
      to: ["contato@lifetrek-medical.com"],
      subject: `Nova Cotação: ${formatProjectTypes(projectTypes)} - ${name}${aiSuggestion ? ' [AI Suggestion Available]' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #003366;">Nova Solicitação de Cotação</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #003366; margin-top: 0;">Informações do Cliente:</h2>
            <p style="color: #666;"><strong>Nome:</strong> ${name}</p>
            <p style="color: #666;"><strong>E-mail:</strong> ${email}</p>
            ${company ? `<p style="color: #666;"><strong>Empresa:</strong> ${company}</p>` : ''}
            <p style="color: #666;"><strong>Telefone:</strong> ${phone}</p>
            <p style="color: #666;"><strong>Tipos de Projeto:</strong> ${formatProjectTypes(projectTypes)}</p>
            ${annualVolume ? `<p style="color: #666;"><strong>Volume Anual Esperado:</strong> ${annualVolume}</p>` : ''}
            
            <h3 style="color: #003366; margin-top: 20px;">Requisitos Técnicos:</h3>
            <p style="color: #666; white-space: pre-wrap;">${technicalRequirements}</p>
            
            ${message ? `<h3 style="color: #003366; margin-top: 20px;">Mensagem Adicional:</h3><p style="color: #666; white-space: pre-wrap;">${message}</p>` : ''}
          </div>

          ${companyResearch ? `
          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <h2 style="color: #0c4a6e; margin-top: 0;">📊 Company Research</h2>
            <p style="color: #0c4a6e;"><strong>Domain:</strong> ${companyResearch.domain}</p>
            ${companyResearch.industry ? `<p style="color: #0c4a6e;"><strong>Industry:</strong> ${companyResearch.industry}</p>` : ''}
            ${companyResearch.linkedin_info ? `
              <h3 style="color: #0c4a6e; margin-top: 15px;">LinkedIn Profile:</h3>
              <p style="color: #475569; font-size: 14px;">${companyResearch.linkedin_info.substring(0, 500)}...</p>
            ` : ''}
            ${companyResearch.website_summary ? `
              <h3 style="color: #0c4a6e; margin-top: 15px;">Website Overview:</h3>
              <p style="color: #475569; font-size: 14px;">${companyResearch.website_summary.substring(0, 500)}...</p>
            ` : ''}
          </div>
          ` : ''}

          ${aiSuggestion ? `
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e40af; margin-top: 0;">🤖 AI Response Suggestion</h2>
            
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">SUGGESTED SUBJECT:</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${aiSuggestion.subject_line}</p>
            </div>

            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">SUGGESTED EMAIL BODY:</p>
              <div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${aiSuggestion.email_body}</div>
            </div>

            ${aiSuggestion.key_points ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="color: #92400e; font-size: 12px; font-weight: 600; margin: 0 0 10px 0;">💡 KEY TALKING POINTS:</p>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                ${aiSuggestion.key_points.map((point: string) => `<li style="margin: 5px 0;">${point}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div style="display: flex; gap: 15px; margin-top: 15px;">
              <div style="flex: 1; background-color: white; padding: 12px; border-radius: 6px;">
                <p style="color: #64748b; font-size: 11px; margin: 0 0 5px 0;">PRIORITY</p>
                <p style="color: #1e293b; font-weight: 600; margin: 0; text-transform: uppercase;">${aiSuggestion.priority_level}</p>
              </div>
              <div style="flex: 1; background-color: white; padding: 12px; border-radius: 6px;">
                <p style="color: #64748b; font-size: 11px; margin: 0 0 5px 0;">FOLLOW-UP DATE</p>
                <p style="color: #1e293b; font-weight: 600; margin: 0;">${aiSuggestion.follow_up_date}</p>
              </div>
            </div>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              <strong>Next Steps:</strong> Review the AI suggestion above and customize it based on your relationship with the client. 
              ${companyResearch ? 'Use the company research to add personalized touches.' : ''} 
              Access the full lead details in the admin dashboard.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Enhanced notification email sent successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      customerEmail: customerEmailResponse,
      notificationEmail: enhancedNotificationEmail,
      leadId,
      hasResearch: !!companyResearch,
      hasSuggestion: !!aiSuggestion
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
