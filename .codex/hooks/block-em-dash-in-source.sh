#!/bin/sh
# PreToolUse(Edit|Write) 훅: src/ 하위 소스 파일에 em dash(—)를 쓰려는 Edit/Write를 작성 시점에 차단 (docs/agent-rules/code-conventions.md)
# 커밋 시점 검사는 scripts/check-em-dash-in-source.sh(lint-staged)가 담당

input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

case "$file_path" in
  src/*|*/src/*) ;;
  *) exit 0 ;;
esac

if [ "$tool_name" = "Write" ]; then
  content=$(printf '%s' "$input" | jq -r '.tool_input.content // empty' 2>/dev/null)
elif [ "$tool_name" = "Edit" ]; then
  content=$(printf '%s' "$input" | jq -r '.tool_input.new_string // empty' 2>/dev/null)
else
  exit 0
fi

if printf '%s' "$content" | grep -qF '—'; then
  echo "차단: $file_path 에 em dash(—)를 쓰려고 합니다. 하이픈(-)만 쓰세요." >&2
  exit 2
fi

exit 0
