// SEC EDGAR CIK映射表
// CIK需要是10位数字，不足前面补0

export const COMPANY_CIK_MAP: Record<string, { cik: string; name: string }> = {
  // Tier 1
  'AAPL': { cik: '0000320193', name: 'Apple Inc.' },
  'MSFT': { cik: '0000789019', name: 'Microsoft Corporation' },
  'GOOGL': { cik: '0001652044', name: 'Alphabet Inc.' },
  'AMZN': { cik: '0001018724', name: 'Amazon.com Inc.' },
  'NVDA': { cik: '0001045810', name: 'NVIDIA Corporation' },
  'META': { cik: '0001326801', name: 'Meta Platforms Inc.' },
  'TSLA': { cik: '0001318605', name: 'Tesla Inc.' },
  'AMD': { cik: '0000002488', name: 'Advanced Micro Devices' },
  'NFLX': { cik: '0001065280', name: 'Netflix Inc.' },
  'CRM': { cik: '0001108524', name: 'Salesforce Inc.' },
  
  // Tier 2
  'AVGO': { cik: '0001730168', name: 'Broadcom Inc.' },
  'ORCL': { cik: '0001341439', name: 'Oracle Corporation' },
  'ADBE': { cik: '0000796343', name: 'Adobe Inc.' },
  'IBM': { cik: '0000051143', name: 'International Business Machines' },
  'INTC': { cik: '0000050813', name: 'Intel Corporation' },
  'QCOM': { cik: '0000804328', name: 'Qualcomm Inc.' },
  'TXN': { cik: '0000097476', name: 'Texas Instruments' },
  'NOW': { cik: '0001375580', name: 'ServiceNow Inc.' },
  'PANW': { cik: '0001327567', name: 'Palo Alto Networks' },
  'PLTR': { cik: '0001321655', name: 'Palantir Technologies' },
  
  // Tier 3
  'SNOW': { cik: '0001640147', name: 'Snowflake Inc.' },
  'CRWD': { cik: '0001681893', name: 'CrowdStrike Holdings' },
  'DDOG': { cik: '0001561550', name: 'Datadog Inc.' },
  'NET': { cik: '0001705712', name: 'Cloudflare Inc.' },
  'MDB': { cik: '0001453811', name: 'MongoDB Inc.' },
  'ZS': { cik: '0001562800', name: 'Zscaler Inc.' },
  'OKTA': { cik: '0001516517', name: 'Okta Inc.' },
  'DOCU': { cik: '0001636280', name: 'DocuSign Inc.' },
  'ROKU': { cik: '0001430588', name: 'Roku Inc.' },
  'UBER': { cik: '0001543151', name: 'Uber Technologies' },
}

export function getCIK(symbol: string): string | null {
  return COMPANY_CIK_MAP[symbol]?.cik || null
}

export function getCompanyName(symbol: string): string | null {
  return COMPANY_CIK_MAP[symbol]?.name || null
}

export function formatCIK(cik: string): string {
  // 确保CIK是10位数字
  return cik.padStart(10, '0')
}
