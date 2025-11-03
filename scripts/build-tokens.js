const fs = require("fs");

// tokens.json 파일 읽기
const tokensData = JSON.parse(fs.readFileSync("./tokens.json", "utf8"));

// 토큰 참조를 해결하는 헬퍼 함수
function resolveReference(value, allTokens) {
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    const ref = value.slice(1, -1);

    // 모든 그룹에서 참조 토큰 찾기
    for (const groupName in allTokens) {
      const group = allTokens[groupName];
      if (group[ref] && group[ref].$value) {
        return resolveReference(group[ref].$value, allTokens);
      }
    }
  }
  return value;
}

const colors = {};

// 토큰 그룹을 처리하는 함수
const processTokenGroup = (groupData) => {
  Object.keys(groupData).forEach((key) => {
    const token = groupData[key];

    // 색상 토큰인지 확인
    if (token.$type === "color") {
      let cleanKey = key
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase()
        .replace(/^-+|-+$/g, "");

      // 숫자로 시작하는 경우 유효한 CSS 클래스명을 위해 접두사 추가
      if (/^\d/.test(cleanKey)) {
        cleanKey = "gray-" + cleanKey;
      }

      let value = token.$value;

      // 참조가 있으면 해결하기
      value = resolveReference(value, tokensData);

      // Tailwind를 위해 # 접두사 확인
      if (typeof value === "string" && !value.startsWith("#")) {
        value = "#" + value;
      }

      colors[cleanKey] = value;
    }
  });
};

// tokens.json의 모든 최상위 그룹 순회
Object.keys(tokensData).forEach((groupName) => {
  const group = tokensData[groupName];

  // 이 그룹 처리하기
  if (typeof group === "object" && group !== null) {
    processTokenGroup(group);
  }
});

// globals.css에 새로운 색상 토큰 업데이트
const generateCSSVariables = (colors) => {
  return Object.keys(colors)
    .map((key) => `  --color-${key}: ${colors[key]};`)
    .join("\n");
};

// 현재 globals.css 읽기
const globalsPath = "./src/app/globals.css";
const globalsContent = fs.readFileSync(globalsPath, "utf8");

// 새로운 CSS 변수 생성
const newCSSVariables = generateCSSVariables(colors);

// 색상 변수 섹션 교체
const startMarker = "  /* Design tokens from Figma */";

const startIndex = globalsContent.indexOf(startMarker);
if (startIndex !== -1) {
  // @theme 블록의 끝 찾기
  const themeStartIndex = globalsContent.lastIndexOf("@theme inline {", startIndex);
  let braceCount = 0;
  let endIndex = themeStartIndex;

  // 매칭되는 닫는 중괄호 찾기
  for (let i = themeStartIndex; i < globalsContent.length; i++) {
    if (globalsContent[i] === "{") braceCount++;
    if (globalsContent[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  // 새로운 변수를 삽입할 위치 찾기
  const beforeColors = globalsContent.substring(0, startIndex + startMarker.length);
  const afterTheme = globalsContent.substring(endIndex);

  const newGlobalsContent = `${beforeColors}
${newCSSVariables}
${afterTheme}`;

  fs.writeFileSync(globalsPath, newGlobalsContent);
  console.log("✅ globals.css에 새로운 색상 토큰이 업데이트되었습니다.");
} else {
  console.log("⚠️ globals.css에서 마커를 찾을 수 없습니다 - 수동 업데이트가 필요합니다.");
}

console.log("✅ 디자인 토큰이 globals.css에 성공적으로 적용되었습니다.");
console.log(`📊 ${Object.keys(colors).length}개의 색상 토큰이 생성되었습니다.`);
