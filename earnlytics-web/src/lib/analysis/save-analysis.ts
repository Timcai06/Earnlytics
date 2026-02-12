import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface InvestmentAnalysis {
  symbol: string;
  companyId: number;
  investmentRating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: 'high' | 'medium' | 'low';
  targetPrice: {
    low: number;
    high: number;
  };
  financialQuality: {
    score: number;
    roeDuPont: {
      netMargin: number;
      assetTurnover: number;
      equityMultiplier: number;
      analysis: string;
    };
    cashFlowHealth: 'healthy' | 'moderate' | 'concerning';
    riskLevel: 'low' | 'medium' | 'high';
  };
  growth: {
    stage: 'introduction' | 'growth' | 'maturity' | 'decline';
    revenueCAGR3Y: number;
    profitCAGR3Y: number;
    quality: 'high' | 'medium' | 'low';
    outlook: 'accelerating' | 'stable' | 'decelerating';
  };
  moat: {
    primaryType: 'brand' | 'cost' | 'technology' | 'network' | 'none';
    strength: 'wide' | 'narrow' | 'none';
    porterScore: number;
    sustainability: 'strong' | 'moderate' | 'weak';
    analysis: string;
  };
  valuation: {
    assessment: 'undervalued' | 'fair' | 'overvalued';
    pePercentile: number;
    vsIndustry: 'premium' | 'discount' | 'fair';
    fairPE: number;
    analysis: string;
  };
  keyPoints: string[];
  risks: string[];
  catalysts: string[];
  summary: string;
  investmentHorizon: 'short' | 'medium' | 'long';
}

export async function saveInvestmentAnalysis(
  analysis: InvestmentAnalysis
): Promise<void> {
  const { error } = await supabase
    .from('investment_analyses')
    .upsert({
      symbol: analysis.symbol,
      company_id: analysis.companyId,
      investment_rating: analysis.investmentRating,
      confidence: analysis.confidence,
      target_price_low: analysis.targetPrice.low,
      target_price_high: analysis.targetPrice.high,
      financial_quality_score: analysis.financialQuality.score,
      growth_stage: analysis.growth.stage,
      moat_strength: analysis.moat.strength,
      valuation_assessment: analysis.valuation.assessment,
      key_points: analysis.keyPoints,
      risks: analysis.risks,
      catalysts: analysis.catalysts,
      summary: analysis.summary,
      full_analysis: analysis,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'symbol'
    });

  if (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}

export async function getLatestAnalysis(
  symbol: string
): Promise<InvestmentAnalysis | null> {
  const { data, error } = await supabase
    .from('investment_analyses')
    .select('*')
    .eq('symbol', symbol.toUpperCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data.full_analysis as InvestmentAnalysis;
}
