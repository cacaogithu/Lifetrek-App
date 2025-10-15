import { CalculatorInputs, CalculationResults } from "@/pages/Calculator";

export interface LeadScore {
  total: number;
  tier: 'hot' | 'warm' | 'cold';
  factors: {
    volumeScore: number;
    budgetScore: number;
    complexityScore: number;
    urgencyScore: number;
  };
  insights: string[];
}

export const calculateLeadScore = (
  inputs: CalculatorInputs,
  results: CalculationResults
): LeadScore => {
  let volumeScore = 0;
  let budgetScore = 0;
  let complexityScore = 0;
  let urgencyScore = 0;
  const insights: string[] = [];

  // Volume Score (0-30 points)
  if (inputs.annualVolume > 10000) {
    volumeScore = 30;
    insights.push('High-volume opportunity with excellent economies of scale');
  } else if (inputs.annualVolume > 5000) {
    volumeScore = 22;
    insights.push('Medium-high volume with good recurring revenue potential');
  } else if (inputs.annualVolume > 1000) {
    volumeScore = 15;
    insights.push('Medium volume, ideal for dedicated production runs');
  } else if (inputs.annualVolume > 500) {
    volumeScore = 10;
    insights.push('Small-medium volume, suitable for flexible manufacturing');
  } else {
    volumeScore = 5;
    insights.push('Low volume, best for prototype or specialized production');
  }

  // Budget Score (0-25 points) - Based on annual spend
  const annualBudget = results.estimatedCost.annual;
  if (annualBudget > 500000) {
    budgetScore = 25;
    insights.push('Premium project value with strategic account potential');
  } else if (annualBudget > 200000) {
    budgetScore = 20;
    insights.push('Strong project value with solid margin potential');
  } else if (annualBudget > 100000) {
    budgetScore = 15;
    insights.push('Good project value, attractive for ongoing partnership');
  } else if (annualBudget > 50000) {
    budgetScore = 10;
    insights.push('Moderate project value with growth potential');
  } else {
    budgetScore = 5;
    insights.push('Entry-level project, opportunity for relationship building');
  }

  // Complexity Score (0-25 points) - Higher complexity = better fit for our capabilities
  switch (inputs.partComplexity) {
    case 'highly-complex':
      complexityScore = 25;
      insights.push('Highly complex parts showcase our advanced CNC capabilities');
      break;
    case 'complex':
      complexityScore = 20;
      insights.push('Complex parts align well with our precision manufacturing expertise');
      break;
    case 'moderate':
      complexityScore = 12;
      insights.push('Moderate complexity suits our flexible manufacturing approach');
      break;
    case 'simple':
      complexityScore = 5;
      insights.push('Simple parts, consider efficiency vs. value proposition');
      break;
  }

  // Additional complexity factors
  if (inputs.certifications.length >= 2) {
    complexityScore += 5;
    insights.push('Multiple certifications required - leverages our ISO 13485 and regulatory expertise');
  }

  if (inputs.tolerances === 'ultra-precision') {
    complexityScore += 5;
    insights.push('Ultra-precision tolerances require our advanced metrology capabilities');
  }

  // Urgency Score (0-20 points) - Based on material and requirements
  if (['titanium', 'peek', 'cobalt-chrome'].includes(inputs.material)) {
    urgencyScore += 10;
    insights.push('Premium materials indicate high-value medical application');
  }

  if (inputs.certifications.includes('ISO 13485')) {
    urgencyScore += 5;
    insights.push('Medical device certification indicates regulatory urgency');
  }

  if (inputs.surfaceFinish === 'electropolished') {
    urgencyScore += 5;
    insights.push('Electropolishing requirement suggests biocompatibility needs');
  }

  // Calculate total score
  const total = volumeScore + budgetScore + complexityScore + urgencyScore;

  // Determine tier
  let tier: 'hot' | 'warm' | 'cold';
  if (total >= 75) {
    tier = 'hot';
    insights.unshift('🔥 HOT LEAD: High-priority opportunity - immediate follow-up recommended');
  } else if (total >= 50) {
    tier = 'warm';
    insights.unshift('🌡️ WARM LEAD: Qualified opportunity - follow-up within 48 hours');
  } else {
    tier = 'cold';
    insights.unshift('❄️ COLD LEAD: Lower priority - nurture with educational content');
  }

  return {
    total,
    tier,
    factors: {
      volumeScore,
      budgetScore,
      complexityScore,
      urgencyScore
    },
    insights
  };
};
