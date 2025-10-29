# 지구본 마커 상태 구현

Figma 디자인(node-id: 178-13064)을 기반으로 지구본 페이지의 상태별 마커를 구현했습니다.

## 구현된 기능

### 1. 마커 상태 표시

#### 기록된 나라 (hasRecords: true)
- **표시**: 썸네일 이미지가 포함된 카드형 마커
- **조건**: 해당 국가 내 1개 이상의 도시 기록 시
- **구성요소**:
  - 국기 이모지
  - 국가명
  - 도시 개수 배지
  - 8도 회전된 썸네일 이미지 카드 (30x40px)

#### 모든 도시 미기록 (hasRecords: false)
- **표시**: + 아이콘만 표시된 기본형 마커
- **조건**: 해당 국가 내 모든 도시 미기록 시
- **구성요소**:
  - 국기 이모지
  - 국가명
  - 도시 개수 배지
  - + 아이콘 (기본형)

### 2. 대표 사진 노출 규칙
- 국가 내 여러 도시가 기록된 경우 **가장 최근에 기록된 사진**을 대표 이미지로 사용
- 썸네일이 없는 경우 그라데이션 배경으로 대체

## 파일 수정 내역

### 1. Type 정의 업데이트

#### `src/types/travelPatterns.ts`
```typescript
export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  hasRecords?: boolean; // 해당 국가 내 1개 이상의 도시 기록 여부
  thumbnailUrl?: string; // 가장 최근에 기록된 사진 (대표 이미지)
}
```

#### `src/types/clustering.ts`
```typescript
export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  hasRecords?: boolean; // 해당 국가 내 1개 이상의 도시 기록 여부
  thumbnailUrl?: string; // 가장 최근에 기록된 사진 (대표 이미지)
}
```

### 2. 렌더링 함수 업데이트

#### `src/utils/globeRenderer.ts`
`createCountryClusterHTML` 함수에 새로운 파라미터 추가:
- `hasRecords`: 기록 여부 (기본값: true)
- `thumbnailUrl`: 썸네일 이미지 URL

함수는 `hasRecords` 값에 따라 두 가지 다른 HTML을 생성:
1. `hasRecords === false`: + 아이콘이 있는 기본형 마커
2. `hasRecords === true`: 썸네일 이미지가 있는 카드형 마커

### 3. 스타일 업데이트

#### `src/styles/globeStyles.ts`
`createCountryClusterStyles` 함수에 `thumbnailCard` 스타일 추가:
- 크기: 30x40px
- 8도 회전 (`rotate(8deg)`)
- 테두리: 1px solid #b3daff
- 배경색: #112036 (썸네일 없을 경우)
- border-radius: 4px

### 4. Globe 컴포넌트 업데이트

#### `src/components/globe/Globe.tsx`
국가 클러스터 렌더링 시 `hasRecords`와 `thumbnailUrl` 값을 전달:
```typescript
const firstItem = clusterData.items?.[0];
const hasRecords = firstItem?.hasRecords ?? true;
const thumbnailUrl = firstItem?.thumbnailUrl;

el.innerHTML = createCountryClusterHTML(
  styles,
  clusterData.name,
  clusterData.count,
  clusterData.flag,
  mode === "city" && selectedClusterData !== null,
  hasRecords,
  thumbnailUrl,
);
```

### 5. 데이터 매퍼 업데이트

#### `src/utils/globeDataMapper.ts`
API 응답 데이터를 변환할 때 `hasRecords` 필드 추가:
```typescript
allCities.push({
  id: city.countryCode,
  name: city.name,
  flag: COUNTRY_CODE_TO_FLAG[city.countryCode] || "🌍",
  lat: city.lat,
  lng: city.lng,
  color: regionColor,
  hasRecords: true, // API 응답에 있는 도시는 모두 기록이 있는 것으로 간주
  // thumbnailUrl: city.thumbnailUrl, // TODO: API에서 thumbnailUrl 제공 시 추가
});
```

## 현재 상태

- ✅ 타입 정의 완료
- ✅ 마커 렌더링 로직 구현 완료
- ✅ 스타일 정의 완료
- ✅ Globe 컴포넌트 통합 완료
- ⏳ API에서 thumbnailUrl 제공 대기 중

## 향후 작업

### 1. API 업데이트 필요
백엔드 API(`/api/v1/globes/{uuid}`)가 다음 정보를 제공해야 합니다:
```typescript
export interface GlobeCity {
  name: string;
  lat: number;
  lng: number;
  countryCode: string;
  hasRecords?: boolean; // 추가 필요
  thumbnailUrl?: string; // 추가 필요
  lastRecordedAt?: string; // 정렬을 위한 최근 기록 시간
}
```

### 2. 테스트 데이터 추가
미기록 상태를 테스트하기 위해 `hasRecords: false`인 샘플 데이터 추가:
```typescript
// 테스트용 미기록 도시 추가 예시
{
  id: "US",
  name: "United States",
  flag: "🇺🇸",
  lat: 37.0902,
  lng: -95.7129,
  color: "#2196f3",
  hasRecords: false, // 미기록 상태
}
```

### 3. 이미지 로딩 최적화
- 썸네일 이미지 lazy loading
- 이미지 로드 실패 시 fallback 처리
- 이미지 캐싱 전략

## 디자인 스펙 (Figma)

- Node ID: 178-13064
- 마커 라벨: 
  - 배경: rgba(31, 74, 105, 0.5)
  - 테두리: #b3daff
  - backdrop-filter: blur(10px)
- 썸네일 카드:
  - 크기: 30x40px
  - 회전: 8도
  - 테두리: #b3daff
  - border-radius: 4px

## 사용 예시

현재 모든 도시는 기록이 있는 것으로 표시됩니다 (기본값: `hasRecords: true`).
미기록 상태를 테스트하려면 다음과 같이 데이터를 수정하세요:

```typescript
// globeDataMapper.ts에서
allCities.push({
  id: city.countryCode,
  name: city.name,
  flag: COUNTRY_CODE_TO_FLAG[city.countryCode] || "🌍",
  lat: city.lat,
  lng: city.lng,
  color: regionColor,
  hasRecords: false, // 이 값을 false로 변경하여 미기록 상태 테스트
  thumbnailUrl: "https://example.com/image.jpg", // 또는 실제 이미지 URL
});
```

## Z-depth 규칙

Figma 디자인에 따라 마커가 겹칠 경우:
- 대륙 > 국가 > 도시 순서로 Z-depth 적용
- 동일 좌표/영역에서 대륙 마커 우선 노출

현재 구현에서는 스타일의 `z-index` 값을 통해 이 규칙이 적용됩니다.
