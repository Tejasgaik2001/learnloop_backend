// Database migration for practice module tables
export const practiceModuleTables = `
-- Questions table for practice module
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('mcq', 'short_answer')),
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  weight INTEGER NOT NULL DEFAULT 1,
  last_asked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  weak_areas JSONB,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice attempts table
CREATE TABLE IF NOT EXISTS practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add retention_score to topics if not exists
ALTER TABLE topics ADD COLUMN IF NOT EXISTS retention_score INTEGER DEFAULT 50 CHECK (retention_score BETWEEN 0 AND 100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_last_asked ON questions(last_asked_at);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_session_id ON practice_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_topics_retention_score ON topics(retention_score);
`;

// SQL to seed sample questions
export const seedSampleQuestions = `
-- Insert sample questions for existing topics
INSERT INTO questions (topic_id, type, question, options, correct_answer, difficulty, weight)
SELECT 
  t.id,
  'mcq',
  'What is the primary purpose of useEffect in React?',
  '["To manage state", "To perform side effects", "To create components", "To style elements"]',
  'To perform side effects',
  2,
  1
FROM topics t 
WHERE t.title = 'React Hooks'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, type, question, options, correct_answer, difficulty, weight)
SELECT 
  t.id,
  'short_answer',
  'Explain the difference between useMemo and useCallback.',
  NULL,
  'useMemo memoizes values while useCallback memoizes functions',
  3,
  2
FROM topics t 
WHERE t.title = 'React Hooks'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, type, question, options, correct_answer, difficulty, weight)
SELECT 
  t.id,
  'mcq',
  'What is TypeScript?',
  '["A database", "A superset of JavaScript", "A CSS framework", "A build tool"]',
  'A superset of JavaScript',
  1,
  1
FROM topics t 
WHERE t.title = 'TypeScript Generics'
ON CONFLICT DO NOTHING;
`;
