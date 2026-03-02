-- Return the latest stock price row for each symbol in one query.
CREATE OR REPLACE FUNCTION get_latest_stock_prices(symbols_input TEXT[])
RETURNS TABLE (
  symbol VARCHAR(10),
  price DECIMAL(10, 2),
  change DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL(8, 2),
  high_52w DECIMAL(10, 2),
  low_52w DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
AS $$
  SELECT DISTINCT ON (sp.symbol)
    sp.symbol,
    sp.price,
    sp.change,
    sp.change_percent,
    sp.volume,
    sp.market_cap,
    sp.pe_ratio,
    sp.high_52w,
    sp.low_52w,
    sp.timestamp
  FROM stock_prices sp
  WHERE sp.symbol = ANY(symbols_input)
  ORDER BY sp.symbol, sp.timestamp DESC;
$$;

GRANT EXECUTE ON FUNCTION get_latest_stock_prices(TEXT[]) TO anon, authenticated, service_role;
