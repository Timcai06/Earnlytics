import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    
    const { data: valuation, error: valuationError } = await supabase
      .from('company_valuation')
      .select(`
        *,
        companies!inner(
          name,
          sector,
          industry
        )
      `)
      .ilike('symbol', symbol)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (valuationError) {
      if (valuationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Company valuation data not found' },
          { status: 404 }
        );
      }
      throw valuationError;
    }

    const { data: benchmark } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('sector', (valuation.companies as { sector?: string })?.sector)
      .eq('industry', (valuation.companies as { industry?: string })?.industry)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const { data: history } = await supabase
      .from('company_valuation')
      .select('date, pe_ratio_ttm, pb_ratio, ps_ratio_ttm, market_cap')
      .eq('symbol', normalizedSymbol)
      .order('date', { ascending: false })
      .limit(252);

    const currentPE = valuation.pe_ratio_ttm;
    const historicalPEs = history?.map(h => h.pe_ratio_ttm).filter(Boolean) || [];
    const pePercentile = calculatePercentile(currentPE, historicalPEs);

    const currentPB = valuation.pb_ratio;
    const historicalPBs = history?.map(h => h.pb_ratio).filter(Boolean) || [];
    const pbPercentile = calculatePercentile(currentPB, historicalPBs);

    const currentPS = valuation.ps_ratio_ttm;
    const historicalPSs = history?.map(h => h.ps_ratio_ttm).filter(Boolean) || [];
    const psPercentile = calculatePercentile(currentPS, historicalPSs);

    const assessment = determineValuationAssessment(
      currentPE,
      benchmark?.pe_ratio_median,
      pePercentile
    );

    return NextResponse.json({
      symbol: normalizedSymbol,
      company: valuation.companies,
      current: {
        marketCap: valuation.market_cap,
        enterpriseValue: valuation.enterprise_value,
        peRatio: valuation.pe_ratio_ttm,
        forwardPE: valuation.forward_pe,
        pegRatio: valuation.peg_ratio,
        pbRatio: valuation.pb_ratio,
        psRatio: valuation.ps_ratio_ttm,
        evEbitda: valuation.ev_ebitda,
        evSales: valuation.ev_sales,
        evFcf: valuation.ev_fcf,
        priceToFcf: valuation.price_to_fcf,
        roe: valuation.roe,
        roa: valuation.roa,
        roic: valuation.roic,
      },
      historical: {
        pePercentile,
        pbPercentile,
        psPercentile,
        historicalPEs: historicalPEs.slice(0, 30),
        historicalPBs: historicalPBs.slice(0, 30),
        historicalPSs: historicalPSs.slice(0, 30),
      },
      benchmark: benchmark ? {
        sector: benchmark.sector,
        industry: benchmark.industry,
        peRatioMedian: benchmark.pe_ratio_median,
        peRatioMean: benchmark.pe_ratio_mean,
        pbRatioMedian: benchmark.pb_ratio_median,
        psRatioMedian: benchmark.ps_ratio_median,
        evEbitdaMedian: benchmark.ev_ebitda_median,
        roeMedian: benchmark.roe_median,
        roaMedian: benchmark.roa_median,
      } : null,
      assessment,
      updatedAt: valuation.updated_at,
    });
  } catch (error) {
    console.error('Error fetching valuation data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculatePercentile(value: number | null, historical: number[]): number | null {
  if (!value || historical.length === 0) return null;
  
  const sorted = [...historical].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  
  if (index === -1) return 100;
  return Math.round((index / sorted.length) * 100);
}

function determineValuationAssessment(
  currentPE: number | null,
  benchmarkPE: number | null,
  pePercentile: number | null
): 'undervalued' | 'fair' | 'overvalued' | 'unknown' {
  if (!currentPE || !benchmarkPE || !pePercentile) {
    return 'unknown';
  }

  const vsBenchmark = currentPE / benchmarkPE;
  
  if (pePercentile < 25 || vsBenchmark < 0.8) {
    return 'undervalued';
  } else if (pePercentile > 75 || vsBenchmark > 1.3) {
    return 'overvalued';
  } else {
    return 'fair';
  }
}
