# 하네스 변경 이력

## 2026-10-12 - 초기 구성 (candanta 하네스 참고)

**규칙 이관**: `.ruler/` → `.claude/rules/`

- `instructions.md` → `CLAUDE.md`(원칙·라우팅) + `env-ssr.md`
- `code_conventions.md` → `code-conventions.md` (Next.js 특수 파일 예외 추가, 주석 언어를 실제에 맞춰 한국어로)
- `api_conventions.md` → `api.md` (TanStack Query 섹션 추가)
- `hooks_guide.md` → `hooks.md`
- `design_system.md` + `tailwind_conventions.md` → `styling.md` (중복 제거, v4 radius 표 정정)
- `project_structure.md` → `project-structure.md` (실제 트리, 기술 스택 버전 갱신)
- 신설: `mobile-web.md`(커밋 이력의 모바일 버그 패턴), `git-workflow.md`(브랜치·커밋·PR·worktree)
- 삭제: `ruler.toml`, `src/docs/detailed-rules.md`(내용 흡수), Ruler 의존성·스크립트·gitignore 블록

**규칙과 코드 불일치 해소** (규칙을 완화하지 않고 코드를 규칙에 맞춤)

- `interface` 54개 → `type`
- `function` 선언 25개 → 화살표 함수 (Next 특수 파일 진입점 제외)
- `process.env` 직접 참조 16개 파일 → `config/env.ts`의 `env`/`serverEnv`
- Tailwind 임의값 73개 → 같은 값의 표준 클래스
- 영어 주석 → 한국어 (주석 언어 한국어로 통일)
- 폴더명 camelCase 통일: `components/saved-globe` → `savedGlobe`, `components/listview` → `listView` (`app/` 라우트는 URL이라 kebab-case 유지)
- `Dockerfile`/`docker-compose.yml`: 코드에서 쓰지 않는 `NEXT_PUBLIC_BASE_URL` 대신 `NEXT_PUBLIC_API_BASE_URL`을 빌드 인자로 받도록 수정, `NEXT_PUBLIC_S3_BASE_URL` ENV 추가

**하네스**

- Task Team: project-manager, designer, frontend-developer, code-reviewer, security-reviewer, qa-engineer + `task-team-orchestrator`
- Bug Team: bug-reporter, bug-localizer, bug-fixer, postmortem-agent + `bug-team-orchestrator`
- 공용 Skill: `mobile-qa`, `git-commit`
- 구현 Agent는 worktree 격리로 스폰(팀 동시 실행·다중 세션 대비), 산출물은 실행별 폴더 `artifacts/{team}/{run id}/`
- `.claude/hooks/git-safety-guard.sh`, `.husky/commit-msg`, vitest 도입

**candanta와 다르게 한 것**

- backend-developer, devops-engineer 제외: 프론트엔드 전용 저장소, 배포는 GitHub Actions로 고정
- 규칙 위치: candanta는 Codex 공용 `docs/agent-rules/`, globber는 Claude 전용이라 `.claude/rules/`(경로별 자동 로드) → 같은 날 Codex 병행 사용으로 `docs/agent-rules/`로 변경(아래)

## 2026-10-12 - 커밋 규칙 정비

- 커밋 형식을 Conventional Commits 기준으로 재정의: scope 선택 허용(`fix(record):`), type에 `style`·`perf`·`build`·`ci`·`revert` 추가, `!` breaking change 허용
- `(GLB-n)` 접미는 훅 강제에서 권장으로 변경 (이력 753개 중 3개만 사용하던 형식이라 강제 근거 없음). 마침표 금지, 요약-본문 빈 줄은 훅이 검사
- `git-commit` Skill을 형식 기준 문서로 확장(type 표, scope 예시, 커밋 분리, PR 제목 = squash 커밋), `git-workflow.md`는 요약과 포인터만 유지

## 2026-10-12 - Claude-Codex 공용 하네스 (candanta cross-agent 구조 반영)

초기 구성에서 Codex 사용 여부를 확인하지 않고 cross-agent 구조를 보고 없이 제외했던 것을 바로잡음. 상세는 `docs/agent-harness/CHANGELOG.md`.

- 규칙 원본을 `docs/agent-rules/`로 이동, `.claude/rules/`는 심볼릭 링크로 바꿔 경로별 자동 로드 유지
- `cross-agent-handoff` Skill 추가, `CLAUDE.md`에 인계 절 추가
- `settings.json`: 공용 규칙·인계 절차·`AGENTS.md`·Codex 하네스 수정도 확인(ask) 대상
- Agent별 `effort` 누락 보완: candanta와 같은 역할별 값 (Claude `effort`, Codex `model_reasoning_effort`)
