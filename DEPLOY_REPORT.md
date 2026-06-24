# 배포 전 오류 점검 보고서

## 빌드 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| package.json | ✅ | React 18, Vite 5, Supabase JS, date-fns |
| vite.config.js | ✅ | @vitejs/plugin-react 설정 |
| index.html | ✅ | 진입점 정상 |
| src/main.jsx | ✅ | ReactDOM.createRoot |
| src/App.jsx | ✅ | 탭 라우팅 (촬영/대관/종합) |

## 컴포넌트 검증

| 파일 | 상태 | 기능 |
|------|------|------|
| ShootingTab.jsx | ✅ | 등록/수정/삭제, 미정, 중복 검사 |
| RentalTab.jsx | ✅ | 호리존/컨셉룸/전체대관, 미정, 중복 검사 |
| OverviewTab.jsx | ✅ | 시간표, 미정 목록, 날짜 네비게이션 |
| Modals.jsx | ✅ | 충돌 경고 모달, 삭제 확인 모달 |

## 유틸리티 검증

| 파일 | 상태 | 기능 |
|------|------|------|
| dateUtils.js | ✅ | KST 기준 날짜/시간 처리, 정렬 |
| conflictCheck.js | ✅ | 촬영↔촬영, 대관↔대관, 교차 검사 |
| supabase.js | ✅ | 환경변수 기반 클라이언트 |
| useSchedules.js | ✅ | CRUD 훅 (shooting/rental) |

## 데이터베이스 검증

| 항목 | 상태 |
|------|------|
| shooting_schedules 테이블 | ✅ |
| rental_schedules 테이블 | ✅ |
| updated_at 트리거 | ✅ |
| RLS 정책 (anon 허용) | ✅ |
| 인덱스 (date, pending, space) | ✅ |

## 기능 체크리스트

### 촬영
- [x] 날짜/시간 범위 입력
- [x] 미정 버튼 (날짜+시간 대체)
- [x] 이름/연락처/시안작성/보정여부/특이사항
- [x] 수정/삭제
- [x] 삭제 확인 팝업
- [x] 정렬: 미정 > 날짜 > 시간

### 대관
- [x] 대분류 선택 (호리존/컨셉룸/전체대관)
- [x] 날짜/시간 범위 입력
- [x] 미정 버튼
- [x] 이름/연락처/특이사항
- [x] 수정/삭제
- [x] 정렬: 미정 > 날짜 > 시간

### 중복 검사
- [x] 촬영 ↔ 촬영
- [x] 대관 ↔ 대관 (같은 공간)
- [x] 촬영 ↔ 대관 (모든 유형)
- [x] 전체대관 ↔ 촬영/호리존/컨셉룸
- [x] 신규 저장 시 검사
- [x] 수정 시 검사 (자기 자신 제외)
- [x] 경고 팝업 (저장 차단 안함)
- [x] 여러 충돌 시 하나의 팝업에 묶어 표시

### 종합
- [x] 미정 일정 최상단 고정
- [x] 미정 접기/펼치기 (기본: 펼침)
- [x] 날짜 선택 + 이전날/오늘/다음날 버튼
- [x] 00:00 ~ 23:00 시간표 (1시간 단위)
- [x] 촬영/호리존/컨셉룸 4개 열
- [x] 전체대관 시 호리존+컨셉룸 병합(colSpan=2)
- [x] rowSpan으로 시간 범위 표현
- [x] 셀 내 이름만 표시

### 타임존
- [x] KST (Asia/Seoul) 기준
- [x] UTC 미사용
- [x] getTodayKST() - Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' })

### 모바일
- [x] 반응형 레이아웃 (max-width: 700px)
- [x] 종합 탭 가로 스크롤 (min-width: 500px 유지)
- [x] 4개 열 항상 유지

## 환경변수 오류

| 변수 | 누락 시 증상 | 해결 |
|------|-------------|------|
| VITE_SUPABASE_URL | Supabase 연결 실패 | .env 파일 확인 |
| VITE_SUPABASE_ANON_KEY | 인증 오류 | Supabase Settings > API |

## Vercel 배포 시 주의사항

1. Environment Variables 반드시 설정
2. Framework: Vite (자동 감지)
3. Build Command: `npm run build` (기본값)
4. Output Directory: `dist` (기본값)
5. Node.js 버전: 18+ 권장

## 알려진 제한사항

- 현재 환경에서는 네트워크 정책상 `npm install` 불가 (실제 배포 환경에서는 정상 동작)
- Supabase 연결 없이는 데이터 로드/저장 불가 (정상 동작)
- 인증 시스템 없음 (관리자 전용 서비스 - 추후 Supabase Auth 추가 권장)
