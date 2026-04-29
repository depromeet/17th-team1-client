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
};
