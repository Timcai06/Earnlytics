/**
 * Test utilities and mock data for investment components
 */

import { InvestmentRating, InvestmentAnalysis } from '@/types/investment'

// Mock investment rating data
export const mockInvestmentRating: InvestmentRating = {
  rating: 'buy',
  confidence: 'high',
  targetPrice: { low: 180, high: 220 },
  currentPrice: 175.5,
  investmentThesis: [
    'Strong revenue growth with 15% YoY increase',
    'Expanding market share in cloud computing',
    'Healthy balance sheet with low debt',
  ],
  keyRisks: [
    'Intense competition from major tech companies',
    'Regulatory scrutiny in key markets',
    'Dependency on key supplier relationships',
  ],
  catalysts: [
    'Q4 earnings announcement next month',
    'New product launch in AI sector',
    'Potential partnership with automotive industry',
  ],
}

// Mock financial health data
export const mockFinancialHealth = {
  overallScore: 85,
  profitability: {
    score: 90,
    roe: 25.5,
    roa: 12.3,
    netMargin: 18.7,
  },
  liquidity: {
    score: 80,
    currentRatio: 1.8,
    quickRatio: 1.5,
    cashRatio: 0.8,
  },
  solvency: {
    score: 85,
    debtToEquity: 0.4,
    interestCoverage: 15.2,
  },
  efficiency: {
    score: 88,
    assetTurnover: 0.66,
    inventoryTurnover: 8.5,
  },
  duPontAnalysis: {
    netProfitMargin: 18.7,
    assetTurnover: 0.66,
    equityMultiplier: 2.05,
    roe: 25.5,
  },
  cashFlowHealth: {
    status: 'healthy' as const,
    operatingCashFlow: 85000000000,
    freeCashFlow: 65000000000,
    fcfToRevenue: 25.2,
  },
}

// Mock valuation data
export const mockValuationData = {
  currentPE: 28.5,
  historicalPE: {
    min: 18.2,
    max: 42.1,
    avg: 28.8,
    median: 27.5,
  },
  pePercentile: 52,
  assessment: 'fair' as const,
  industryAvgPE: 29.2,
}

// Mock growth data
export const mockGrowthData = {
  stage: 'growth' as const,
  revenueCAGR3Y: 18.5,
  epsCAGR3Y: 22.3,
  revenueGrowthYoY: 15.2,
  epsGrowthYoY: 18.7,
}

// Mock moat data
export const mockMoatData = {
  strength: 'wide' as const,
  porterScore: 82,
  competitiveAdvantages: [
    'Strong brand recognition and customer loyalty',
    'High switching costs for enterprise customers',
    'Economies of scale in manufacturing',
    'Patent portfolio in key technologies',
  ],
  porterForces: {
    competitiveRivalry: 3,
    supplierPower: 2,
    buyerPower: 2,
    threatOfSubstitutes: 2,
    threatOfNewEntrants: 1,
  },
}

// Mock peer comparison data
export const mockPeerComparison = [
  { symbol: 'AAPL', company: 'Apple Inc.', pe: 28.5, roe: 25.5, revenueGrowth: 15.2, marketCap: 2800000000000 },
  { symbol: 'MSFT', company: 'Microsoft Corp.', pe: 32.1, roe: 22.8, revenueGrowth: 12.5, marketCap: 3100000000000 },
  { symbol: 'GOOGL', company: 'Alphabet Inc.', pe: 24.3, roe: 20.1, revenueGrowth: 18.7, marketCap: 1900000000000 },
  { symbol: 'AMZN', company: 'Amazon.com Inc.', pe: 58.2, roe: 12.5, revenueGrowth: 11.8, marketCap: 1700000000000 },
  { symbol: 'META', company: 'Meta Platforms', pe: 25.8, roe: 18.9, revenueGrowth: 22.3, marketCap: 1200000000000 },
]

// Mock industry benchmark data
export const mockIndustryBenchmark = {
  sector: 'Technology',
  industry: 'Consumer Electronics',
  metrics: {
    avgPE: 29.2,
    medianPE: 27.5,
    avgROE: 18.5,
    medianROE: 16.2,
    avgRevenueGrowth: 14.8,
    medianRevenueGrowth: 12.5,
  },
}

// Mock SEC document data
export const mockSECDocument = {
  id: 'doc-001',
  symbol: 'AAPL',
  filingType: '10-K',
  fiscalYear: '2024',
  fiscalPeriod: 'FY',
  filingDate: '2024-10-30',
  acceptanceDateTime: '2024-10-30T16:30:00Z',
  documentUrl: 'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
  content: `
    <html>
      <body>
        <h1>UNITED STATES SECURITIES AND EXCHANGE COMMISSION</h1>
        <h2>Form 10-K</h2>
        <h3>Apple Inc.</h3>
        <p>Fiscal Year Ended September 28, 2024</p>
        <section>
          <h4>Item 7. Management's Discussion and Analysis</h4>
          <p>Net sales increased $19.1 billion or 6% during 2024 compared to 2023...</p>
        </section>
      </body>
    </html>
  `,
  extractedText: `
    Apple Inc.
    Form 10-K
    Fiscal Year 2024
    
    Net sales increased $19.1 billion or 6% during 2024 compared to 2023.
    iPhone net sales increased $10.0 billion or 4% year-over-year.
    Services net sales increased $18.7 billion or 13% year-over-year.
  `,
  sizeBytes: 15420000,
  pageCount: 95,
}

// Mock AI summary data
export const mockAISummary = {
  id: 'summary-001',
  symbol: 'AAPL',
  type: '10-K',
  period: 'FY2024',
  summary: {
    keyHighlights: [
      'Revenue reached $391.0 billion, up 6% YoY',
      'Services revenue hit $85.2 billion, growing 13%',
      'iPhone revenue at $200.6 billion, up 4%',
      'Gross margin improved to 46.2%',
    ],
    financialPerformance: 'Strong performance with record Services revenue and improved margins across all product categories.',
    strategicInitiatives: 'Focus on AI integration across product lineup, expansion in emerging markets, and Services ecosystem growth.',
    riskFactors: 'Regulatory challenges in EU and China, supply chain dependencies, and intense competition in smartphone market.',
    outlook: 'Management expects continued growth in Services and double-digit growth in emerging markets.',
  },
  keyMetrics: {
    revenue: 391000000000,
    netIncome: 93700000000,
    eps: 6.08,
    grossMargin: 46.2,
    operatingMargin: 30.4,
  },
  generatedAt: '2024-10-31T10:30:00Z',
}

// Mock complete investment analysis
export const mockInvestmentAnalysis: InvestmentAnalysis = {
  symbol: 'AAPL',
  investmentRating: 'buy',
  confidence: 'high',
  targetPrice: { low: 180, high: 220 },
  currentPrice: 175.5,
  financialQuality: {
    score: 85,
    roeDuPont: {
      netMargin: 23.95,
      assetTurnover: 0.83,
      equityMultiplier: 1.28,
    },
    cashFlowHealth: 'healthy',
  },
  growth: {
    stage: 'maturity',
    revenueCAGR3Y: 8.5,
  },
  moat: {
    strength: 'wide',
    porterScore: 85,
  },
  valuation: {
    assessment: 'fair',
    pePercentile: 52,
  },
  keyPoints: [
    'Leading market position in premium smartphone segment',
    'Strong ecosystem creating customer loyalty',
    'Services segment providing recurring revenue',
  ],
  risks: [
    'Regulatory pressure in key markets',
    'High dependence on iPhone sales',
    'Supply chain concentration risks',
  ],
  catalysts: [
    'AI features driving upgrade cycle',
    'Services growth acceleration',
    'Emerging market expansion',
  ],
  lastUpdated: '2024-11-01T00:00:00Z',
}

// Helper functions for tests
export function createMockInvestmentRating(overrides?: Partial<InvestmentRating>): InvestmentRating {
  return {
    ...mockInvestmentRating,
    ...overrides,
  }
}

export function createMockInvestmentAnalysis(overrides?: Partial<InvestmentAnalysis>): InvestmentAnalysis {
  return {
    ...mockInvestmentAnalysis,
    ...overrides,
  }
}
