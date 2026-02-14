import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// SEC EDGAR API配置
const SEC_API_BASE = 'https://data.sec.gov';
const SEC_ARCHIVE_BASE = 'https://www.sec.gov/Archives/edgar/data';

// CIK映射 (需要扩展)
const CIK_MAP: Record<string, string> = {
  'AAPL': '0000320193',
  'MSFT': '0000789019',
  'GOOGL': '0001652044',
  'AMZN': '0001018724',
  'META': '0001326801',
  'NVDA': '0001014128',
  'TSLA': '0001318605',
  'NFLX': '0001065280',
  'AMD': '0000002488',
  'CRM': '0001108524',
  // TODO: 添加其他20家公司
};

interface FilingDocument {
  cik: string;
  symbol: string;
  formType: '10-K' | '10-Q';
  filingDate: string;
  accessionNumber: string;
  primaryDocument: string;
  description: string;
}

interface ParsedDocument {
  source: 'sec_edgar';
  documentType: '10-K' | '10-Q';
  filingDate: string;
  content: {
    financialHighlights: string;
    mdAndA: string;
    riskFactors: string[];
    guidance?: string;
  };
  rawHtmlUrl: string;
  rawText: string;
}

/**
 * 获取公司的CIK
 */
export function getCIK(symbol: string): string | null {
  return CIK_MAP[symbol.toUpperCase()] || null;
}

/**
 * 获取最新的filing列表
 */
export async function getRecentFilings(
  symbol: string, 
  formType: '10-K' | '10-Q'
): Promise<FilingDocument[]> {
  const cik = getCIK(symbol);
  if (!cik) {
    throw new Error(`CIK not found for ${symbol}`);
  }

  const url = `${SEC_API_BASE}/submissions/CIK${cik}.json`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Earnlytics (contact@earnlytics.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const data = await response.json();
    const filings = data.filings?.recent || {};
    
    const results: FilingDocument[] = [];
    
    // 遍历最近的filings
    for (let i = 0; i < filings.accessionNumber?.length || 0; i++) {
      if (filings.form[i] === formType) {
        results.push({
          cik,
          symbol: symbol.toUpperCase(),
          formType,
          filingDate: filings.filingDate[i],
          accessionNumber: filings.accessionNumber[i].replace(/-/g, ''),
          primaryDocument: filings.primaryDocument[i],
          description: filings.primaryDocDescription?.[i] || ''
        });
        
        // 只取最新的一份
        if (results.length >= 1) break;
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error fetching filings for ${symbol}:`, error);
    return [];
  }
}

/**
 * 获取具体文件内容
 */
export async function fetchFilingDocument(
  filing: FilingDocument
): Promise<string | null> {
  const url = `${SEC_ARCHIVE_BASE}/${filing.cik}/${filing.accessionNumber}/${filing.primaryDocument}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Earnlytics (contact@earnlytics.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching document:`, error);
    return null;
  }
}

export function extractMDAndA(html: string): string {
  const patterns = [
    /Item\s*7[.\s]+Management.*?s[\s\S]*?Discussion[\s\S]*?Analysis[\s\S]*?(?:Item\s*8|ITEM\s*8)/i,
    /Item\s*7[.\s]+Management[\s\S]*?Discussion[\s\S]*?Analysis[\s\S]*?(?:Item\s*7A|ITEM\s*7A)/i,
    /<a[^>]*>Item\s*7<\/a>[\s\S]*?(?:<a[^>]*>Item\s*8<\/a>|<a[^>]*>ITEM\s*8<\/a>)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const cleaned = cleanHtmlText(match[0]);
      if (cleaned.length > 200) {
        return cleaned;
      }
    }
  }

  const textContent = cleanHtmlText(html);
  const mdAndAIndex = textContent.search(/Management.*?s\s+Discussion\s+and\s+Analysis/i);
  if (mdAndAIndex !== -1) {
    const start = Math.max(0, mdAndAIndex - 100);
    const end = Math.min(textContent.length, mdAndAIndex + 8000);
    return textContent.substring(start, end);
  }

  return '';
}

export function extractRiskFactors(html: string): string[] {
  const patterns = [
    /Item\s*1A[.\s]+Risk\s*Factors[\s\S]*?(?:Item\s*1B|ITEM\s*1B|Item\s*2|ITEM\s*2)/i,
    /<a[^>]*>Item\s*1A<\/a>[\s\S]*?(?:<a[^>]*>Item\s*1B<\/a>|<a[^>]*>Item\s*2<\/a>)/i,
  ];

  for (const pattern of patterns) {
    const riskMatch = html.match(pattern);
    if (riskMatch) {
      const riskSection = cleanHtmlText(riskMatch[0]);
      const riskItems = riskSection
        .split(/\n\s*\n|\r?\n\s*[-•]\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 30 && item.length < 1000)
        .slice(0, 8);

      if (riskItems.length > 0) {
        return riskItems;
      }
    }
  }

  const textContent = cleanHtmlText(html);
  const riskIndex = textContent.search(/Risk\s*Factors/i);
  if (riskIndex !== -1) {
    const start = Math.max(0, riskIndex);
    const end = Math.min(textContent.length, riskIndex + 5000);
    const section = textContent.substring(start, end);
    const paragraphs = section
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 50 && p.length < 800)
      .slice(0, 5);
    return paragraphs;
  }

  return [];
}

/**
 * 清理HTML文本
 */
function cleanHtmlText(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 解析完整的document
 */
export async function parseFilingDocument(
  html: string,
  filing: FilingDocument
): Promise<ParsedDocument> {
  const mdAndA = extractMDAndA(html);
  const riskFactors = extractRiskFactors(html);
  
  // 提取财务亮点 (简化版)
  const financialHighlights = extractFinancialHighlights(html);
  
  const rawHtmlUrl = `${SEC_ARCHIVE_BASE}/${filing.cik}/${filing.accessionNumber}/${filing.primaryDocument}`;
  
  return {
    source: 'sec_edgar',
    documentType: filing.formType,
    filingDate: filing.filingDate,
    content: {
      financialHighlights,
      mdAndA: mdAndA.substring(0, 5000), // 限制长度
      riskFactors,
      guidance: extractGuidance(html)
    },
    rawHtmlUrl,
    rawText: cleanHtmlText(html).substring(0, 10000) // 限制长度
  };
}

/**
 * 提取财务亮点
 */
function extractFinancialHighlights(html: string): string {
  // 查找财务数据表格附近的内容
  const financialMatch = html.match(/SELECTED\s+FINANCIAL\s+DATA([\s\S]*?)(Item|ITEM)/i);
  if (financialMatch) {
    return cleanHtmlText(financialMatch[1]).substring(0, 2000);
  }
  return '';
}

/**
 * 提取业绩指引
 */
function extractGuidance(html: string): string | undefined {
  const guidanceMatch = html.match(/guidance|outlook|forecast([\s\S]*?)(Item|ITEM)/i);
  if (guidanceMatch) {
    return cleanHtmlText(guidanceMatch[0]).substring(0, 1000);
  }
  return undefined;
}

/**
 * 主函数：获取并解析最新的财报
 */
export async function fetchLatestFiling(
  symbol: string,
  formType: '10-K' | '10-Q'
): Promise<ParsedDocument | null> {
  try {
    console.log(`📄 Fetching ${formType} for ${symbol}...`);
    
    // 1. 获取filing列表
    const filings = await getRecentFilings(symbol, formType);
    if (filings.length === 0) {
      console.warn(`No ${formType} filings found for ${symbol}`);
      return null;
    }
    
    const latestFiling = filings[0];
    console.log(`✅ Found filing: ${latestFiling.filingDate}`);
    
    // 2. 获取文件内容
    const html = await fetchFilingDocument(latestFiling);
    if (!html) {
      console.error(`Failed to fetch document content`);
      return null;
    }
    
    // 3. 解析内容
    const parsed = await parseFilingDocument(html, latestFiling);
    console.log(`✅ Parsed document successfully`);
    
    return parsed;
  } catch (error) {
    console.error(`Error fetching latest filing for ${symbol}:`, error);
    return null;
  }
}
