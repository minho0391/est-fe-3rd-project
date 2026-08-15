# Momentalk

모임에서 무슨 말을 할지 막힐 때, 상황에 맞는 대화 소재를 AI가 뽑아 주는 서비스입니다.

**[서비스 바로가기](https://est-fe-3rd-project.vercel.app)** · [발표 자료](https://www.figma.com/deck/rU9QxiDCQQ91l4sGO3vOzP/6%EC%A1%B0---%EB%AA%A8%EC%9E%90%EC%9D%B4%ED%81%AC-mosiac--%EB%B0%9C%ED%91%9C-%EC%9E%90%EB%A3%8C)

EST 이스트캠프 오르미 프론트엔드 13기 3차 팀 프로젝트 · TEAM MOSAIC

---

## 목차

- [기획 배경](#기획-배경)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [설계 판단](#설계-판단)
- [품질 검증](#품질-검증)
- [로컬 실행](#로컬-실행)
- [프로젝트 구조](#프로젝트-구조)
- [문서](#문서)
- [팀](#팀)

---

## 기획 배경

첫 만남, 회식, MT처럼 사람이 모이는 자리에서 대화가 끊기는 순간이 있습니다.
분위기를 살릴 소재가 필요하다는 건 알지만, 그 자리에서 바로 떠올리기는 어렵습니다.

Momentalk은 **상황과 형식을 고르면 AI가 그 자리에 맞는 대화 소재를 만들어 주는 서비스**입니다.
생성만 하고 끝나지 않고 저장 · 커뮤니티 공유 · 미니게임까지 이어지도록 설계했습니다.

---

## 주요 기능

### AI 대화 소재 생성

- 상황(첫 만남 · 회식 · 소개팅 · 신입 OT · MT · 여행 · 생일 모임) 7종
- 형식(질문 · 밸런스 · 대화주제 · 미션 · 유머 · 퀴즈 · 게임 · 벌칙) 8종
- 대화 깊이 3단계, 분위기 · 관계 · 대상 태그로 조건 조합
- 프리셋 카드로 빠른 진입, 직접 입력도 지원
- **비로그인 상태에서도 생성 가능**, 저장하려 할 때만 로그인 유도

### 커뮤니티

- 게시글 작성(Quill 에디터) · 이미지 업로드 · YouTube/Vimeo 영상 임베드
- 댓글 · 대댓글 · 좋아요 · 조회수
- 게시글 신고 및 관리자 신고 관리 페이지
- 최신순 · 좋아요순 · 조회수순 정렬, 검색

### 미니게임 3종

- **카드 뒤집기** — 카드를 뒤집어 소재 확인 (콘텐츠 모드 / 조커 찾기 모드)
- **랜덤 픽** — 공을 골라 소재 추첨
- **초성 퀴즈** — 초성 문제 출제와 풀이

세 게임 모두 별도 더미 데이터가 아니라 **DB의 실제 콘텐츠(367건)** 를 사용합니다.

### 인증 · 마이페이지

- 이메일 회원가입 · 로그인, Google OAuth
- 비밀번호 재설정(메일 발송), 비밀번호 변경(현재 비밀번호 재인증)
- 프로필 사진 업로드, 내가 쓴 글 · 좋아요 · 댓글 · 저장한 AI 콘텐츠 조회

---

## 기술 스택

| 영역     | 사용 기술                                              |
| -------- | ------------------------------------------------------ |
| Frontend | Next.js 16 (App Router), React 19, MUI v7, Quill       |
| Backend  | Supabase (PostgreSQL · Auth · Storage · Edge Function) |
| AI       | 앨런(Alan) API, Deno Edge Runtime                      |
| Test     | Playwright (E2E 70개)                                  |
| DevOps   | Vercel, GitHub Actions, Discord Webhook                |

2차 프로젝트까지는 순수 HTML/CSS/JS로 진행했고,
3차에서 인증과 데이터 저장이 필요해지면서 Next.js와 Supabase를 도입했습니다.

---

## 아키텍처

```
브라우저 (Next.js App Router)
    │
    ├─→ Supabase        인증 · PostgreSQL · Storage · RLS
    │
    └─→ Edge Function   generate (Deno)
            │
            ├─ 레이트리밋 검사 (RPC)
            └─→ 앨런 AI API → 응답 파싱 → DB 저장
```

- 앨런 API 키는 `supabase secrets` 에만 두고 Edge Function 안에서만 호출합니다.
  브라우저로 키가 내려가지 않습니다.
- 데이터 접근 권한은 프론트 조건문이 아니라 **PostgreSQL RLS 정책**으로 DB 단에서 차단합니다.

---

## 설계 판단

### 권한은 화면이 아니라 데이터베이스에서

버튼을 숨기는 것은 보이지 않게 할 뿐 요청 자체를 막지 못합니다.
주소창으로 `/post/{id}/edit` 에 직접 접근해도 DB 정책이 거부하도록 RLS를 적용했습니다.

`public` 스키마 정책 34개를 `pg_policies` 로 전수 확인했습니다.
`post_views` 만 정책이 없는데, 조회수 증가를 `SECURITY DEFINER` 함수로만 허용한 의도된 설계입니다.

```sql
-- 예시: 발행글은 누구나, 초안은 작성자만
status = 'published' OR author_id = auth.uid()
```

### 비로그인 생성 → 로그인 저장(claim)

가입을 강요하면 서비스 진입 자체가 막힙니다.
비로그인 사용자도 AI 생성을 쓸 수 있게 하되, 저장할 때 로그인을 유도합니다.

1. 비로그인 생성 → `generations` 에 `user_id IS NULL` 로 저장
2. 저장 시도 → `?returnUrl=` 로 로그인 유도
3. 로그인 후 결과 페이지로 복귀 → 해당 행의 `user_id` 를 본인 uuid로 UPDATE

익명 정책 3개(anon insert / select / claim update)로 구현했고,
Google OAuth 경로에서도 `returnUrl` 이 유실되지 않는 것을 확인했습니다.

### AI 호출 전에 막는 레이트리밋

호출한 뒤에 막으면 비용은 이미 발생합니다.
Edge Function 안에서 `check_generation_rate_limit` RPC를 먼저 호출해 판정합니다.

- 기본 분당 5건 / 하루 50건
- 한도 초과 시 429 와 함께 사유 · 재시도 시각 반환
- RPC가 `auth.uid()` 로 판단하므로 **비로그인 사용자는 제한 없음** — 체험 진입은 막지 않고 로그인 사용자의 반복 남용만 통제

### 집계 컬럼과 트리거

`posts` 의 `view_count` · `like_count` · `comment_count` 는 목록 조회마다 COUNT 하지 않도록 비정규화했습니다.
정합성은 트리거로 유지하며, 댓글은 소프트 삭제(`deleted_at`) 변경에도 반응합니다.

### 다형 참조

`community_reports` 는 신고 대상이 게시글일 수도 댓글일 수도 있어
FK 대신 `target_type` + `target_id` 로 받고 존재 여부는 트리거로 검증합니다.

---

## 품질 검증

### E2E 테스트

Playwright로 **70개** 시나리오를 자동화했습니다.
단위 테스트 대신 E2E를 택한 이유는, 이 서비스의 핵심이 RLS · 인증 · 화면이 맞물리는 지점이기 때문입니다.

```bash
npm run test:e2e
```

### 웹 접근성

axe DevTools · WCAG 2.1 AA 기준으로 검사하고 수정했습니다.

| 발견                   | 수정                                         |
| ---------------------- | -------------------------------------------- |
| 색상 대비 미달         | `#238059` → `#1B6B4A` (4.4 → 5.8)            |
| 에러 문구 대비         | `#d92d3a` → `#c81e2a` (4.35 → 5.4)           |
| heading 레벨 건너뜀    | `variant` 유지, `component` 만 교체          |
| `<main>` 랜드마크 없음 | 최상위 Box에 `component="main"`              |
| 이미지 대체 텍스트     | 헤더 공통 컴포넌트 한 곳 수정으로 6화면 해결 |

Quill 에디터 내부 마크업과 YouTube iframe 내부 ARIA는 서드파티가 생성하는 DOM이라 수정 대상에서 제외했습니다.

### 웹 표준 · 성능

- W3C Validator — heading 위계, `button` 내부 블록 요소 정리
- Lighthouse — Desktop 98점, 접근성 · 권장사항 · SEO 96~100
- 모바일 Performance 저하는 MUI 번들 크기로 인한 TBT가 주원인이며, 개선 방향은 코드 스플리팅과 미사용 CSS 제거로 파악해 두었습니다

### SEO

- 전 페이지 metadata, 게시글 상세는 `generateMetadata` 로 동적 생성
- `robots` · `sitemap` 으로 색인 대상과 제외 대상 분리
- OG 이미지 WebP 전환 후 카카오톡 · Discord 실제 표시 확인

---

## 로컬 실행

### 요구 사항

- Node.js 20 이상
- Supabase 프로젝트 (URL · anon key)

### 설치

```bash
git clone https://github.com/minho0391/est-fe-3rd-project.git
cd est-fe-3rd-project
npm install
```

### 환경 변수

`.env.example` 을 복사해 `.env.local` 을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

앨런 API 키는 클라이언트가 아니라 Supabase Edge Function의 secrets에 등록합니다.

### 실행

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run start        # 빌드 결과 실행
npm run test:e2e     # E2E 테스트
```

---

## 프로젝트 구조

```
src/
├── app/                 App Router 페이지 · layout · metadata
│   ├── api/             Route Handler
│   ├── generate/        AI 생성 (조건 선택 · 진행 · 결과 · 실패)
│   ├── game/            미니게임 3종
│   ├── post/            커뮤니티 · 마이페이지 · 관리자
│   ├── sign-in/         인증
│   └── sign-up/
├── components/          공통 컴포넌트 (layout · games · post · ui)
├── lib/                 theme · site · 쿼리 · 뮤테이션 · sanitizer
├── hooks/               useFocusTrap 등
├── utils/supabase/      클라이언트 · 서버 · 인증 유틸
├── auth/                인증 화면 스타일
├── community/           커뮤니티 스타일 (tokens · 화면별)
└── proxy.js             세션 갱신 진입점

tests/                   Playwright E2E
docs/schema.sql          DB 스키마 스냅샷
supabase/*.sql           함수 · 트리거 · 정책
```

---

## 문서

DB 문서는 두 갈래로 관리합니다.
대시보드로 스키마를 만들어 마이그레이션 이력이 없기 때문입니다.

- **`docs/schema.sql`** — 테이블 정의 스냅샷. "현재 DB가 이렇게 생겼다"를 기록한 문서이며 실행용이 아닙니다.
- **`supabase/*.sql`** — 함수 · 트리거 · 인덱스 · Storage 정책. Supabase SQL Editor에서 실행합니다.

---

## 팀

| 이름   | 역할                                                  |
| ------ | ----------------------------------------------------- |
| 이민호 | 팀장 · DB/백엔드 · 미니게임 · 반응형 · CI · 코드 리뷰 |
| 최정민 | 커뮤니티 (글쓰기 · 댓글 · 신고 · 관리자)              |
| 최호찬 | AI 대화 생성 화면                                     |
| 조영빈 | 인증 (로그인 · 회원가입 · 비밀번호)                   |

### 협업 방식

- `develop` 브랜치 보호 — 직접 push 불가, PR 필수
- 브랜치 네이밍 `feat/` `fix/` `docs/` `test/` `chore/`
- GitHub Actions로 E2E 자동 실행, Discord 웹훅으로 머지 알림
