---
name: cross-agent-handoff
description: Claude와 Codex 또는 서로 다른 세션 사이에 실제로 작업을 넘길 때 인계 파일(artifacts/work/{work-id}/STATUS.md, HANDOFF.md)을 작성·갱신한다. "Codex에게 넘겨", "Claude가 이어서", "다른 AI가 계속", "인계 문서 갱신", "다음 세션에서 이어서" 요청에 사용한다. 모델 전환 없는 작업, 단순 진행 보고, 일반 구현·리뷰에는 사용하지 않는다.
---

# Cross-Agent Handoff

먼저 `docs/agent-contracts/handoff.md`를 전부 읽고 그 절차를 따른다. 인계 파일의 경로·필수 항목·보관 규칙은 `artifacts/work/README.md`, 형식은 `artifacts/work/work-item-template.md`를 따른다.
