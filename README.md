# 메롱스튜디오 스케줄러

메롱스튜디오 전용 일정 관리 웹앱입니다.  
React + Vite + Supabase + Vercel 구성으로 즉시 배포 가능합니다.

---

## 기능

- **촬영 일정** 등록/수정/삭제 (날짜, 시간, 이름, 연락처, 시안/보정 여부, 특이사항)
- **대관 일정** 등록/수정/삭제 (호리존 / 컨셉룸 / 전체대관)
- **미정 일정** 지원 (날짜/시간 없이 등록)
- **중복 일정 경고** (촬영↔촬영, 대관↔대관, 촬영↔대관 교차 검사)
- **종합 시간표** (선택한 날짜 기준 00:00~23:00 시간표 자동 연동)
- **미정 일정 목록** 고정 표시 (접기/펼치기)
- **전체대관** 시 호리존+컨셉룸 셀 병합 표시
- **KST 기준** 모든 날짜/시간 처리
- **모바일 반응형** 지원 (종합 탭 가로 스크롤)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18 + Vite 5 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| VCS | GitHub |

---

## 빠른 시작

### 1. 레포지토리 클론

```bash
git clone https://github.com/your-username/merong-scheduler.git
cd merong-scheduler
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Supabase 정보를 입력합니다:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Supabase 프로젝트의 Settings > API에서 확인할 수 있습니다.

### 4. Supabase 마이그레이션

Supabase 대시보드 → SQL Editor에서 `supabase_migration.sql` 내용을 실행합니다.

### 5. 로컬 실행

```bash
npm run dev
```

http://localhost:5173 에서 확인합니다.

### 6. 빌드

```bash
npm run build
```

---

## GitHub 업로드 가이드

```bash
# 1. GitHub에서 새 레포지토리 생성 (merong-scheduler)

# 2. 로컬에서 초기화 및 업로드
git init
git add .
git commit -m "init: 메롱스튜디오 스케줄러"
git remote add origin https://github.com/your-username/merong-scheduler.git
git branch -M main
git push -u origin main
```

> ⚠️ `.env` 파일은 `.gitignore`에 포함되어 있어 업로드되지 않습니다.

---

## Vercel 배포 가이드

### 방법 1: Vercel 웹 대시보드

1. [vercel.com](https://vercel.com) 로그인
2. **New Project** → GitHub 레포지토리 선택
3. **Framework Preset**: Vite (자동 감지)
4. **Environment Variables** 섹션에서 추가:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
5. **Deploy** 클릭

### 방법 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

배포 중 환경변수 입력 프롬프트가 나타납니다.

---

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

---

## 프로젝트 구조

```
merong-scheduler/
├── src/
│   ├── components/
│   │   ├── ShootingTab.jsx     # 촬영 일정 탭
│   │   ├── RentalTab.jsx       # 대관 일정 탭
│   │   ├── OverviewTab.jsx     # 종합 시간표 탭
│   │   └── Modals.jsx          # 경고/삭제 모달
│   ├── hooks/
│   │   └── useSchedules.js     # 데이터 fetching 훅
│   ├── lib/
│   │   └── supabase.js         # Supabase 클라이언트
│   ├── utils/
│   │   ├── dateUtils.js        # 날짜/시간 유틸 (KST)
│   │   └── conflictCheck.js    # 중복 일정 검사
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── main.jsx                # 진입점
│   └── index.css               # 전역 스타일
├── supabase_migration.sql       # DB 마이그레이션
├── .env.example                 # 환경변수 예시
├── vite.config.js
├── package.json
└── README.md
```

---

## 주의사항

- 모든 날짜/시간은 **KST (Asia/Seoul)** 기준으로 처리됩니다.
- 중복 일정은 **경고만 표시**하고 저장을 막지 않습니다.
- 전체대관 등록 시 호리존, 컨셉룸 모두와 충돌 검사합니다.
- `.env` 파일을 절대 GitHub에 올리지 마세요.
