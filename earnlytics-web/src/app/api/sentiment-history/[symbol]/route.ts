import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface QuarterSentiment {
  quarter: string;
  fiscal_year: number;
  fiscal_quarter: number;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  revenue: number | null;
  eps: number | null;
  revenue_yoy_growth: number | null;
  eps_surprise: number | null;
  ai_summary_preview: string;
  earning_id: number;
  report_date: string;
}

interface TrendAnalysis {
  positive_streak: number;
  negative_streak: number;
  sentiment_changes: number;
  overall_trend: 'improving' | 'declining' | 'stable';
}

interface SentimentHistoryResponse {
  symbol: string;
  quarters: QuarterSentiment[];
  trend_analysis: TrendAnalysis;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const companyResult = await supabase
      .from('companies')
      .select('id, symbol')
      .ilike('symbol', symbol)
      .single();

    if (companyResult.error || !companyResult.data) {
      return NextResponse.json(
        { error: 'Company not found', quarters: [], trend_analysis: getDefaultTrendAnalysis() },
        { status: 404 }
      );
    }

    const companyId = companyResult.data.id;

    const earningsResult = await supabase
      .from('earnings')
      .select(`
        id,
        fiscal_year,
        fiscal_quarter,
        report_date,
        revenue,
        revenue_yoy_growth,
        eps,
        eps_estimate,
        eps_surprise,
        net_income,
        ai_analyses (
          sentiment,
          summary
        )
      `)
      .eq('company_id', companyId)
      .not('revenue', 'is', null)
      .order('report_date', { ascending: false })
      .limit(limit);

    if (earningsResult.error) {
      console.error('Error fetching earnings:', earningsResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch earnings', quarters: [], trend_analysis: getDefaultTrendAnalysis() },
        { status: 500 }
      );
    }

    const quarters: QuarterSentiment[] = (earningsResult.data || []).map((earning) => {
      const aiAnalyses = earning.ai_analyses as Array<{ sentiment: string | null; summary: string | null }> | null;
      const aiAnalysis = Array.isArray(aiAnalyses) ? aiAnalyses[0] : null;
      
      return {
        quarter: `Q${earning.fiscal_quarter} ${earning.fiscal_year}`,
        fiscal_year: earning.fiscal_year,
        fiscal_quarter: earning.fiscal_quarter,
        sentiment: (aiAnalysis?.sentiment as 'positive' | 'neutral' | 'negative') || null,
        revenue: earning.revenue,
        eps: earning.eps,
        revenue_yoy_growth: earning.revenue_yoy_growth,
        eps_surprise: earning.eps_surprise,
        ai_summary_preview: aiAnalysis?.summary ? aiAnalysis.summary.slice(0, 100) + '...' : '',
        earning_id: earning.id,
        report_date: earning.report_date,
      };
    });

    const sortedQuarters = [...quarters].sort(
      (a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
    );

    const trendAnalysis = calculateTrendAnalysis(sortedQuarters);

    const response: SentimentHistoryResponse = {
      symbol: upperSymbol,
      quarters: sortedQuarters,
      trend_analysis: trendAnalysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultTrendAnalysis(): TrendAnalysis {
  return {
    positive_streak: 0,
    negative_streak: 0,
    sentiment_changes: 0,
    overall_trend: 'stable',
  };
}

function calculateTrendAnalysis(quarters: QuarterSentiment[]): TrendAnalysis {
  if (quarters.length === 0) {
    return getDefaultTrendAnalysis();
  }

  let positiveStreak = 0;
  let negativeStreak = 0;
  let sentimentChanges = 0;

  const sentimentValues: number[] = quarters.map(q => {
    if (q.sentiment === 'positive') return 1;
    if (q.sentiment === 'negative') return -1;
    return 0;
  });

  let currentStreak = 0;
  let currentStreakType: 'positive' | 'negative' | null = null;

  for (let i = 0; i < quarters.length; i++) {
    const sentiment = quarters[i].sentiment;
    
    if (i > 0 && quarters[i - 1].sentiment !== sentiment && sentiment && quarters[i - 1].sentiment) {
      sentimentChanges++;
    }

    if (sentiment === 'positive') {
      if (currentStreakType === 'positive') {
        currentStreak++;
      } else {
        currentStreakType = 'positive';
        currentStreak = 1;
      }
      positiveStreak = Math.max(positiveStreak, currentStreak);
    } else if (sentiment === 'negative') {
      if (currentStreakType === 'negative') {
        currentStreak++;
      } else {
        currentStreakType = 'negative';
        currentStreak = 1;
      }
      negativeStreak = Math.max(negativeStreak, currentStreak);
    } else {
      currentStreakType = null;
      currentStreak = 0;
    }
  }

  const recentSentiments = sentimentValues.slice(-4);
  const avgRecentSentiment = recentSentiments.reduce((a, b) => a + b, 0) / Math.max(recentSentiments.length, 1);
  
  let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (avgRecentSentiment > 0.3) {
    overallTrend = 'improving';
  } else if (avgRecentSentiment < -0.3) {
    overallTrend = 'declining';
  }

  return {
    positive_streak: positiveStreak,
    negative_streak: negativeStreak,
    sentiment_changes: sentimentChanges,
    overall_trend: overallTrend,
  };
}
