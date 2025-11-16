import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function extractEmployeeCount(linkedinInfo?: string): number {
  if (!linkedinInfo) return 0;
  
  // Look for patterns like "500 employees", "100-500 employees", etc.
  const patterns = [
    /(\d+)\s*[-–]\s*(\d+)\s*(?:employees|funcionários)/i,
    /(\d+)\+?\s*(?:employees|funcionários)/i,
  ];
  
  for (const pattern of patterns) {
    const match = linkedinInfo.match(pattern);
    if (match) {
      // If range, take the average
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

  // Company Size (15 points) - Good weight
  const employeeCount = extractEmployeeCount(companyResearch?.linkedin_info);
  if (employeeCount > 500) breakdown.companySize = 15;
  else if (employeeCount > 100) breakdown.companySize = 12;
  else if (employeeCount > 50) breakdown.companySize = 9;
  else if (employeeCount > 20) breakdown.companySize = 6;
  else if (employeeCount > 0) breakdown.companySize = 3;

  // Industry Match (15 points) - Good weight
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

  // Website Quality (20 points) - HIGH weight as requested
  const websiteLength = companyResearch?.website_summary?.length || 0;
  if (websiteLength > 2000) breakdown.websiteQuality = 20;
  else if (websiteLength > 1000) breakdown.websiteQuality = 16;
  else if (websiteLength > 500) breakdown.websiteQuality = 12;
  else if (websiteLength > 200) breakdown.websiteQuality = 8;
  else if (websiteLength > 0) breakdown.websiteQuality = 4;

  // LinkedIn Presence (20 points) - HIGH weight as requested
  const linkedinLength = companyResearch?.linkedin_info?.length || 0;
  if (linkedinLength > 1000) breakdown.linkedinPresence = 20;
  else if (linkedinLength > 500) breakdown.linkedinPresence = 16;
  else if (linkedinLength > 300) breakdown.linkedinPresence = 12;
  else if (linkedinLength > 100) breakdown.linkedinPresence = 8;
  else if (linkedinLength > 0) breakdown.linkedinPresence = 4;

  // Project Complexity (15 points) - HIGH weight as requested
  const projectCount = lead.project_types?.length || 0;
  breakdown.projectComplexity = Math.min(projectCount * 5, 15);

  // Annual Volume (15 points) - HIGH weight as requested
  const volume = lead.annual_volume?.toLowerCase() || '';
  if (volume.includes('10,000') || volume.includes('10.000')) breakdown.annualVolume = 15;
  else if (volume.includes('5,000') || volume.includes('5.000')) breakdown.annualVolume = 12;
  else if (volume.includes('1,000') || volume.includes('1.000')) breakdown.annualVolume = 9;
  else if (volume.includes('500')) breakdown.annualVolume = 6;
  else if (volume) breakdown.annualVolume = 3;

  // Technical Detail (5 points) - Medium weight
  const techLength = lead.technical_requirements?.length || 0;
  if (techLength > 300) breakdown.technicalDetail = 5;
  else if (techLength > 150) breakdown.technicalDetail = 4;
  else if (techLength > 50) breakdown.technicalDetail = 3;
  else breakdown.technicalDetail = 1;

  // Form Completeness (3 points) - LOW weight as requested
  if (lead.company) breakdown.completeness += 1;
  if (lead.annual_volume) breakdown.completeness += 1;
  if (lead.message) breakdown.completeness += 1;

  // Urgency Keywords (2 points) - LOW weight as requested
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
    const { lead, companyResearch }: LeadScoringRequest = await req.json();

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
