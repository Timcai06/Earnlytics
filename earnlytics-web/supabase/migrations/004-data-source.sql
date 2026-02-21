-- ============================================
-- Earnlytics Database Schema Update
-- Day 14b: Add data source field
-- ============================================

-- 添加数据来源字段到 earnings 表
ALTER TABLE earnings ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) DEFAULT 'fmp';

-- 添加数据来源说明:
-- 'fmp' - Financial Modeling Prep API (实时数据)
-- 'sec' - SEC EDGAR (官方财报)
-- 'sample' - 样本/补充数据

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_earnings_data_source ON earnings(data_source);

-- 更新注释
COMMENT ON COLUMN earnings.data_source IS '数据来源: fmp=Financial Modeling Prep, sec=SEC EDGAR, sample=样本数据';
