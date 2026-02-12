export const INVESTMENT_ANALYSIS_PROMPT = `你是一位拥有20年经验的资深基金经理和CFA持证分析师。请基于以下数据，运用五维投资分析框架，生成专业的投资决策分析报告。

## 输入数据

### 1. 公司基本信息
- 公司名称: {{companyName}}
- 股票代码: {{symbol}}
- 行业: {{sector}}
- 当前股价: {{currentPrice}}

### 2. 财务数据
- 最近财年收入: {{revenue}}
- 最近财年净利润: {{netIncome}}
- 最近财年EPS: {{eps}}
- ROE: {{roe}}%
- ROA: {{roa}}%
- 毛利率: {{grossMargin}}%
- 净利率: {{netMargin}}%
- 营收增长率(YoY): {{revenueGrowth}}%
- 净利润增长率(YoY): {{profitGrowth}}%
- 经营现金流: {{operatingCashFlow}}
- 自由现金流: {{freeCashFlow}}

### 3. 估值数据
- 当前P/E: {{peRatio}}
- 当前P/B: {{pbRatio}}
- 当前P/S: {{psRatio}}
- 行业平均P/E: {{industryAvgPE}}
- 历史P/E区间: {{historicalPERange}}

### 4. 行业对比数据
- 行业排名(ROE): {{roeRank}}/{{totalPeers}}
- 行业排名(增长率): {{growthRank}}/{{totalPeers}}
- 行业平均ROE: {{industryAvgROE}}%
- 行业平均增长率: {{industryAvgGrowth}}%

## 五维分析框架

### 维度1: 财务质量分析 (Financial Quality)

请分析:
1. ROE质量 (杜邦分析拆解)
   - 净利润率: {{netMargin}}% → 评估盈利能力
   - 资产周转率: {{assetTurnover}} → 评估运营效率
   - 权益乘数: {{equityMultiplier}} → 评估财务杠杆

2. 现金流健康度
   - 经营现金流/净利润比: {{ocfRatio}}
   - 自由现金流状况: {{fcfStatus}}

3. 财务风险评估
   - 负债水平: {{debtLevel}}
   - 利息覆盖倍数: {{interestCoverage}}

### 维度2: 成长性分析 (Growth Analysis)

请分析:
1. 历史增长轨迹
   - 3年营收CAGR: {{revenueCAGR3Y}}%
   - 3年利润CAGR: {{profitCAGR3Y}}%

2. 行业生命周期定位
   - 判断公司处于: 导入期/成长期/成熟期/衰退期
   - 依据: {{lifecycleEvidence}}

3. 增长质量
   - 内生增长 vs 并购增长
   - 市场份额变化趋势

### 维度3: 护城河分析 (Competitive Moat)

请分析:
1. 护城河类型识别
   - 品牌护城河: {{brandMoat}}
   - 成本优势: {{costAdvantage}}
   - 技术壁垒: {{techBarrier}}
   - 网络效应: {{networkEffect}}

2. 波特五力评估
   - 行业竞争强度: {{rivalryIntensity}}/10
   - 新进入者威胁: {{entryThreat}}/10
   - 替代品威胁: {{substituteThreat}}/10
   - 供应商议价能力: {{supplierPower}}/10
   - 客户议价能力: {{buyerPower}}/10

3. 竞争优势可持续性
   - 护城河宽度: 宽/窄/无
   - 护城河趋势: 加强/稳定/减弱

### 维度4: 估值分析 (Valuation Analysis)

请分析:
1. 绝对估值水平
   - 当前P/E {{peRatio}}x vs 历史均值 {{historicalAvgPE}}x
   - 当前P/E分位数: {{pePercentile}}%

2. 相对估值对比
   - vs 行业平均: {{vsIndustryPE}}
   - vs 历史区间: {{vsHistoricalPE}}

3. 估值合理性判断
   - 考虑增长率后的合理P/E: {{fairPE}}x
   - 基于DCF的隐含价值: {{dcfValue}}

### 维度5: 风险与催化剂 (Risks & Catalysts)

请识别:
1. 主要风险 (2-3条)
   - 市场风险: {{marketRisk}}
   - 业务风险: {{businessRisk}}
   - 财务风险: {{financialRisk}}

2. 关键催化剂 (2-3条)
   - 近期催化剂: {{nearTermCatalyst}}
   - 中期催化剂: {{mediumTermCatalyst}}

## 输出要求

请用以下JSON格式输出分析结果:

{
  "investmentRating": "buy", // strong_buy, buy, hold, sell, strong_sell
  "confidence": "high", // high, medium, low
  "targetPrice": {
    "low": 200.00,
    "high": 220.00
  },
  
  "financialQuality": {
    "score": 85, // 0-100
    "roeDuPont": {
      "netMargin": 25.5,
      "assetTurnover": 0.8,
      "equityMultiplier": 2.1,
      "analysis": "高净利润率驱动ROE，资产周转率适中，杠杆合理"
    },
    "cashFlowHealth": "healthy", // healthy, moderate, concerning
    "riskLevel": "low" // low, medium, high
  },
  
  "growth": {
    "stage": "maturity", // introduction, growth, maturity, decline
    "revenueCAGR3Y": 8.5,
    "profitCAGR3Y": 12.3,
    "quality": "high", // high, medium, low
    "outlook": "stable" // accelerating, stable, decelerating
  },
  
  "moat": {
    "primaryType": "brand", // brand, cost, technology, network, none
    "strength": "wide", // wide, narrow, none
    "porterScore": 72, // 0-100, 越高竞争地位越强
    "sustainability": "strong", // strong, moderate, weak
    "analysis": "强大的品牌护城河，客户粘性高，转换成本高"
  },
  
  "valuation": {
    "assessment": "fair", // undervalued, fair, overvalued
    "pePercentile": 65, // 当前P/E在历史区间的分位数
    "vsIndustry": "premium", // premium, discount, fair
    "fairPE": 28.5,
    "analysis": "估值处于历史中高位，但考虑到增长质量，估值合理"
  },
  
  "keyPoints": [
    "核心投资逻辑1: 强大的品牌护城河支撑定价能力",
    "核心投资逻辑2: 稳定的现金流和健康的资产负债表",
    "核心投资逻辑3: 持续的研发投入保持技术领先",
    "核心投资逻辑4: 服务业务增长提供新的增长点"
  ],
  
  "risks": [
    "风险1: 宏观经济下行可能影响消费电子需求",
    "风险2: 中国市场竞争加剧，本土品牌份额提升"
  ],
  
  "catalysts": [
    "催化剂1: 2025年1月财报发布，预期业绩稳健",
    "催化剂2: AI功能推出可能驱动换机周期"
  ],
  
  "summary": "公司具备强大的品牌护城河和稳定的现金流，虽然增速放缓但增长质量高。当前估值合理，建议买入并长期持有。",
  
  "investmentHorizon": "long" // short, medium, long
}

## 分析原则

1. **客观性**: 基于数据说话，不主观臆断
2. **一致性**: 各维度分析结论要相互印证
3. **前瞻性**: 不仅看历史，更要看未来趋势
4. **风险意识**: 充分揭示风险，不盲目乐观
5. **可操作性**: 给出明确的投资建议和目标价

请确保JSON格式正确，所有数值类型准确。分析要专业、深入、有洞察力。`;

// Prompt模板填充函数
export function fillPromptTemplate(
  template: string,
  data: Record<string, any>
): string {
  let filled = template;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    filled = filled.replace(placeholder, String(value ?? 'N/A'));
  }
  
  return filled;
}

// 生成分析数据的辅助函数
export function generateAnalysisData(
  company: any,
  valuation: any,
  earnings: any,
  benchmark: any
): Record<string, any> {
  return {
    companyName: company.name,
    symbol: company.symbol,
    sector: company.sector,
    currentPrice: valuation?.current_price || 'N/A',
    
    // 财务数据
    revenue: earnings?.revenue || 'N/A',
    netIncome: earnings?.net_income || 'N/A',
    eps: earnings?.eps || 'N/A',
    roe: valuation?.roe || 'N/A',
    roa: valuation?.roa || 'N/A',
    grossMargin: earnings?.gross_margin || 'N/A',
    netMargin: earnings?.net_margin || 'N/A',
    revenueGrowth: earnings?.revenue_yoy_growth || 'N/A',
    profitGrowth: earnings?.profit_yoy_growth || 'N/A',
    operatingCashFlow: earnings?.operating_cash_flow || 'N/A',
    freeCashFlow: valuation?.free_cash_flow || 'N/A',
    
    // 估值数据
    peRatio: valuation?.pe_ratio || 'N/A',
    pbRatio: valuation?.pb_ratio || 'N/A',
    psRatio: valuation?.ps_ratio || 'N/A',
    industryAvgPE: benchmark?.pe_avg || 'N/A',
    historicalPERange: `${valuation?.pe_min || 'N/A'}-${valuation?.pe_max || 'N/A'}`,
    
    // 行业对比
    roeRank: benchmark?.roe_rank || 'N/A',
    totalPeers: benchmark?.total_peers || 'N/A',
    growthRank: benchmark?.growth_rank || 'N/A',
    industryAvgROE: benchmark?.roe_avg || 'N/A',
    industryAvgGrowth: benchmark?.growth_avg || 'N/A',
    
    // 杜邦分析 (需要计算)
    assetTurnover: earnings?.asset_turnover || 'N/A',
    equityMultiplier: valuation?.equity_multiplier || 'N/A',
    
    // 现金流
    ocfRatio: earnings?.ocf_ratio || 'N/A',
    fcfStatus: valuation?.fcf_status || 'N/A',
    
    // 财务风险
    debtLevel: valuation?.debt_level || 'N/A',
    interestCoverage: valuation?.interest_coverage || 'N/A',
    
    // 增长数据
    revenueCAGR3Y: earnings?.revenue_cagr_3y || 'N/A',
    profitCAGR3Y: earnings?.profit_cagr_3y || 'N/A',
    lifecycleEvidence: '基于行业特征和增长趋势判断',
    
    // 护城河
    brandMoat: '强品牌认知度',
    costAdvantage: '规模经济带来的成本优势',
    techBarrier: '专利技术和研发能力',
    networkEffect: '生态系统锁定效应',
    
    // 波特五力 (默认值，实际需要分析)
    rivalryIntensity: 6,
    entryThreat: 4,
    substituteThreat: 5,
    supplierPower: 4,
    buyerPower: 5,
    
    // 估值
    historicalAvgPE: valuation?.historical_avg_pe || 'N/A',
    pePercentile: valuation?.pe_percentile || 'N/A',
    vsIndustryPE: valuation?.pe_ratio > benchmark?.pe_avg ? 'premium' : 'discount',
    vsHistoricalPE: valuation?.pe_ratio > valuation?.historical_avg_pe ? 'above_avg' : 'below_avg',
    fairPE: valuation?.fair_pe || 'N/A',
    dcfValue: valuation?.dcf_value || 'N/A',
    
    // 风险
    marketRisk: '宏观经济波动影响消费需求',
    businessRisk: '行业竞争加剧，创新压力增大',
    financialRisk: '汇率波动和利率风险',
    
    // 催化剂
    nearTermCatalyst: '即将发布的季度财报',
    mediumTermCatalyst: '新产品发布周期'
  };
}
