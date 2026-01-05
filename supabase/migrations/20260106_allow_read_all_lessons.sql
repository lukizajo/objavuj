-- Allow reading ALL lessons (UI handles blur for non-free lessons)
-- Previous policies only allowed reading is_free=true lessons

DROP POLICY IF EXISTS "anon_read_free_lessons" ON lessons;
DROP POLICY IF EXISTS "auth_read_free_lessons" ON lessons;
DROP POLICY IF EXISTS "Anyone can read lessons" ON lessons;

CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (true);
