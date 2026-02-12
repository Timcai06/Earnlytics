/**
 * TESTING GUIDE
 * 
 * Testing infrastructure for Earnlytics investment components
 */

export const testGuide = {
  // Unit Tests
  unit: {
    components: [
      'InvestmentRatingCard - rating display, confidence, pricing',
      'DocumentViewer - view modes, document switching',
      'ValuationGauge - percentile calculations',
      'DuPontAnalysisChart - ROE visualization',
      'GrowthStageChart - lifecycle stages',
      'IndustryComparisonChart - peer rankings'
    ],
    apis: [
      '/api/valuation/[symbol] - PE ratios, historical data',
      '/api/peers/[symbol] - peer comparisons, percentiles',
      '/api/sectors - industry benchmarks',
      '/api/analysis/[symbol]/investment - AI analysis'
    ]
  },
  
  // Integration Tests
  integration: {
    flows: [
      'Dashboard → Analysis navigation',
      'Tab switching in analysis page',
      'Data prefetching on hover',
      'API error handling'
    ]
  },
  
  // Performance Tests
  performance: {
    optimizations: [
      'React.memo on all chart components',
      'useMemo for expensive calculations',
      'useCallback for event handlers',
      'Data prefetching with usePrefetch hook',
      'IntersectionObserver for lazy loading'
    ]
  },
  
  // Mobile Tests
  mobile: {
    checks: [
      'Responsive grid layouts',
      'Touch-friendly tab navigation',
      'Chart readability on small screens',
      'Button sizes for mobile touch',
      'Text scaling on different devices'
    ]
  }
};
