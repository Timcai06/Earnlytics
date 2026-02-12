import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    
    const { data: benchmarks, error } = await supabase
      .from('industry_benchmarks')
      .select('sector, industry, date, pe_ratio_median, pb_ratio_median, ps_ratio_median, roe_median, roa_median, ev_ebitda_median, company_count')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    const latestByIndustry = new Map();
    benchmarks?.forEach(b => {
      const key = `${b.sector}-${b.industry}`;
      if (!latestByIndustry.has(key)) {
        latestByIndustry.set(key, b);
      }
    });

    const allIndustries = Array.from(latestByIndustry.values());

    const sectorsMap = new Map();
    allIndustries.forEach(industry => {
      if (!sectorsMap.has(industry.sector)) {
        sectorsMap.set(industry.sector, {
          name: industry.sector,
          industries: [],
          avgPE: [],
          avgPB: [],
          avgPS: [],
          totalCompanies: 0,
        });
      }
      
      const sectorData = sectorsMap.get(industry.sector);
      sectorData.industries.push({
        name: industry.industry,
        companyCount: industry.company_count,
        metrics: {
          peRatio: industry.pe_ratio_median,
          pbRatio: industry.pb_ratio_median,
          psRatio: industry.ps_ratio_median,
          roe: industry.roe_median,
          roa: industry.roa_median,
          evEbitda: industry.ev_ebitda_median,
        },
        updatedAt: industry.date,
      });
      
      if (industry.pe_ratio_median) sectorData.avgPE.push(industry.pe_ratio_median);
      if (industry.pb_ratio_median) sectorData.avgPB.push(industry.pb_ratio_median);
      if (industry.ps_ratio_median) sectorData.avgPS.push(industry.ps_ratio_median);
      sectorData.totalCompanies += industry.company_count || 0;
    });

    const sectors = Array.from(sectorsMap.values()).map(s => ({
      name: s.name,
      industryCount: s.industries.length,
      totalCompanies: s.totalCompanies,
      avgMetrics: {
        peRatio: s.avgPE.length > 0 ? s.avgPE.reduce((a: number, b: number) => a + b, 0) / s.avgPE.length : null,
        pbRatio: s.avgPB.length > 0 ? s.avgPB.reduce((a: number, b: number) => a + b, 0) / s.avgPB.length : null,
        psRatio: s.avgPS.length > 0 ? s.avgPS.reduce((a: number, b: number) => a + b, 0) / s.avgPS.length : null,
      },
      industries: s.industries,
    }));

    if (sector) {
      const selectedSector = sectors.find(s => s.name.toLowerCase() === sector.toLowerCase());
      if (!selectedSector) {
        return NextResponse.json(
          { error: 'Sector not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(selectedSector);
    }

    return NextResponse.json({
      sectors: sectors.map(s => ({
        name: s.name,
        industryCount: s.industryCount,
        totalCompanies: s.totalCompanies,
        avgMetrics: s.avgMetrics,
      })),
      totalSectors: sectors.length,
      totalCompanies: sectors.reduce((sum, s) => sum + s.totalCompanies, 0),
    });
  } catch (error) {
    console.error('Error fetching sector data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
