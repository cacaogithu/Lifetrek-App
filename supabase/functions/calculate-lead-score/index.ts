import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface LeadScoringRequest {
  lead: {
    project_types: string[];
    annual_volume?: string;
    technical_requirements: string;
    message?: string;
    company?: string;
    name: string;
    email: string;
    phone: string;
  };
  companyResearch?: {
    website_summary?: string;
    linkedin_info?: string;
    industry?: string;
    company_name?: string;
  };
}

interface ScoreBreakdown {
  companySize: number;
  industryMatch: number;
  websiteQuality: number;
  linkedinPresence: number;
  projectComplexity: number;
  annualVolume: number;
  technicalDetail: number;
  completeness: number;
  urgency: number;
  total: number;
}

// Input validation
function validateInput(data: unknown): LeadScoringRequest | null {
  if (!data || typeof data !== 'object') return null;
  
  const obj = data as Record<string, unknown>;
  
  if (!obj.lead || typeof obj.lead !== 'object') return null;
  
  const lead = obj.lead as Record<string, unknown>;
  
  // Validate required fields
  if (typeof lead.name !== 'string' || lead.name.length > 200) return null;
  if (typeof lead.email !== 'string' || lead.email.length > 255) return null;
  if (typeof lead.phone !== 'string' || lead.phone.length > 50) return null;
  if (typeof lead.technical_requirements !== 'string' || lead.technical_requirements.length > 5000) return null;
  
  // Validate arrays
  if (!Array.isArray(lead.project_types) || lead.project_types.length > 20) return null;
  for (const pt of lead.project_types) {
    if (typeof pt !== 'string' || pt.length > 100) return null;
  }
  
  // Optional fields
  if (lead.annual_volume !== undefined && (typeof lead.annual_volume !== 'string' || lead.annual_volume.length > 100)) return null;
  if (lead.message !== undefined && (typeof lead.message !== 'string' || lead.message.length > 5000)) return null;
  if (lead.company !== undefined && (typeof lead.company !== 'string' || lead.company.length > 200)) return null;
  
  return {
    lead: {
      project_types: lead.project_types as string[],
      annual_volume: lead.annual_volume as string | undefined,
      technical_requirements: lead.technical_requirements as string,
      message: lead.message as string | undefined,
      company: lead.company as string | undefined,
      name: lead.name as string,
      email: lead.email as string,
      phone: lead.phone as string,
    },
    companyResearch: obj.companyResearch as LeadScoringRequest['companyResearch']
  };
}

// Verify user is admin
async function verifyAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    return !!adminData;
  } catch {
    return false;
  }
}

function extractEmployeeCount(linkedinInfo?: string): number {
  if (!linkedinInfo) return 0;
  
  const patterns = [
    /(\d+)\s*[-–]\s*(\d+)\s*(?:employees|funcionários)/i,
    /(\d+)\+?\s*(?:employees|funcionários)/i,
  ];
  
  for (const pattern of patterns) {
    const match = linkedinInfo.match(pattern);
    if (match) {
      if (match[2]) {
        return (parseInt(match[1]) + parseInt(match[2])) / 2;
      }
      return parseInt(match[1]);
    }
  }
  
  return 0;
}

function calculateLeadScore(lead: LeadScoringRequest['lead'], companyResearch?: LeadScoringRequest['companyResearch']): { score: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    companySize: 0,
    industryMatch: 0,
    websiteQuality: 0,
    linkedinPresence: 0,
    projectComplexity: 0,
    annualVolume: 0,
    technicalDetail: 0,
    completeness: 0,
    urgency: 0,
    total: 0
  };

  // Company Size (15 points)
  const employeeCount = extractEmployeeCount(companyResearch?.linkedin_info);
  if (employeeCount > 500) breakdown.companySize = 15;
  else if (employeeCount > 100) breakdown.companySize = 12;
  else if (employeeCount > 50) breakdown.companySize = 9;
  else if (employeeCount > 20) breakdown.companySize = 6;
  else if (employeeCount > 0) breakdown.companySize = 3;

  // Industry Match (15 points)
  const targetIndustries = [
    'medical devices', 'dental', 'orthopedic', 'healthcare',
    'dispositivos médicos', 'odontologia', 'ortopedia', 'saúde'
  ];
  const industryText = (companyResearch?.industry || '').toLowerCase();
  if (targetIndustries.some(ind => industryText.includes(ind))) {
    breakdown.industryMatch = 15;
  } else if (industryText.includes('medical') || industryText.includes('health') || industryText.includes('médico') || industryText.includes('saúde')) {
    breakdown.industryMatch = 10;
  } else if (companyResearch?.industry) {
    breakdown.industryMatch = 5;
  }

  // Website Quality (20 points)
  const websiteLength = companyResearch?.website_summary?.length || 0;
  if (websiteLength > 2000) breakdown.websiteQuality = 20;
  else if (websiteLength > 1000) breakdown.websiteQuality = 16;
  else if (websiteLength > 500) breakdown.websiteQuality = 12;
  else if (websiteLength > 200) breakdown.websiteQuality = 8;
  else if (websiteLength > 0) breakdown.websiteQuality = 4;

  // LinkedIn Presence (20 points)
  const linkedinLength = companyResearch?.linkedin_info?.length || 0;
  if (linkedinLength > 1000) breakdown.linkedinPresence = 20;
  else if (linkedinLength > 500) breakdown.linkedinPresence = 16;
  else if (linkedinLength > 300) breakdown.linkedinPresence = 12;
  else if (linkedinLength > 100) breakdown.linkedinPresence = 8;
  else if (linkedinLength > 0) breakdown.linkedinPresence = 4;

  // Project Complexity (15 points)
  const projectCount = lead.project_types?.length || 0;
  breakdown.projectComplexity = Math.min(projectCount * 5, 15);

  // Annual Volume (15 points)
  const volume = lead.annual_volume?.toLowerCase() || '';
  if (volume.includes('10,000') || volume.includes('10.000')) breakdown.annualVolume = 15;
  else if (volume.includes('5,000') || volume.includes('5.000')) breakdown.annualVolume = 12;
  else if (volume.includes('1,000') || volume.includes('1.000')) breakdown.annualVolume = 9;
  else if (volume.includes('500')) breakdown.annualVolume = 6;
  else if (volume) breakdown.annualVolume = 3;

  // Technical Detail (5 points)
  const techLength = lead.technical_requirements?.length || 0;
  if (techLength > 300) breakdown.technicalDetail = 5;
  else if (techLength > 150) breakdown.technicalDetail = 4;
  else if (techLength > 50) breakdown.technicalDetail = 3;
  else breakdown.technicalDetail = 1;

  // Form Completeness (3 points)
  if (lead.company) breakdown.completeness += 1;
  if (lead.annual_volume) breakdown.completeness += 1;
  if (lead.message) breakdown.completeness += 1;

  // Urgency Keywords (2 points)
  const urgentKeywords = [
    'urgente', 'asap', 'imediato', 'prazo curto', 'urgent', 
    'immediately', 'priority', 'prioridade', 'rápido', 'quick'
  ];
  const allText = `${lead.technical_requirements} ${lead.message || ''}`.toLowerCase();
  if (urgentKeywords.some(kw => allText.includes(kw))) {
    breakdown.urgency = 2;
  } else {
    breakdown.urgency = 1;
  }

  // Calculate total (max 110 points, normalized to 100)
  breakdown.total = Object.values(breakdown).reduce((sum, val) => sum + val, 0) - breakdown.total;
  const finalScore = Math.min(Math.round((breakdown.total / 110) * 100), 100);

  return { score: finalScore, breakdown };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdmin(authHeader);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const rawData = await req.json();
    const validatedInput = validateInput(rawData);
    
    if (!validatedInput) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lead, companyResearch } = validatedInput;

    console.log('Calculating lead score for:', lead.email);

    const { score, breakdown } = calculateLeadScore(lead, companyResearch);

    console.log('Lead score calculated:', score, 'Breakdown:', breakdown);

    return new Response(
      JSON.stringify({ 
        score, 
        breakdown,
        category: score >= 80 ? 'hot' : score >= 60 ? 'warm' : 'cold'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error calculating lead score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
