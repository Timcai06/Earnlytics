-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category TEXT DEFAULT 'other',
  page_url TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NPS surveys table
CREATE TABLE IF NOT EXISTS nps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER CHECK (score >= 0 AND score <= 10),
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_nps_score ON nps_surveys(score);
CREATE INDEX IF NOT EXISTS idx_nps_created_at ON nps_surveys(created_at);

-- Add RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert
CREATE POLICY "Allow anonymous feedback insert"
  ON feedback FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous NPS insert"
  ON nps_surveys FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow admin select
CREATE POLICY "Allow admin feedback select"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin NPS select"
  ON nps_surveys FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');
