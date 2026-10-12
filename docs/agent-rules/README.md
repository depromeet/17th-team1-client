# 공용 에이전트 규칙

Claude와 Codex가 코드·문서·Git 작업 전에 읽는 규칙의 단일 원본이다. 도구별 권한·Hook·Agent 설정은 `.claude/`, `.codex/`에 둔다.

- Claude: `.claude/rules/`의 심볼릭 링크로 자동 로드된다(`paths:`가 있으면 해당 파일을 다룰 때만).
- Codex: `AGENTS.md`의 안내에 따라 작업과 관련된 문서를 직접 읽는다.
- 새 규칙 파일을 추가하면 `.claude/rules/`에 심볼릭 링크도 만든다: `ln -s ../../docs/agent-rules/{name}.md .claude/rules/`

| 규칙                       | 읽는 시점                                                      |
| -------------------------- | -------------------------------------------------------------- |
| `project-structure.md`     | 파일 배치, 폴더 이름, 기술 스택을 판단할 때                    |
| `code-conventions.md`      | `src/` TypeScript·React 코드를 쓰거나 고칠 때                  |
| `api.md`                   | `services/`, `apiClient`, TanStack Query, API 타입을 다룰 때   |
| `hooks.md`                 | 커스텀 훅을 만들거나 고칠 때                                   |
| `styling.md`               | Tailwind 클래스, 디자인 토큰, CVA, 접근성                      |
| `env-ssr.md`               | 환경변수, `config/env.ts`, SSR·hydration, Dockerfile 빌드 인자 |
| `mobile-web.md`            | 모바일 UI, 입력·이미지·드래그·키보드 동작                      |
| `git-workflow.md`          | 브랜치, 커밋, PR, worktree 병렬 작업 전                        |
| `enforcement-placement.md` | 검사를 Hook·pre-commit·테스트 중 어디에 둘지 정할 때           |
