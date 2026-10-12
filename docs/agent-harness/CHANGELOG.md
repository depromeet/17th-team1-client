# 공용 에이전트 하네스 변경 이력

Claude와 Codex가 함께 쓰는 규칙, 산출물·인계 계약, Codex 미러의 변경 기록이다. Claude 전용 변경은 `.claude/CHANGELOG.md`.

| 날짜       | 변경 내용                                                                                        | 대상                                                                                        | 사유                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2026-10-12 | 공용 규칙 단일 원본화 (`.claude/rules/` → `docs/agent-rules/`, Claude는 심볼릭 링크로 자동 로드) | `docs/agent-rules/`, `.claude/rules/`                                                       | Claude와 Codex가 같은 규칙을 읽도록                                                |
| 2026-10-12 | Claude-Codex 인계 계약 추가                                                                      | `AGENTS.md`, `CLAUDE.md`, `cross-agent-handoff`, `artifacts/work/`, `docs/agent-contracts/` | 각 도구의 하네스는 유지하고 모델·세션 전환 시에만 파일로 상태 전달 (candanta 구조) |
| 2026-10-12 | Codex 미러 하네스 추가 (Agent 10, Skill 6, git 안전 Hook)                                        | `.codex/agents/*.toml`, `.agents/skills/`, `.codex/hooks/`, `.codex/hooks.json`             | Codex에서도 Task Team·Bug Team 실행                                                |
| 2026-10-12 | 쌍 파일 동기화 검사                                                                              | `scripts/check-agent-harness-sync.sh`, `.lintstagedrc.js`                                   | 한쪽 하네스만 고쳐 두 도구의 동작이 어긋나는 것 방지                               |
| 2026-10-12 | `git-workflow.md` 병렬 작업 절을 Claude·Codex 양쪽 방식으로 분리                                 | `docs/agent-rules/git-workflow.md`                                                          | Codex에는 `Agent(isolation: "worktree")`가 없음                                    |
