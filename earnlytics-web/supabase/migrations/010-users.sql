CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read email" ON users;
CREATE POLICY "Allow public read email" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role insert" ON users;
CREATE POLICY "Allow service role insert" ON users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role update" ON users;
CREATE POLICY "Allow service role update" ON users
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow service role delete" ON users;
CREATE POLICY "Allow service role delete" ON users
  FOR DELETE USING (true);
