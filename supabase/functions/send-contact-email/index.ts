import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  company?: string;
  phone: string;
  projectType: string;
  annualVolume?: string;
  technicalRequirements: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, phone, projectType, annualVolume, technicalRequirements, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email for:", { name, email, company, projectType });

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Lifetrek Medical <onboarding@resend.dev>",
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
            <p style="color: #666;"><strong>Tipo de Projeto / Project Type:</strong> ${projectType}</p>
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
      from: "Contact Form <onboarding@resend.dev>",
      to: ["contato@lifetrek-medical.com"],
      subject: `Nova Cotação: ${projectType} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #003366;">Nova Solicitação de Cotação</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #003366; margin-top: 0;">Informações do Cliente:</h2>
            <p style="color: #666;"><strong>Nome:</strong> ${name}</p>
            <p style="color: #666;"><strong>E-mail:</strong> ${email}</p>
            ${company ? `<p style="color: #666;"><strong>Empresa:</strong> ${company}</p>` : ''}
            <p style="color: #666;"><strong>Telefone:</strong> ${phone}</p>
            <p style="color: #666;"><strong>Tipo de Projeto:</strong> ${projectType}</p>
            ${annualVolume ? `<p style="color: #666;"><strong>Volume Anual Esperado:</strong> ${annualVolume}</p>` : ''}
            
            <h3 style="color: #003366; margin-top: 20px;">Requisitos Técnicos:</h3>
            <p style="color: #666; white-space: pre-wrap;">${technicalRequirements}</p>
            
            ${message ? `<h3 style="color: #003366; margin-top: 20px;">Mensagem Adicional:</h3><p style="color: #666; white-space: pre-wrap;">${message}</p>` : ''}
          </div>
        </div>
      `,
    });

    console.log("Notification email sent successfully:", notificationEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      customerEmail: customerEmailResponse,
      notificationEmail: notificationEmailResponse 
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
