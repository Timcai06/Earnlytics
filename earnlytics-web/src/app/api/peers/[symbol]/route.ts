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
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('symbol, name, sector, industry')
      .ilike('symbol', symbol)
      .single();

    if (companyError) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const { data: currentCompanyPeers } = await supabase
      .from('peer_comparison')
      .select('*')
      .ilike('symbol', symbol)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const { data: peerSymbols } = await supabase
      .from('peer_comparison')
      .select('peer_symbol')
      .ilike('symbol', symbol)
      .order('date', { ascending: false });

    const uniquePeers = [...new Set(peerSymbols?.map(p => p.peer_symbol) || [])].slice(0, 5);

    const { data: peers } = await supabase
      .from('companies')
      .select('symbol, name, market_cap')
      .in('symbol', uniquePeers);

    const { data: valuations } = await supabase
      .from('company_valuation')
      .select('symbol, pe_ratio_ttm, pb_ratio, ps_ratio_ttm, roe, roa, market_cap')
      .in('symbol', [normalizedSymbol, ...uniquePeers])
      .order('date', { ascending: false });

    const latestValuations = new Map();
    valuations?.forEach(v => {
      if (!latestValuations.has(v.symbol)) {
        latestValuations.set(v.symbol, v);
      }
    });

    const companyVal = latestValuations.get(normalizedSymbol);
    const peerData = peers?.map(peer => {
      const val = latestValuations.get(peer.symbol);
      return {
        symbol: peer.symbol,
        name: peer.name,
        marketCap: val?.market_cap || peer.market_cap,
        peRatio: val?.pe_ratio_ttm,
        pbRatio: val?.pb_ratio,
        psRatio: val?.ps_ratio_ttm,
        roe: val?.roe,
        roa: val?.roa,
      };
    }) || [];

    const metrics = ['peRatio', 'pbRatio', 'psRatio', 'roe', 'roa'] as const;
    const rankings: Record<string, { rank: number; total: number; percentile: number }> = {};

    metrics.forEach(metric => {
      const values = [
        { symbol: normalizedSymbol, value: companyVal?.[metric] },
        ...peerData.map(p => ({ symbol: p.symbol, value: p[metric] }))
      ].filter(item => item.value !== null && item.value !== undefined);

      const sorted = values.sort((a, b) => (b.value as number) - (a.value as number));
      const rank = sorted.findIndex(item => item.symbol === normalizedSymbol) + 1;
      const total = sorted.length;
      const percentile = total > 1 ? Math.round(((total - rank) / (total - 1)) * 100) : 50;

      rankings[metric] = { rank, total, percentile };
    });

    return NextResponse.json({
      symbol: normalizedSymbol,
      company: {
        name: company.name,
        sector: company.sector,
        industry: company.industry,
      },
      current: {
        marketCap: companyVal?.market_cap,
        peRatio: companyVal?.pe_ratio_ttm,
        pbRatio: companyVal?.pb_ratio,
        psRatio: companyVal?.ps_ratio_ttm,
        roe: companyVal?.roe,
        roa: companyVal?.roa,
      },
      peers: peerData,
      rankings,
      updatedAt: currentCompanyPeers?.date,
    });
  } catch (error) {
    console.error('Error fetching peer data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
