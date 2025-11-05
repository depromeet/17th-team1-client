# Globber

**3D 지구본 기반 여행 시각화 애플리케이션**

React 19와 Next.js 15를 기반으로 한 현대적인 웹 애플리케이션입니다. 사진의 EXIF 위치 정보를 추출하여 3D 지구본에 시각화합니다.

## Tech Stack

- **Framework**: Next.js 15.5.2, React 19.1.0
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm 9.1.0
- **Styling**: TailwindCSS v4, CVA, clsx
- **State Management**: Zustand, TanStack React Query
- **3D Graphics**: Globe.gl, React-Globe.gl, Three.js
- **Image Processing**: EXIFR, HEIC2ANY
- **External APIs**: Google Maps Services
- **Code Quality**: Biome (linting/formatting)
- **Deployment**: Docker (standalone output)

## Getting Started

### Prerequisites

- Node.js 20.x 이상
- pnpm 9.x 이상

### Installation

```bash
# 의존성 설치
pnpm install

# AI 어시스턴트 설정 파일 생성 (최초 1회 실행 필요)
pnpm ruler:apply
```

### Environment Variables

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# Server-side only (API routes)
GOOGLE_MAPS_API_KEY=your_key_here

# Client-side (browser accessible)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Development

```bash
# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### Production Build

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## Available Scripts

### Development
- `pnpm dev` - 개발 서버 실행
- `pnpm build` - 프로덕션 빌드
- `pnpm start` - 프로덕션 서버 실행

### Code Quality
- `pnpm lint` - Biome 린트 실행 (자동 수정)
- `pnpm format` - Biome 포맷 실행 (자동 수정)
- `pnpm check` - Biome 전체 검사 (자동 수정)
- `pnpm reporter` - Biome 검사 요약 리포트
- `pnpm ci` - CI 모드로 Biome 검사

### Utilities
- `pnpm tokens:build` - 디자인 토큰 빌드
- `pnpm ruler:apply` - AI 어시스턴트 설정 파일 생성

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── react-globe/       # Globe 관련 컴포넌트
│   │   └── image-metadata/    # 이미지 메타데이터 컴포넌트
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # 유틸리티 함수
│   ├── constants/             # 상수 정의
│   └── types/                 # TypeScript 타입 정의
├── .ruler/                    # AI 어시스턴트 설정
│   ├── AGENTS.md             # AI 가이드 진입점
│   ├── CONVENTIONS.md        # 코드 컨벤션
│   └── GLOBBER.md            # 프로젝트별 가이드
├── scripts/                   # 유틸리티 스크립트
└── public/                    # 정적 파일
```

## AI Assistant Configuration

이 프로젝트는 [Ruler](https://github.com/intellectronica/ruler)를 사용하여 AI 어시스턴트(Claude Code, GitHub Copilot, Cursor 등)에 일관된 가이드를 제공합니다.

### 최초 설정

프로젝트 클론 후 **반드시 한 번** 실행하세요:

```bash
pnpm ruler:apply
```

이 명령어는 `.ruler/` 디렉토리의 가이드를 각 AI 도구별 설정 파일로 변환합니다:
- `.claude/CLAUDE.md` - Claude Code용
- `.github/.copilot-instructions.md` - GitHub Copilot용
- `.cursor/CURSOR.md` - Cursor용

### 가이드 문서 구조

- **AGENTS.md**: AI 어시스턴트 가이드 진입점
- **CONVENTIONS.md**: 네이밍, 코드 스타일, JSDoc 컨벤션
- **GLOBBER.md**: 프로젝트별 아키텍처 및 중요 규칙

## Code Conventions

주요 코딩 컨벤션:

- **변수명**: camelCase
- **상수명**: UPPER_SNAKE_CASE
- **컴포넌트**: PascalCase
- **타입**: `type` 사용 (interface 대신)
- **이벤트 핸들러**: `handle[Action][Target]` 또는 `on[Action][Target]`
- **Boolean 변수**: `is`, `has`, `should` 접두사

## HTTPS 개발 환경

HTTPS가 필요한 기능을 개발할 때는 로컬 HTTPS 서버를 사용할 수 있습니다.

### 초기 설정

1. mkcert 설치 (Mac):
```bash
brew install mkcert
```

2. 로컬 CA 등록:
```bash
mkcert -install
```

### 실행 방법

- 기본 (HTTP): `pnpm run dev`
- HTTPS 버전: `pnpm run dev:https`

## Learn More
자세한 내용은 [CONVENTIONS.md](.ruler/CONVENTIONS.md)를 참고하세요.

## Features

- 📸 **EXIF 기반 위치 추출** - 사진의 GPS 정보 자동 추출
- 🌍 **3D 지구본 시각화** - Three.js 기반 인터랙티브 지구본
- 📱 **모바일 최적화** - 512px 모바일 우선 디자인
- 🎨 **현대적인 UI** - TailwindCSS v4 기반 디자인 시스템
- 🖼️ **HEIC 지원** - iPhone HEIC 이미지 자동 변환
- 🗺️ **Google Maps 연동** - 장소 정보 및 지오코딩

## Documentation

- [Architectural Analysis Report](claudedocs/architectural-analysis-report.md)
- [AI Assistant Guide](.ruler/AGENTS.md)
- [Code Conventions](.ruler/CONVENTIONS.md)

## License

MIT
