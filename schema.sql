CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(254) NOT NULL,
  email_normalized VARCHAR(254) NOT NULL UNIQUE,
  answers JSONB NOT NULL,
  correct_count SMALLINT NOT NULL CHECK (correct_count BETWEEN 0 AND 10),
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS submissions_submitted_at_idx ON submissions (submitted_at DESC);
CREATE TABLE IF NOT EXISTS admin_login_limits (
  ip_hash TEXT PRIMARY KEY,
  attempts INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMPTZ
);
