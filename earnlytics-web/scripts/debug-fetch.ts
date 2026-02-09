import { createClient } from '@supabase/supabase-js'

const fmpApiKey = process.env.FMP_API_KEY
const fmpApiUrl = process.env.FMP_API_URL || 'https://financialmodelingprep.com/api/v3'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== 调试信息 ===')
console.log('FMP_API_KEY:', fmpApiKey ? '已设置' : '未设置')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '已设置' : '未设置')

if (!fmpApiKey || !supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少必要的环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFetch() {
  // 1. 测试 Supabase 连接
  console.log('\n=== 测试 Supabase 连接 ===')
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .limit(3)
  
  if (companyError) {
    console.error('❌ 查询公司失败:', companyError.message)
    return
  }
  console.log('✅ Supabase 连接成功')
  console.log(`找到 ${companies.length} 家公司:`, companies.map(c => c.symbol).join(', '))

  // 2. 测试 FMP API
  console.log('\n=== 测试 FMP API ===')
  try {
    const url = `${fmpApiUrl}/income-statement/AAPL?apikey=${fmpApiKey}&limit=1`
    console.log('请求 URL:', url.replace(fmpApiKey, '***'))
    
    const response = await fetch(url)
    console.log('响应状态:', response.status)
    
    if (!response.ok) {
      console.error('❌ FMP API 请求失败')
      const text = await response.text()
      console.error('错误信息:', text)
      return
    }
    
    const data = await response.json()
    console.log('✅ FMP API 连接成功')
    console.log('返回数据条数:', data.length)
    
    if (data.length > 0) {
      console.log('示例数据:', JSON.stringify(data[0], null, 2))
    }
  } catch (error) {
    console.error('❌ FMP API 调用失败:', error)
    return
  }

  // 3. 检查 earnings 表
  console.log('\n=== 检查 earnings 表 ===')
  const { data: earnings, error: earningsError } = await supabase
    .from('earnings')
    .select('*')
    .limit(5)
  
  if (earningsError) {
    console.error('❌ 查询 earnings 失败:', earningsError.message)
    return
  }
  
  console.log(`当前 earnings 表中有 ${earnings.length} 条记录`)
  
  if (earnings.length === 0) {
    console.log('⚠️ earnings 表为空，需要插入数据')
    
    // 4. 尝试插入一条测试数据
    console.log('\n=== 尝试插入测试数据 ===')
    const { data: aapl } = await supabase
      .from('companies')
      .select('id')
      .eq('symbol', 'AAPL')
      .single()
    
    if (aapl) {
      const { error: insertError } = await supabase
        .from('earnings')
        .upsert({
          company_id: aapl.id,
          fiscal_year: 2024,
          fiscal_quarter: 4,
          report_date: '2024-10-30',
          revenue: 94930000000,
          net_income: 14730000000,
          eps: 1.64,
          eps_estimate: 1.60,
          eps_surprise: 0.04,
          is_analyzed: false
        }, {
          onConflict: 'company_id,fiscal_year,fiscal_quarter'
        })
      
      if (insertError) {
        console.error('❌ 插入失败:', insertError.message)
      } else {
        console.log('✅ 测试数据插入成功')
      }
    }
  } else {
    console.log('✅ earnings 表已有数据')
    console.log('示例:', earnings[0])
  }
}

debugFetch().catch(console.error)
