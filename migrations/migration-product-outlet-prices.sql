-- Add outlet_prices jsonb column for specific pricing per outlet
ALTER TABLE products ADD COLUMN IF NOT EXISTS outlet_prices JSONB DEFAULT '{}'::jsonb;
