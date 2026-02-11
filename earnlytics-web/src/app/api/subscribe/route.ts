import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 检查是否已订阅
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: '该邮箱已订阅' },
          { status: 400 }
        )
      } else {
        // 重新激活订阅
        await supabase
          .from('subscribers')
          .update({ is_active: true })
          .eq('id', existing.id)
        
        return NextResponse.json({ 
          message: '订阅已重新激活',
          success: true 
        })
      }
    }

    // 添加新订阅
    const { error } = await supabase
      .from('subscribers')
      .insert({ email })

    if (error) {
      console.error('Subscription error:', error)
      return NextResponse.json(
        { error: '订阅失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '订阅成功！',
      success: true
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
