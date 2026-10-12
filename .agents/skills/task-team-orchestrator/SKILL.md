---
name: task-team-orchestrator
description: >
  globber Task Team 전체 개발 사이클(요구사항 → 디자인 명세 → 구현 → 코드/보안 리뷰 → QA)을 조율한다.
  "GLB-123 기능 구현해줘", "이 화면 만들어줘", "기능 추가해줘", "요구사항 정리해줘", "코드 리뷰해줘", "보안 검토해줘" 같은 요청에 사용한다.
  초기 실행뿐 아니라 "다시 실행", "QA만 다시", "리뷰만 다시", "이전 결과 기반으로 보완", "요구사항 수정 반영" 같은 재실행·부분 수정 요청에도 사용한다.
  버그 수정 요청은 bug-team-orchestrator, 단순 파일 편집은 직접 처리한다.
---

# Task Team Orchestrator

## Codex 실행 차이

이 진행표는 Claude판(`.claude/skills/task-team-orchestrator/SKILL.md`)과 쌍이다. Codex에 없는 Claude 도구는 아래처럼 바꿔 실행한다.

| Claude                                  | Codex                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| `TeamCreate` / `TeamDelete`             | 팀 생성·정리 없이 `.codex/agents/*.toml` 팀원을 서브에이전트로 호출              |
| `TaskCreate` / `TaskUpdate` / `TaskGet` | `{run}/progress.md`에 Task 표(담당, 상태, 차단 사유)를 두고 단계마다 갱신        |
| `SendMessage`                           | 팀원 호출 지시문과 결과 보고, 산출물 파일로 전달                                 |
| `Agent(..., isolation: "worktree")`     | `docs/agent-rules/git-workflow.md` 병렬 작업 절의 Codex 방식(`git worktree add`) |
| `AskUserQuestion`                       | 선택지를 번호로 제시하고 사용자 답을 기다림                                      |

## 팀

| 팀원               | 역할                         | 산출물                     |
| ------------------ | ---------------------------- | -------------------------- |
| project-manager    | 요구사항                     | `requirements.md`          |
| designer           | 화면·컴포넌트 명세           | `design-spec.md`           |
| frontend-developer | 구현                         | `src/`, `impl-notes.md`    |
| code-reviewer      | 로직·규칙 리뷰               | `code-review-{n}.md`       |
| security-reviewer  | 보안 리뷰                    | `security-review-{n}.md`   |
| qa-engineer        | 테스트 작성·검사·모바일 확인 | 테스트, `qa-report-{n}.md` |

## 0. 실행 모드 확인

1. run id를 정한다: Jira 번호가 있으면 `GLB-{번호}`, 없으면 `{YYYYMMDD}-{slug}`. `{run}` = `artifacts/task-team/{run id}/`(메인 체크아웃 절대 경로로 다룬다).
2. `{run}`이 없으면 **초기 실행**.
3. 있으면 요청을 해석한다.
   - "처음부터", "새로" → 기존 `{run}`을 `artifacts/archive/task-team/{run id}-{YYYYMMDD}/`로 옮기고 새 실행
   - "QA만", "리뷰만", "요구사항 수정 반영" → 해당 Task부터 부분 재실행 (`{n}` 번호를 올린다)
   - 불명확 → AskUserQuestion으로 "이어서 보완 / 특정 단계 재실행 / 새 실행" 확인
4. `artifacts/bug-team/*/postmortem.md` 중 "상태: 미반영"인 "Task Team 피드백"을 모아 `00-input.md`에 넣는다.
5. 병렬 상황 점검: `git status`, `git worktree list`, `git branch --show-current`. 다른 세션의 미커밋 변경이나 worktree가 보이면 구현 Task는 반드시 worktree 격리로 실행한다.

## 1. Task 등록

| Task             | 담당               | 입력                          | 출력                       | 의존       | 완료 기준                                                  |
| ---------------- | ------------------ | ----------------------------- | -------------------------- | ---------- | ---------------------------------------------------------- |
| T01-input        | orchestrator       | 사용자 요청, 티켓, Figma 링크 | `00-input.md`              | -          | 원문, 링크, 승인 지점, 미반영 피드백 정리 (해석 없이)      |
| T02-requirements | project-manager    | `00-input.md`                 | `requirements.md`          | T01        | 기능 분해, Given-When-Then 수용 기준, edge case, 영향 파일 |
| T03-design       | designer           | `requirements.md`, Figma      | `design-spec.md`           | T02 + 승인 | 컴포넌트·상태·토큰 매핑                                    |
| T04-implement    | frontend-developer | requirements, design-spec     | `src/`, `impl-notes.md`    | T03        | tsc·check·test 통과                                        |
| T05-code-review  | code-reviewer      | diff, 명세                    | `code-review-{n}.md`       | T04        | 판정, 수용 기준별 충족 여부                                |
| T06-security     | security-reviewer  | diff                          | `security-review-{n}.md`   | T04        | 배포 판정                                                  |
| T07-qa           | qa-engineer        | requirements, diff            | 테스트, `qa-report-{n}.md` | T05, T06   | 수용 기준별 결과, 신규 테스트는 실제 소스 import           |

## 2. 실행 흐름

1. T01을 직접 작성한다.
2. `TeamCreate`로 팀을 만들고 `TaskCreate`로 T01~T07을 의존 관계와 함께 등록한다. 팀원은 시작·차단·완료를 `TaskUpdate`로 갱신한다.
3. T02 실행.
4. **🔒 요구사항 승인 게이트**: `requirements.md`의 기능 분해·수용 기준·확인 필요 항목을 요약해 AskUserQuestion으로 승인받는다. 수정 요청이면 project-manager에게 반영시키고 다시 게이트를 거친다.
5. T03 실행. "확인 필요"가 남으면 사용자에게 묻는다.
6. T04 구현 - **worktree 격리**
   - 기본은 `Agent(subagent_type: "frontend-developer", isolation: "worktree", name: "task-{run id}-impl")`로 스폰한다. 다른 세션·팀이 같은 저장소에서 동시에 일할 수 있기 때문이다.
   - 명세가 서로 다른 파일 영역으로 깔끔하게 나뉘면(예: 새 페이지 / 공통 컴포넌트) frontend-developer를 2명까지 나눠 스폰할 수 있다. 각자 파일 범위를 지시문에 명시하고, **`Agent` 호출은 메시지마다 하나씩** 보낸다.
   - 지시문에 넣을 것: `{run}` 절대 경로, 담당 파일 범위, "커밋 금지 - orchestrator가 병합", `docs/agent-rules/git-workflow.md`의 병렬 작업 절 읽기.
   - 완료 후 orchestrator가 worktree 브랜치를 작업 브랜치에 병합하고 직접 `git diff`, `pnpm exec tsc --noEmit`, `pnpm check`, `pnpm test`를 돌린다. 구현자의 "완료" 보고를 그대로 믿지 않는다. 충돌은 사용자에게 보고한다. 끝나면 `git worktree remove`.
7. T05와 T06을 **병렬**로 실행한다(읽기 전용). 리뷰 base 커밋을 지시문에 넣는다.
8. **리뷰 재판정 게이트**: orchestrator가 모든 finding을 실제 코드에서 확인한다.
   - 1차 리뷰에서 타당한 finding은 심각도와 관계없이 이번 사이클에서 재작업한다.
   - 2차 이후에는 Medium 이상만 자동 재작업, Low는 AskUserQuestion으로 "이번 사이클 / 백로그" 결정.
   - diff 밖 기존 코드 finding은 자동 재작업하지 않고 사용자에게 결정을 받는다.
   - 기각한 finding은 사유를 `triage-{n}.md`에 남긴다.
   - 재작업은 6번과 같은 방식(worktree)으로 하고, 재리뷰 범위는 이전 finding + 재작업 diff로 한정한다. 재작업은 최대 2회, 그 뒤에도 남으면 사용자에게 보고한다.
   - security-review에 Critical이 남아 있으면 다음 단계로 가지 않는다.
9. T07 실행. 실패면 결함을 frontend-developer에게 재작업으로 넘기고 T05/T06(재작업 diff 한정) → T07을 다시 돈다.
10. `TaskGet`으로 단계 전환마다 상태를 확인하고, 멈춘 팀원은 `SendMessage`로 원인을 묻는다. 1회 재시도 후에도 실패하면 재할당하거나 사용자에게 보고한다.
11. `summary.md` 작성: 무엇을 만들었나, 변경 파일, 리뷰·QA 결과, 남은 확인 필요, 제안 커밋 메시지(`git-workflow.md` 형식)와 PR 본문 초안.
12. **🔒 커밋·push·PR 승인 게이트**: 사용자가 승인하면 `git-commit` Skill로 진행한다.
13. `improvement-log.md`에 이번 실행에서 하네스가 막혔던 점을 남기고, 반영한 Bug Team 피드백의 포스트모텀 상태를 "반영됨"으로 바꾼다. `TeamDelete`로 팀을 정리한다.

## 3. 데이터 전달

- 진행 상태: `TaskCreate` / `TaskUpdate` / `TaskGet`
- 조율: `SendMessage` (질문, 차단, 발견 공유)
- 다음 단계가 반드시 읽어야 하는 것: `{run}/` 파일

## 4. 실패 처리

- 사용자 결정이 필요한 질문은 일반 텍스트가 아니라 AskUserQuestion으로 묻는다.
- 입력이 부족하면 추측하지 않고 묻는다.
- 백엔드 API가 없으면 구현 전에 사용자에게 알리고, mock으로 진행할지 결정받는다.
- 팀원 과반이 실패하면 현재 상태와 선택지를 보고한다.

## 5. 산출물 계약

```
artifacts/task-team/{run id}/
  00-input.md
  requirements.md        ← project-manager
  design-spec.md         ← designer
  impl-notes.md          ← frontend-developer
  code-review-{n}.md     ← code-reviewer
  security-review-{n}.md ← security-reviewer
  triage-{n}.md          ← orchestrator (기각 사유)
  qa-report-{n}.md       ← qa-engineer
  summary.md             ← orchestrator
  improvement-log.md     ← orchestrator
```
