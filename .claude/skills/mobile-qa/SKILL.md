---
name: mobile-qa
description: globber 화면을 512px 모바일 폭과 iOS/Android 에뮬레이션에서 확인하는 절차. qa-engineer의 수용 기준 확인, bug-localizer의 재현, bug-fixer의 수정 전후 확인에 사용한다. 정적 코드 리뷰에는 사용하지 않는다.
---

# 모바일 QA

## 1. 준비

1. dev 서버: `pnpm dev`를 백그라운드로 띄우고 `http://localhost:3000` 응답을 확인한다. 이미 떠 있으면 재사용한다. worktree 안이면 그 worktree에서 띄우고 포트를 바꾼다(`pnpm dev -p 3001`).
2. 로그인이 필요한 화면이면 사용자에게 테스트 계정 쿠키나 로그인 방법을 묻는다. 계정 정보를 산출물에 남기지 않는다.
3. 브라우저 도구: Playwright MCP(`mcp__playwright__*`) 우선, 없으면 chrome-devtools MCP.

## 2. 뷰포트

| 프로필    | 크기     | 비고                          |
| --------- | -------- | ----------------------------- |
| iPhone SE | 375×667  | 가장 좁은 폭                  |
| iPhone 14 | 390×844  | iOS 기본                      |
| Android   | 412×915  | Chrome                        |
| 데스크톱  | 1280×800 | 512px 컨테이너 중앙 정렬 확인 |

`browser_resize`로 크기를 바꾸고, 터치가 필요한 시나리오는 user agent/터치 에뮬레이션을 켠다.

## 3. 시나리오 확인

수용 기준(Given-When-Then)마다:

1. 해당 화면으로 이동해 상태를 만든다.
2. 동작을 수행한다.
3. 결과를 스냅샷/스크린샷으로 남긴다: `{run}/screenshots/{요구사항ID}-{프로필}.png`.
4. 콘솔 에러와 실패한 네트워크 요청을 확인한다.

## 4. 공통 체크리스트

- 가로 스크롤이 생기지 않는다(`document.documentElement.scrollWidth <= innerWidth`).
- 텍스트 겹침, 잘림, 버튼 터치 영역(최소 44px) 문제 없음.
- 하단 고정 UI가 safe-area·키보드에 가려지지 않는다.
- 입력 포커스 시 화면이 확대되지 않는다(iOS, `mobile-web.md`).
- 이미지 길게 누르기 시 저장 메뉴가 뜨지 않는다(드래그 영역).
- 로딩·빈 상태·에러 상태가 명세대로 보인다.

## 5. 에뮬레이션 한계

데스크톱 브라우저 에뮬레이션은 iOS Safari의 자동 줌, 롱프레스 메뉴, 키보드 리사이즈, HEIC 업로드를 완전히 재현하지 못한다. 이런 항목은 리포트에 **"실기기 확인 필요"**로 표시하고 확인 방법(기기, 단계)을 적어 사람에게 넘긴다.

## 6. 정리

띄운 dev 서버는 종료한다. 결과는 호출한 Agent의 산출물(`qa-report-{n}.md`, `localize.md`, `fix.md`)에 표로 남긴다.
