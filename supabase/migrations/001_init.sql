-- songs table (seeded from Zetaraku, read-only)
CREATE TABLE IF NOT EXISTS songs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  artist          text NOT NULL,
  genre           text,
  image_name      text,
  UNIQUE (title, artist),
  basic_level     text,
  advanced_level  text,
  expert_level    text,
  master_level    text,
  ultima_level    text,
  basic_const     numeric(4,1),
  advanced_const  numeric(4,1),
  expert_const    numeric(4,1),
  master_const    numeric(4,1),
  ultima_const    numeric(4,1)
);

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text UNIQUE NOT NULL,
  b30_rating  numeric(5,2) DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- user_scores table
CREATE TABLE IF NOT EXISTS user_scores (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  song_id     uuid NOT NULL REFERENCES songs(id),
  difficulty  text NOT NULL CHECK (difficulty IN ('BASIC','ADVANCED','EXPERT','MASTER','ULTIMA')),
  score       integer NOT NULL CHECK (score BETWEEN 0 AND 1010000),
  grade       text NOT NULL,
  lamp        text NOT NULL CHECK (lamp IN ('NONE','FC','AJ','AJC')),
  song_rating numeric(5,2) NOT NULL,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, song_id, difficulty)
);

-- RLS
ALTER TABLE songs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

-- songs: public read
CREATE POLICY "songs_public_read" ON songs FOR SELECT USING (true);

-- profiles: own row only
CREATE POLICY "profiles_own_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_scores: own rows only
CREATE POLICY "scores_own_select" ON user_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scores_own_insert" ON user_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scores_own_update" ON user_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scores_own_delete" ON user_scores FOR DELETE USING (auth.uid() = user_id);
