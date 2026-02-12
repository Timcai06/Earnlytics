import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 1800;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const broker = searchParams.get('broker');
    const rating = searchParams.get('rating');
    const days = parseInt(searchParams.get('days') || '90');
    
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    let query = supabase
      .from('research_reports')
      .select(`
        *,
        analyst:analyst_tracking (
          id,
          analyst_name,
          broker,
          accuracy_score,
          total_recommendations,
          successful_recommendations
        )
      `)
      .eq('symbol', normalizedSymbol)
      .gte('publish_date', sinceDate.toISOString().split('T')[0])
      .order('publish_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (broker) {
      query = query.eq('broker', broker);
    }

    if (rating) {
      query = query.eq('rating', rating);
    }

    const { data: reports, error } = await query;

    if (error) {
      throw error;
    }

    const { count: totalCount } = await supabase
      .from('research_reports')
      .select('*', { count: 'exact', head: true })
      .eq('symbol', normalizedSymbol)
      .gte('publish_date', sinceDate.toISOString().split('T')[0]);

    const { data: consensus } = await supabase
      .from('earnings_consensus')
      .select('eps_estimate, revenue_estimate, analyst_count')
      .eq('symbol', normalizedSymbol)
      .order('consensus_date', { ascending: false })
      .limit(1)
      .single();

    const { data: distinctBrokers } = await supabase
      .from('research_reports')
      .select('broker', { count: 'exact' })
      .eq('symbol', normalizedSymbol)
      .gte('publish_date', sinceDate.toISOString().split('T')[0]);

    const { data: ratingDistribution } = await supabase
      .from('research_reports')
      .select('rating')
      .eq('symbol', normalizedSymbol)
      .gte('publish_date', sinceDate.toISOString().split('T')[0]);

    const ratings = ratingDistribution?.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const averageTargetPrice = reports?.length 
      ? reports.reduce((sum, r) => sum + (r.target_price || 0), 0) / reports.filter(r => r.target_price).length
      : null;

    const highTarget = reports?.length 
      ? Math.max(...reports.filter(r => r.target_price).map(r => r.target_price || 0))
      : null;

    const lowTarget = reports?.length 
      ? Math.min(...reports.filter(r => r.target_price).map(r => r.target_price || 0))
      : null;

    return NextResponse.json({
      symbol: normalizedSymbol,
      summary: {
        totalReports: totalCount || 0,
        uniqueBrokers: new Set(distinctBrokers?.map(b => b.broker)).size,
        ratingDistribution: ratings,
        averageTargetPrice,
        targetPriceRange: highTarget && lowTarget ? { high: highTarget, low: lowTarget } : null,
        consensus: consensus ? {
          epsEstimate: consensus.eps_estimate,
          revenueEstimate: consensus.revenue_estimate,
          analystCount: consensus.analyst_count,
        } : null,
      },
      reports: reports?.map(report => ({
        id: report.id,
        title: report.title,
        broker: report.broker,
        analyst: report.analyst ? {
          name: report.analyst.analyst_name,
          broker: report.analyst.broker,
          accuracyScore: report.analyst.accuracy_score,
          trackRecord: report.analyst.total_recommendations > 0 
            ? `${report.analyst.successful_recommendations}/${report.analyst.total_recommendations}`
            : null,
        } : null,
        rating: report.rating,
        targetPrice: report.target_price,
        currency: report.currency,
        publishDate: report.publish_date,
        summary: report.summary,
        keyPoints: report.key_points,
        hasFullReport: !!report.content,
        externalUrl: report.source_url,
        pageCount: report.page_count,
      })) || [],
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (offset + limit) < (totalCount || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching research reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
