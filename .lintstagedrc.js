const path = require("node:path");

const WEB_DIR = path.resolve(__dirname, "apps/web");

// apps/web 하위의 staged 파일만 대상으로 ESLint 실행 (eslint 설정이 apps/web에 있으므로 해당 디렉토리에서 실행)
const buildWebLintCommand = filenames => {
  const webFiles = filenames.filter(f => f.startsWith(`${WEB_DIR}${path.sep}`));
  if (webFiles.length === 0) return [];
  return `pnpm --dir apps/web exec eslint --fix ${webFiles.map(f => JSON.stringify(f)).join(" ")}`;
};

/** @type {import('lint-staged').Configuration} */
module.exports = {
  // JS/TS 파일: ESLint auto-fix
  "*.{js,jsx,ts,tsx}": [buildWebLintCommand],
  // 모든 지원 파일: Prettier 자동 포맷
  "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"],
};
