import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

// 行业分类定义
const SECTORS = [
  { name: '半导体', symbols: ['NVDA', 'AMD', 'INTC', 'QCOM', 'TXN', 'AVGO'] },
  { name: '软件服务', symbols: ['MSFT', 'ORCL', 'ADBE', 'CRM', 'NOW'] },
  { name: '互联网', symbols: ['GOOGL', 'META', 'AMZN', 'NFLX'] },
  { name: '消费电子', symbols: ['AAPL'] },
  { name: '电动车', symbols: ['TSLA'] },
  { name: '云计算', symbols: ['MSFT', 'AMZN', 'GOOGL', 'CRM', 'NOW'] },
  { name: '网络安全', symbols: ['PANW', 'CRWD', 'ZS', 'NET', 'OKTA'] },
  { name: '数据服务', symbols: ['SNOW', 'PLTR', 'DDOG', 'MDB'] }
]

// 需要计算的指标
const METRICS = ['pe_ratio', 'pb_ratio', 'ps_ratio', 'roe', 'roa']

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not configured')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface IndustryBenchmarkRow {
  sector: string
  metric_name: string
  avg_value: number
  median_value: number
}

/**
 * 计算数组的平均值
 */
function calculateAverage(values: number[]): number | null {
  const validValues = values.filter(v => v !== null && !isNaN(v))
  if (validValues.length === 0) return null
  return validValues.reduce((a, b) => a + b, 0) / validValues.length
}

/**
 * 计算数组的中位数
 */
function calculateMedian(values: number[]): number | null {
  const validValues = values.filter(v => v !== null && !isNaN(v)).sort((a, b) => a - b)
  if (validValues.length === 0) return null
  
  const mid = Math.floor(validValues.length / 2)
  if (validValues.length % 2 === 0) {
    return (validValues[mid - 1] + validValues[mid]) / 2
  }
  return validValues[mid]
}

/**
 * 获取指定公司的估值数据
 */
async function getCompanyValuation(symbol: string) {
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('symbol', symbol)
    .single()

  if (companyError || !company) {
    return null
  }

  const { data: valuation, error: valuationError } = await supabase
    .from('company_valuation')
    .select('pe_ratio, pb_ratio, ps_ratio, roe, roa')
    .eq('company_id', company.id)
    .single()

  if (valuationError || !valuation) {
    return null
  }

  return valuation
}

/**
 * 计算行业基准数据
 */
async function calculateSectorBenchmark(sectorName: string, symbols: string[]) {
  console.log(`\n📊 Processing sector: ${sectorName}`)
  console.log(`   Companies: ${symbols.join(', ')}`)

  // 收集所有公司的估值数据
  const valuations = []
  for (const symbol of symbols) {
    const valuation = await getCompanyValuation(symbol)
    if (valuation) {
      valuations.push(valuation)
    } else {
      console.warn(`   ⚠️ No valuation data for ${symbol}`)
    }
  }

  if (valuations.length === 0) {
    console.warn(`   ⚠️ No data available for sector ${sectorName}`)
    return []
  }

  console.log(`   ✅ Found ${valuations.length} companies with data`)

  // 计算各指标的平均值和中位数
  const benchmarks = []
  
  for (const metric of METRICS) {
    const values = valuations.map(v => v[metric as keyof typeof v] as number).filter(v => v !== null)
    
    if (values.length === 0) {
      console.warn(`   ⚠️ No ${metric} data available`)
      continue
    }

    const avg = calculateAverage(values)
    const median = calculateMedian(values)

    if (avg !== null && median !== null) {
      benchmarks.push({
        sector: sectorName,
        metric_name: metric,
        avg_value: parseFloat(avg.toFixed(2)),
        median_value: parseFloat(median.toFixed(2))
      })
      
      console.log(`   ${metric}: Avg=${avg.toFixed(2)}, Median=${median.toFixed(2)}`)
    }
  }

  return benchmarks
}

/**
 * 保存行业基准到数据库
 */
async function saveBenchmarks(benchmarks: IndustryBenchmarkRow[]): Promise<number> {
  if (benchmarks.length === 0) return 0

  let savedCount = 0

  for (const benchmark of benchmarks) {
    const { error } = await supabase
      .from('industry_benchmarks')
      .upsert(benchmark, {
        onConflict: 'sector,metric_name'
      })

    if (error) {
      console.error(`❌ Error saving benchmark:`, error)
    } else {
      savedCount++
    }
  }

  return savedCount
}

/**
 * 主函数：构建所有行业基准
 */
async function main() {
  console.log('🚀 Starting industry benchmark build...')
  console.log(`📊 Sectors to process: ${SECTORS.length}`)
  console.log(`📈 Metrics to calculate: ${METRICS.join(', ')}`)
  console.log('')

  let totalBenchmarks = 0
  const errors: string[] = []

  // 处理每个行业
  for (const sector of SECTORS) {
    try {
      const benchmarks = await calculateSectorBenchmark(sector.name, sector.symbols)
      
      if (benchmarks.length > 0) {
        const saved = await saveBenchmarks(benchmarks)
        totalBenchmarks += saved
        console.log(`   ✅ Saved ${saved} benchmarks`)
      }
    } catch (error) {
      const errorMsg = `${sector.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(`   ❌ ${errorMsg}`)
    }
  }

  console.log('')
  console.log('📊 Build Summary:')
  console.log(`   ✅ Total benchmarks saved: ${totalBenchmarks}`)
  console.log(`   📊 Sectors processed: ${SECTORS.length}`)
  
  if (errors.length > 0) {
    console.log('')
    console.log('⚠️ Errors:')
    errors.forEach(err => console.log(`   - ${err}`))
  }

  console.log('')
  console.log('✨ Industry benchmark build completed!')
  console.log('')
  console.log('💡 Next steps:')
  console.log('   - Run this script weekly to update benchmarks')
  console.log('   - Check industry_benchmarks table for results')
  
  process.exit(errors.length > 0 ? 1 : 0)
}

// 运行主函数
main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
