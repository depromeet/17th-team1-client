const path = require("node:path");

// next lint --fix --file 형식으로 staged 파일만 대상으로 ESLint 실행
const buildNextLintCommand = filenames =>
  `next lint --fix --file ${filenames.map(f => path.relative(process.cwd(), f)).join(" --file ")}`;

/** @type {import('lint-staged').Configuration} */
module.exports = {
  // JS/TS 파일: ESLint auto-fix
  "*.{js,jsx,ts,tsx}": [buildNextLintCommand],
  // 모든 지원 파일: Prettier 자동 포맷
  "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"],
  // Claude/Codex 하네스 쌍 파일 동기화 검사 (파일 인자 없이 staged 전체를 본다)
  "{.claude/{agents,skills,hooks}/**,.codex/{agents,hooks}/**,.agents/skills/**}": () =>
    "sh scripts/check-agent-harness-sync.sh",
};
