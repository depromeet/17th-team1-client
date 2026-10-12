#!/bin/sh
# PreToolUse(Bash) 훅: docs/agent-rules/git-workflow.md의 고위험 git 명령을 기계적으로 차단한다.
# 여러 세션·worktree가 같은 저장소를 쓰므로 다른 작업을 지우거나 운영 배포(main push)를 일으키는 명령을 막는다.
# 사용자가 직접 승인한 경우에는 터미널에서 `! <command>`로 직접 실행한다.

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)

printf '%s' "$cmd" | grep -qE '(^|[;&|(]\s*)git\b' || exit 0

deny() {
  echo "차단: $1 (docs/agent-rules/git-workflow.md)" >&2
  exit 2
}

has() { printf "%s" "$cmd" | grep -qE -e "$1"; }

has '\bgit[[:space:]]+reset[[:space:]]+--hard\b' &&
  deny "git reset --hard 금지. 되돌려야 하면 사용자에게 보고하고 승인받으세요."
has '\bgit[[:space:]]+clean\b[^|;&]*-[a-zA-Z]*[fdx]' &&
  deny "git clean -f/-d/-x 금지. 다른 세션의 미커밋 변경까지 지웁니다."
has '\bgit[[:space:]]+branch[[:space:]]+(-D|--delete[[:space:]]+--force)\b' &&
  deny "git branch -D 금지. 다른 worktree가 쓰는 브랜치일 수 있습니다."
has '\bgit[[:space:]]+checkout[[:space:]]+(--[[:space:]]+)?\.[[:space:]]*($|[;&|])' &&
  deny "경로 없는 git checkout -- . 금지. 되돌릴 파일을 지정하세요."
has '\bgit[[:space:]]+restore[[:space:]]+(--[a-z-]+[[:space:]]+)*\.[[:space:]]*($|[;&|])' &&
  deny "경로 없는 git restore . 금지. 되돌릴 파일을 지정하세요."
has '\bgit[[:space:]]+stash[[:space:]]*($|[;&|])' &&
  deny "bare git stash 금지. stash는 모든 worktree가 공유합니다. 'git stash push -u -m \"<태그>\"'를 쓰세요."
has '\bgit[[:space:]]+stash[[:space:]]+(pop|drop|clear)\b' &&
  deny "git stash pop/drop/clear 금지. 다른 세션의 stash일 수 있습니다. 'git stash apply <sha>' 후 사용자 확인을 받으세요."
has '--no-verify\b' &&
  deny "--no-verify 금지. husky 훅 실패 원인을 고치세요."
has '\bgit[[:space:]]+push\b[^|;&]*(--force\b|--force-with-lease\b|[[:space:]]-f\b)' &&
  deny "force push 금지."
has '\bgit[[:space:]]+push\b[^|;&]*[[:space:]:]main\b' &&
  deny "main push 금지. main push는 운영 배포를 실행합니다. PR로만 병합하세요."
if has '\bgit[[:space:]]+push\b' && [ "$(git branch --show-current 2>/dev/null)" = "main" ]; then
  deny "main 브랜치에서 push 금지. 작업 브랜치를 만들어 PR로 올리세요."
fi

exit 0
