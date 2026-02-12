import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/alerts - Get user's alert rules and history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'rules'
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (type === 'rules') {
      // Get alert rules
      const { data: rules, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        rules: rules || [],
      })
    } else if (type === 'history') {
      // Get alert history
      const { data: history, error } = await supabase
        .from('alert_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        history: history || [],
      })
    } else if (type === 'preferences') {
      // Get notification preferences
      const { data: prefs, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return NextResponse.json({
        success: true,
        preferences: prefs || {
          emailEnabled: true,
          pushEnabled: false,
          digestFrequency: 'immediate',
          alertTypes: {
            rating_change: true,
            target_price: true,
            valuation_anomaly: true,
            earnings_date: true,
            price_threshold: false,
          },
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get alerts error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to get alerts', details: message },
      { status: 500 }
    )
  }
}

// POST /api/alerts - Create new alert rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      symbol,
      ruleType,
      conditions,
      notificationChannels,
      name,
      description,
    } = body

    if (!userId || !ruleType) {
      return NextResponse.json(
        { error: 'User ID and rule type are required' },
        { status: 400 }
      )
    }

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .insert({
        user_id: userId,
        symbol,
        rule_type: ruleType,
        conditions: conditions || {},
        notification_channels: notificationChannels || ['email'],
        name,
        description,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      rule,
    })
  } catch (error) {
    console.error('Create alert error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create alert', details: message },
      { status: 500 }
    )
  }
}

// PATCH /api/alerts - Update alert rule
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ruleId, isActive, ...updates } = body

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .update({
        is_active: isActive,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ruleId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      rule,
    })
  } catch (error) {
    console.error('Update alert error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update alert', details: message },
      { status: 500 }
    )
  }
}

// DELETE /api/alerts - Delete alert rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('alert_rules')
      .delete()
      .eq('id', ruleId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Alert rule deleted',
    })
  } catch (error) {
    console.error('Delete alert error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete alert', details: message },
      { status: 500 }
    )
  }
}
