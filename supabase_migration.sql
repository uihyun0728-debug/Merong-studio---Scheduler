-- ============================================
-- 메롱스튜디오 스케줄러 - Supabase Migration SQL
-- ============================================
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- ============================================

-- 촬영 일정 테이블
CREATE TABLE IF NOT EXISTS shooting_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_date DATE,                    -- NULL when is_pending = true
  start_time   TIME,                     -- NULL when is_pending = true
  end_time     TIME,                     -- NULL when is_pending = true
  is_pending   BOOLEAN NOT NULL DEFAULT FALSE,
  name         TEXT NOT NULL,
  phone        TEXT,
  draft_done   BOOLEAN NOT NULL DEFAULT FALSE,
  retouch_done BOOLEAN NOT NULL DEFAULT FALSE,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 대관 일정 테이블
CREATE TABLE IF NOT EXISTS rental_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_type    TEXT NOT NULL CHECK (space_type IN ('호리존', '컨셉룸', '전체대관')),
  schedule_date DATE,                    -- NULL when is_pending = true
  start_time    TIME,                    -- NULL when is_pending = true
  end_time      TIME,                    -- NULL when is_pending = true
  is_pending    BOOLEAN NOT NULL DEFAULT FALSE,
  name          TEXT NOT NULL,
  phone         TEXT,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 촬영 테이블 트리거
DROP TRIGGER IF EXISTS shooting_updated_at ON shooting_schedules;
CREATE TRIGGER shooting_updated_at
  BEFORE UPDATE ON shooting_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 대관 테이블 트리거
DROP TRIGGER IF EXISTS rental_updated_at ON rental_schedules;
CREATE TRIGGER rental_updated_at
  BEFORE UPDATE ON rental_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 (날짜 기준 조회 성능)
CREATE INDEX IF NOT EXISTS idx_shooting_date ON shooting_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_shooting_pending ON shooting_schedules(is_pending);
CREATE INDEX IF NOT EXISTS idx_rental_date ON rental_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_rental_pending ON rental_schedules(is_pending);
CREATE INDEX IF NOT EXISTS idx_rental_space ON rental_schedules(space_type);

-- Row Level Security (RLS)
-- 관리자 전용 시스템이므로 anon 키로 전체 접근 허용
-- 실제 운영 시 인증 시스템 추가 권장

ALTER TABLE shooting_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_schedules ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 정책 (anon 포함)
CREATE POLICY "allow_all_shooting" ON shooting_schedules
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_rental" ON rental_schedules
  FOR ALL USING (true) WITH CHECK (true);
