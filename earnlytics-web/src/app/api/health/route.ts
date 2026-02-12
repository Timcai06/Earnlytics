import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const results: {
    timestamp: string;
    env: { hasSupabaseUrl: boolean; hasSupabaseKey: boolean };
    tests: Record<string, unknown>;
  } = {
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    tests: {},
  };

  if (!supabase) {
    results.tests.supabase = { success: false, error: 'Supabase not configured' };
    return NextResponse.json(results);
  }

  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('symbol, name')
      .limit(3);
    
    results.tests.companies = {
      success: !error,
      count: companies?.length || 0,
      sample: companies?.map(c => c.symbol),
      error: error?.message,
    };
  } catch (e) {
    results.tests.companies = {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  try {
    const { data: earnings, error } = await supabase
      .from('earnings')
      .select('id, company_id, fiscal_quarter')
      .limit(3);
    
    results.tests.earnings = {
      success: !error,
      count: earnings?.length || 0,
      error: error?.message,
    };
  } catch (e) {
    results.tests.earnings = {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  try {
    const { data: analyses, error } = await supabase
      .from('ai_analyses')
      .select('id, earnings_id, sentiment')
      .limit(3);
    
    results.tests.ai_analyses = {
      success: !error,
      count: analyses?.length || 0,
      error: error?.message,
    };
  } catch (e) {
    results.tests.ai_analyses = {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const companiesTest = results.tests.companies as { success?: boolean } | undefined;
  return NextResponse.json(results, {
    status: companiesTest?.success ? 200 : 500,
  });
}
