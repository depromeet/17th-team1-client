---
name: bug-team-orchestrator
description: >
  globber Bug Team 버그 처리 흐름(티켓 정리 → 원인 분석 → 수정·회귀 테스트 → 포스트모텀)을 조율한다.
  "버그 있어", "GLB-123 버그 고쳐줘", "모바일에서 ~가 안 돼", "에러 나", "왜 이렇게 동작해?", "포스트모텀 해줘", "재발 방지해줘" 같은 요청에 사용한다.
  같은 버그 추가 정보, "수정 다시", "포스트모텀만 다시", "이전 분석 기반으로 보완" 같은 재실행 요청에도 사용한다.
  새 기능 구현은 task-team-orchestrator를 사용한다.
---

# Bug Team Orchestrator

## 팀

| 팀원             | 역할                    | 산출물           |
| ---------------- | ----------------------- | ---------------- |
| bug-reporter     | 티켓 정리, 중복 확인    | `ticket.md`      |
| bug-localizer    | 근본 원인, 영향 호출처  | `localize.md`    |
| bug-fixer        | 수정, 회귀 테스트, 검증 | `src/`, `fix.md` |
| postmortem-agent | 재발 방지안             | `postmortem.md`  |

## 0. 실행 모드 확인

1. run id: `GLB-{번호}` 또는 `{YYYYMMDD}-{slug}`. `{run}` = `artifacts/bug-team/{run id}/`.
2. `{run}`이 없으면 초기 실행. 있으면:
   - 추가 정보 → T01 티켓 갱신부터
   - "수정 다시" → T03부터, "포스트모텀만" → T04만
   - "처음부터" → `artifacts/archive/bug-team/{run id}-{YYYYMMDD}/`로 옮기고 새 실행
3. 병렬 상황 점검: `git status`, `git worktree list`, `git branch --show-current`.

## 1. Task 등록

| Task           | 담당             | 입력                                   | 출력             | 의존 | 완료 기준                                                        |
| -------------- | ---------------- | -------------------------------------- | ---------------- | ---- | ---------------------------------------------------------------- |
| T01-triage     | bug-reporter     | 버그 설명, 기존 티켓                   | `ticket.md`      | -    | 심각도, 환경, 재현 단계, 중복 판정                               |
| T02-localize   | bug-localizer    | `ticket.md`                            | `localize.md`    | T01  | 결함 위치, 근본 원인, 모든 영향 호출처, 수정 방향                |
| T03-fix        | bug-fixer        | ticket, localize                       | `src/`, `fix.md` | T02  | tsc·check·test 통과, 회귀 테스트 또는 미작성 사유, 브라우저 확인 |
| T04-postmortem | postmortem-agent | ticket, localize, fix, 이전 포스트모텀 | `postmortem.md`  | T03  | 유입 경로, 규칙 갱신안, Task Team 피드백                         |

## 2. 실행 흐름

1. `TeamCreate`, `TaskCreate`(T01~T04, 의존 포함).
2. T01. 중복이면 기존 run을 안내하고 팀을 정리한다. "빠진 정보"가 재현을 막으면 AskUserQuestion으로 사용자에게 묻고 티켓을 갱신한다.
3. T02. 원인을 특정할 수 없으면 후보 파일을 사용자에게 보여주고 확인받는다. 수정 방향 선택지가 여럿이면 AskUserQuestion으로 고르게 한다. 방향이 명확하면 승인 없이 T03으로 간다.
4. T03 - **worktree 격리**
   - `Agent(subagent_type: "bug-fixer", isolation: "worktree", name: "bug-{run id}")`로 스폰한다. 여러 버그를 동시에 처리하면 fixer마다 worktree를 따로 주고, `Agent` 호출은 메시지마다 하나씩 보낸다. 같은 파일을 고치는 버그끼리는 순차 실행한다.
   - 지시문: `{run}` 절대 경로, 수정 범위, "커밋 금지", `git-workflow.md` 병렬 작업 절 읽기.
   - 완료 후 orchestrator가 병합하고 직접 `git diff`, `pnpm exec tsc --noEmit`, `pnpm check`, `pnpm test`로 재검증한다. 실패하면 "무관해 보인다"로 넘기지 않고 원인을 확인해 fixer에게 다시 맡긴다(1회). 그래도 실패하면 사용자에게 보고한다.
   - Critical 버그면 수정 전에 사용자에게 심각도와 영향 범위를 먼저 알린다.
5. T04. 규칙 갱신안이 있으면 사용자에게 보여주고, 승인되면 `docs/agent-rules/`에 반영한 뒤 `docs/agent-harness/CHANGELOG.md`에 기록한다.
6. `summary.md`: 원인, 수정, 검증, 제안 커밋 메시지와 PR 본문 초안.
7. **🔒 커밋·push·PR 승인 게이트** → 승인 시 `git-commit` Skill.
8. `TeamDelete`.

## 3. 데이터 전달

- 진행 상태: `TaskCreate` / `TaskUpdate` / `TaskGet`
- 조율: `SendMessage`
- 산출물: `{run}/` 파일

## 4. 산출물 계약

```
artifacts/bug-team/{run id}/
  ticket.md      ← bug-reporter
  localize.md    ← bug-localizer
  fix.md         ← bug-fixer
  postmortem.md  ← postmortem-agent ("Task Team 피드백"은 task-team-orchestrator가 다음 실행에서 읽는다)
  summary.md     ← orchestrator
```
