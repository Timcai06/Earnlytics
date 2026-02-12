import { NextRequest, NextResponse } from 'next/server';
import { investmentAnalyzer } from '@/lib/analysis/investment-analyzer';
import { supabase } from '@/lib/supabase';

// 缓存时间：24小时
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  console.log(`📊 GET /api/analysis/${upperSymbol}/investment`);

  try {
    // 1. 检查缓存 (case-insensitive)
    const { data: cachedRow } = await supabase
      .from('investment_analyses')
      .select('full_analysis, created_at, symbol')
      .ilike('symbol', symbol)
      .single();

    if (cachedRow && cachedRow.full_analysis) {
      const cacheAge = Date.now() - new Date(cachedRow.created_at || Date.now()).getTime();

      // 如果缓存未过期，直接返回
      if (cacheAge < CACHE_TTL) {
        console.log(`✅ Returning cached analysis for ${upperSymbol}`);
        return NextResponse.json({
          symbol: upperSymbol,
          analysis: cachedRow.full_analysis,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. 执行新的分析
    console.log(`🤖 Generating new analysis for ${upperSymbol}...`);
    const analysis = await investmentAnalyzer.analyze(upperSymbol);

    if (!analysis) {
      return NextResponse.json(
        {
          error: 'Analysis failed',
          message: `Failed to generate investment analysis for ${upperSymbol}`
        },
        { status: 500 }
      );
    }

    // 3. 返回结果
    return NextResponse.json({
      symbol: upperSymbol,
      analysis,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error analyzing ${upperSymbol}:`, error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
