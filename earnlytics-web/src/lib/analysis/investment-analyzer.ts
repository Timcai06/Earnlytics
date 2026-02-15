import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { 
  INVESTMENT_ANALYSIS_PROMPT, 
  fillPromptTemplate, 
  generateAnalysisData 
} from '../prompts/investment-analysis';

config({ path: resolve(process.cwd(), '.env.local') });

// 初始化Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// DeepSeek API配置
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 分析结果接口
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

interface Financials {
  net_income?: number;
  revenue?: number;
  total_assets?: number;
  shareholders_equity?: number;
}

interface CompanyData {
  id: number;
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  [key: string]: unknown;
}

interface ValuationData {
  company_id: number;
  current_price?: number;
  pe_ratio_ttm?: number;
  pb_ratio?: number;
  ps_ratio_ttm?: number;
  roe?: number;
  roa?: number;
  market_cap?: number;
  [key: string]: unknown;
}

interface EarningsData {
  company_id: number;
  revenue?: number;
  net_income?: number;
  eps?: number;
  gross_margin?: number;
  net_margin?: number;
  revenue_yoy_growth?: number;
  profit_yoy_growth?: number;
  report_date?: string;
  [key: string]: unknown;
}

interface BenchmarkData {
  sector?: string;
  industry?: string;
  avg_pe?: number;
  avg_roe?: number;
  [key: string]: unknown;
}

interface PeerData {
  company_id: number;
  percentile?: number;
  [key: string]: unknown;
}

interface AnalysisData {
  company: CompanyData;
  valuation: ValuationData | null;
  earnings: EarningsData | null;
  benchmark: BenchmarkData | null;
  peers: PeerData[];
}

/**
 * 投资分析器主类
 */
export class InvestmentAnalyzer {
  
  /**
   * 获取分析所需的所有数据
   */
  private async fetchAnalysisData(symbol: string): Promise<AnalysisData | null> {
    try {
      // 获取公司信息
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('symbol', symbol)
        .single();
      
      if (companyError || !company) {
        console.error(`Company not found: ${symbol}`);
        return null;
      }

      // 获取最新估值数据
      const { data: valuation, error: valuationError } = await supabase
        .from('company_valuation')
        .select('*')
        .eq('company_id', company.id)
        .single();

      // 获取最新财报
      const { data: earnings, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .eq('company_id', company.id)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      // 获取行业基准
      const { data: benchmarks, error: benchmarkError } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('sector', company.sector);

      // 获取同行对比数据
      const { data: peers, error: peersError } = await supabase
        .from('peer_comparison')
        .select('*')
        .eq('company_id', company.id);

      return {
        company,
        valuation,
        earnings,
        benchmark: benchmarks?.[0] || null,
        peers: peers || []
      };
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      return null;
    }
  }

  /**
   * 计算杜邦分析
   */
  private calculateDuPont(financials: Financials): { netMargin: number; assetTurnover: number; equityMultiplier: number } {
    const netIncome = financials?.net_income || 0;
    const revenue = financials?.revenue || 1;
    const totalAssets = financials?.total_assets || 1;
    const equity = financials?.shareholders_equity || 1;

    return {
      netMargin: (netIncome / revenue) * 100,
      assetTurnover: revenue / totalAssets,
      equityMultiplier: totalAssets / equity
    };
  }

  /**
   * 计算增长率
   */
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    const years = values.length - 1;
    return (Math.pow(last / first, 1 / years) - 1) * 100;
  }

  /**
   * 计算波特五力评分
   */
  private calculatePorterScore(data: AnalysisData): number {
    // 基于行业特征和竞争数据计算
    // 这里使用简化的评分逻辑
    const baseScore = 50;
    
    // 如果有同行对比数据，调整分数
    if (data.peers && data.peers.length > 0) {
      const avgPercentile = data.peers.reduce((sum, p) => sum + (p.percentile || 50), 0) / data.peers.length;
      return Math.min(100, Math.max(0, baseScore + (avgPercentile - 50)));
    }
    
    return baseScore;
  }

  /**
   * 调用DeepSeek API进行分析
   */
  private async callDeepSeekAPI(prompt: string): Promise<any> {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional investment analyst. Provide analysis in the requested JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from DeepSeek API');
    }

    return JSON.parse(content);
  }

  /**
   * 执行完整的投资分析
   */
  public async analyze(symbol: string): Promise<InvestmentAnalysis | null> {
    console.log(`🔍 Starting investment analysis for ${symbol}...`);
    
    try {
      // 1. 获取分析数据
      const data = await this.fetchAnalysisData(symbol);
      if (!data) {
        console.error(`❌ Failed to fetch analysis data for ${symbol}`);
        return null;
      }

      console.log(`✅ Data fetched for ${symbol}`);

      // 2. 准备Prompt数据
      const promptData = generateAnalysisData(
        data.company,
        data.valuation,
        data.earnings,
        data.benchmark
      );

      // 3. 填充Prompt模板
      const filledPrompt = fillPromptTemplate(INVESTMENT_ANALYSIS_PROMPT, promptData);

      // 4. 调用AI进行分析
      console.log(`🤖 Calling DeepSeek API...`);
      const aiResult = await this.callDeepSeekAPI(filledPrompt);

      // 5. 构建完整的分析结果
      const analysis: InvestmentAnalysis = {
        symbol: symbol.toUpperCase(),
        companyId: data.company.id,
        ...aiResult
      };

      // 6. 保存分析结果
      await this.saveAnalysis(analysis);

      console.log(`✅ Analysis completed for ${symbol}`);
      console.log(`📊 Rating: ${analysis.investmentRating.toUpperCase()} | Target: $${analysis.targetPrice.low}-$${analysis.targetPrice.high}`);

      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing ${symbol}:`, error);
      return null;
    }
  }

  /**
   * 保存分析结果到数据库
   */
  private async saveAnalysis(analysis: InvestmentAnalysis): Promise<void> {
    try {
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
        console.error('Error saving analysis:', error);
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  /**
   * 批量分析多个公司
   */
  public async analyzeBatch(symbols: string[]): Promise<InvestmentAnalysis[]> {
    const results: InvestmentAnalysis[] = [];
    
    for (const symbol of symbols) {
      const analysis = await this.analyze(symbol);
      if (analysis) {
        results.push(analysis);
      }
      
      // 延迟以避免API限流
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }
}

// 导出单例
export const investmentAnalyzer = new InvestmentAnalyzer();
