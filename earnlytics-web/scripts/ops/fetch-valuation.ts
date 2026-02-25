import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

// 30家科技公司列表
const COMPANIES = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'NVDA', 'TSLA', 'NFLX', 'AMD', 'CRM',
  'AVGO', 'ORCL', 'ADBE', 'IBM', 'INTC',
  'QCOM', 'TXN', 'NOW', 'PANW', 'PLTR',
  'SNOW', 'CRWD', 'DDOG', 'NET', 'MDB',
  'ZS', 'OKTA', 'DOCU', 'ROKU', 'UBER'
]

// 估值数据接口
interface ValuationData {
  symbol: string
  company_id?: number
  market_cap: number | null
  pe_ratio: number | null
  pb_ratio: number | null
  ps_ratio: number | null
  ev_ebitda: number | null
  roe: number | null
  roa: number | null
  debt_to_equity: number | null
  free_cash_flow: number | null
}

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not configured')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * 使用Yahoo Finance API获取估值数据
 * 注意：这里使用简单的HTTP请求，如果需要更稳定可以使用 yahoo-finance2 包
 */
async function fetchValuationFromYahoo(symbol: string): Promise<ValuationData> {
  try {
    // Yahoo Finance API endpoint
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,financialData,defaultKeyStatistics`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const result = data.quoteSummary?.result?.[0]

    if (!result) {
      throw new Error('No data found')
    }

    const summary = result.summaryDetail || {}
    const financial = result.financialData || {}
    const stats = result.defaultKeyStatistics || {}

    return {
      symbol,
      market_cap: summary.marketCap?.raw || null,
      pe_ratio: summary.trailingPE?.raw || null,
      pb_ratio: summary.priceToBook?.raw || null,
      ps_ratio: summary.priceToSalesTrailing12Months?.raw || null,
      ev_ebitda: summary.enterpriseToEbitda?.raw || null,
      roe: financial.returnOnEquity?.raw ? financial.returnOnEquity.raw * 100 : null,
      roa: financial.returnOnAssets?.raw ? financial.returnOnAssets.raw * 100 : null,
      debt_to_equity: stats.debtToEquity?.raw || null,
      free_cash_flow: financial.freeCashflow?.raw || null
    }
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}:`, error)
    return {
      symbol,
      market_cap: null,
      pe_ratio: null,
      pb_ratio: null,
      ps_ratio: null,
      ev_ebitda: null,
      roe: null,
      roa: null,
      debt_to_equity: null,
      free_cash_flow: null
    }
  }
}

/**
 * 从数据库获取公司ID
 */
async function getCompanyId(symbol: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()

  if (error || !data) {
    console.warn(`⚠️ Company not found: ${symbol}`)
    return null
  }

  return data.id
}

/**
 * 保存估值数据到数据库
 */
async function saveValuation(data: ValuationData): Promise<boolean> {
  try {
    const companyId = await getCompanyId(data.symbol)
    
    if (!companyId) {
      console.warn(`⚠️ Skipping ${data.symbol}: company not in database`)
      return false
    }

    const { error } = await supabase
      .from('company_valuation')
      .upsert({
        company_id: companyId,
        market_cap: data.market_cap,
        pe_ratio: data.pe_ratio,
        pb_ratio: data.pb_ratio,
        ps_ratio: data.ps_ratio,
        ev_ebitda: data.ev_ebitda,
        roe: data.roe,
        roa: data.roa,
        debt_to_equity: data.debt_to_equity,
        free_cash_flow: data.free_cash_flow,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id'
      })

    if (error) {
      console.error(`❌ Error saving ${data.symbol}:`, error)
      return false
    }

    console.log(`✅ Saved valuation for ${data.symbol}`)
    return true
  } catch (error) {
    console.error(`❌ Error saving ${data.symbol}:`, error)
    return false
  }
}

/**
 * 主函数：批量获取并保存估值数据
 */
async function main() {
  console.log('🚀 Starting valuation data sync...')
  console.log(`📊 Companies to process: ${COMPANIES.length}`)
  console.log('')

  let successCount = 0
  let failCount = 0
  const errors: string[] = []

  // 顺序处理以避免API限流
  for (let i = 0; i < COMPANIES.length; i++) {
    const symbol = COMPANIES[i]
    console.log(`[${i + 1}/${COMPANIES.length}] Processing ${symbol}...`)

    try {
      // 获取估值数据
      const valuation = await fetchValuationFromYahoo(symbol)
      
      // 延迟以避免限流
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 保存到数据库
      const saved = await saveValuation(valuation)
      
      if (saved) {
        successCount++
        console.log(`   P/E: ${valuation.pe_ratio?.toFixed(2) || 'N/A'} | Market Cap: ${valuation.market_cap ? (valuation.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}`)
      } else {
        failCount++
        errors.push(`${symbol}: Failed to save`)
      }
    } catch (error) {
      failCount++
      const errorMsg = `${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(`   ❌ ${errorMsg}`)
    }
  }

  console.log('')
  console.log('📊 Sync Summary:')
  console.log(`   ✅ Success: ${successCount}/${COMPANIES.length}`)
  console.log(`   ❌ Failed: ${failCount}/${COMPANIES.length}`)
  
  if (errors.length > 0) {
    console.log('')
    console.log('⚠️ Errors:')
    errors.forEach(err => console.log(`   - ${err}`))
  }

  console.log('')
  console.log('✨ Valuation sync completed!')
  process.exit(failCount > 0 ? 1 : 0)
}

// 运行主函数
main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
