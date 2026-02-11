-- ============================================
-- Earnlytics Database Schema
-- Plan 3 Week 5: Tier 2 Companies
-- ============================================

-- 插入10家Tier 2科技公司
INSERT INTO companies (symbol, name, sector, logo_url) VALUES
  ('AVGO', 'Broadcom Inc.', '芯片', 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Broadcom_Ltd._logo.svg'),
  ('ORCL', 'Oracle Corporation', '软件', 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg'),
  ('ADBE', 'Adobe Inc.', '软件', 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg'),
  ('IBM', 'International Business Machines', '企业服务', 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'),
  ('INTC', 'Intel Corporation', '芯片', 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg'),
  ('QCOM', 'Qualcomm Inc.', '芯片', 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Qualcomm_logo.svg'),
  ('TXN', 'Texas Instruments', '芯片', 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Texas_Instruments_logo.svg'),
  ('NOW', 'ServiceNow Inc.', '软件', 'https://upload.wikimedia.org/wikipedia/commons/5/5b/ServiceNow_logo.svg'),
  ('PANW', 'Palo Alto Networks', '网络安全', 'https://upload.wikimedia.org/wikipedia/commons/5/50/Palo_Alto_Networks_logo.svg'),
  ('PLTR', 'Palantir Technologies', '数据分析', 'https://upload.wikimedia.org/wikipedia/commons/3/37/Palantir_Technologies_logo.svg')
ON CONFLICT (symbol) DO NOTHING;
