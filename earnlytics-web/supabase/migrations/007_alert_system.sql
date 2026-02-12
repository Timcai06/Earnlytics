-- Migration: Smart Alert System Schema
-- Phase 6: Week 8 - Smart Alert System Infrastructure

-- Alert rules table
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert configuration
  symbol TEXT, -- NULL for portfolio-wide alerts
  rule_type TEXT NOT NULL CHECK (rule_type IN ('rating_change', 'target_price', 'valuation_anomaly', 'earnings_date', 'price_threshold')),
  
  -- Rule conditions (JSONB for flexibility)
  conditions JSONB NOT NULL DEFAULT '{}',
  -- Example conditions:
  -- { "threshold": 10, "direction": "up", "comparisonType": "percentage" }
  -- { "previousRating": "hold", "newRating": "buy" }
  
  -- Notification preferences
  notification_channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
  -- Valid values: 'email', 'push'
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  
  -- Metadata
  name TEXT, -- Custom rule name
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active rules lookup
CREATE INDEX idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_alert_rules_user ON alert_rules(user_id, is_active);
CREATE INDEX idx_alert_rules_symbol ON alert_rules(symbol) WHERE symbol IS NOT NULL;
CREATE INDEX idx_alert_rules_type ON alert_rules(rule_type, is_active);

-- Alert history table
CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert content
  symbol TEXT,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Alert data (structured)
  data JSONB DEFAULT '{}',
  -- Example: { "previousRating": "hold", "newRating": "buy", "change": 15.5 }
  
  -- Status
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Notification tracking
  sent_via TEXT[], -- Which channels were used
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for alert history queries
CREATE INDEX idx_alert_history_user ON alert_history(user_id, created_at DESC);
CREATE INDEX idx_alert_history_unread ON alert_history(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_alert_history_rule ON alert_history(rule_id, created_at DESC);
CREATE INDEX idx_alert_history_symbol ON alert_history(symbol, created_at DESC);

-- User notification preferences
CREATE TABLE user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  
  -- Digest settings
  digest_frequency TEXT DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
  digest_day INTEGER DEFAULT 1 CHECK (digest_day BETWEEN 0 AND 6), -- 0=Sunday for weekly
  digest_time TIME DEFAULT '09:00:00',
  
  -- Alert type preferences
  alert_types JSONB DEFAULT '{
    "rating_change": true,
    "target_price": true,
    "valuation_anomaly": true,
    "earnings_date": true,
    "price_threshold": false
  }',
  
  -- Quiet hours
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email queue for batch processing
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- Email content
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  
  -- Tracking
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Related alert
  alert_id UUID REFERENCES alert_history(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email queue processing
CREATE INDEX idx_email_queue_pending ON email_queue(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_email_queue_user ON email_queue(user_id, created_at DESC);

-- Alert templates for common scenarios
CREATE TABLE alert_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template metadata
  rule_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  title_template TEXT NOT NULL, -- "{{symbol}} 评级上调至 {{newRating}}"
  message_template TEXT NOT NULL,
  
  -- Default conditions
  default_conditions JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default alert templates
INSERT INTO alert_templates (rule_type, name, description, title_template, message_template, default_conditions) VALUES
(
  'rating_change',
  '评级变化提醒',
  '当分析师评级发生变化时通知',
  '{{symbol}} 分析师评级{{changeDirection}}至 {{newRating}}',
  '{{symbol}} 的分析师共识评级从 {{previousRating}} 调整为 {{newRating}}。\n\n这一变化可能影响投资决策，建议查看最新分析报告。',
  '{"priority": "high"}'
),
(
  'target_price',
  '目标价大幅调整',
  '当目标价调整超过10%时通知',
  '{{symbol}} 目标价{{changeDirection}} {{changePercentage}}%',
  '{{symbol}} 的分析师共识目标价从 ${{previousPrice}} 调整为 ${{newPrice}}（{{changeDirection}} {{changePercentage}}%）。\n\n当前股价: ${{currentPrice}}\n潜在空间: {{upside}}%',
  '{"threshold": 10, "comparisonType": "percentage", "priority": "high"}'
),
(
  'valuation_anomaly',
  '估值异常提醒',
  '当估值突破历史区间时通知',
  '{{symbol}} 估值处于历史{{percentile}}%分位',
  '{{symbol}} 的 {{metric}} 目前为 {{currentValue}}，处于历史 {{lookbackPeriod}} 的 {{percentile}}% 分位。\n\n这可能表示估值{{assessment}}，建议关注。',
  '{"metric": "pe_ratio", "percentile": 95, "lookbackPeriod": "5年", "priority": "medium"}'
),
(
  'earnings_date',
  '财报发布提醒',
  '财报发布前3天提醒',
  '{{symbol}} 即将发布财报',
  '{{symbol}} 将在 {{days}} 天后发布 {{quarter}} 财报（{{date}}）。\n\n市场预期:\n- EPS: ${{expectedEPS}}\n- 营收: ${{expectedRevenue}}B\n\n历史财报表现和AI分析已就绪，可提前查看。',
  '{"daysBefore": 3, "priority": "medium"}'
),
(
  'price_threshold',
  '价格阈值提醒',
  '当价格达到设定阈值时通知',
  '{{symbol}} 股价{{condition}} ${{threshold}}',
  '{{symbol}} 当前股价 ${{currentPrice}} 已{{condition}}您设定的阈值 ${{threshold}}。\n\n目标达成！建议查看最新分析以决定后续操作。',
  '{"priority": "low"}'
);

-- Trigger to update updated_at
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_templates_updated_at
  BEFORE UPDATE ON alert_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create alert from rule trigger
CREATE OR REPLACE FUNCTION create_alert_from_rule(
  p_rule_id UUID,
  p_symbol TEXT,
  p_alert_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
  v_user_id UUID;
BEGIN
  -- Get user_id from rule
  SELECT user_id INTO v_user_id
  FROM alert_rules
  WHERE id = p_rule_id;

  -- Create alert
  INSERT INTO alert_history (
    rule_id,
    user_id,
    symbol,
    alert_type,
    title,
    message,
    data,
    priority
  ) VALUES (
    p_rule_id,
    v_user_id,
    p_symbol,
    p_alert_type,
    p_title,
    p_message,
    p_data,
    p_priority
  )
  RETURNING id INTO v_alert_id;

  -- Update rule last_triggered and count
  UPDATE alert_rules
  SET 
    last_triggered_at = NOW(),
    trigger_count = trigger_count + 1
  WHERE id = p_rule_id;

  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark alert as read
CREATE OR REPLACE FUNCTION mark_alert_read(p_alert_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE alert_history
  SET 
    is_read = true,
    read_at = NOW()
  WHERE id = p_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread alert count for user
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM alert_history
  WHERE user_id = p_user_id AND is_read = false;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE alert_rules IS 'User-defined alert rules for investment notifications';
COMMENT ON TABLE alert_history IS 'Historical record of triggered alerts';
COMMENT ON TABLE user_notification_preferences IS 'User notification settings and preferences';
COMMENT ON TABLE email_queue IS 'Queue for batch email processing';
COMMENT ON TABLE alert_templates IS 'Templates for common alert types';

-- RLS policies
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own rules
CREATE POLICY user_alert_rules ON alert_rules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can only see their own alerts
CREATE POLICY user_alert_history ON alert_history
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can only manage their own preferences
CREATE POLICY user_notification_prefs ON user_notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can only see their own emails
CREATE POLICY user_email_queue ON email_queue
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON alert_rules TO service_role;
GRANT ALL ON alert_history TO service_role;
GRANT ALL ON user_notification_preferences TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON alert_templates TO service_role;
GRANT EXECUTE ON FUNCTION create_alert_from_rule TO service_role;
GRANT EXECUTE ON FUNCTION mark_alert_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_alert_count TO authenticated;
