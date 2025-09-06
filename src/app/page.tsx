"use client";

import React, { useState, useRef, useEffect } from "react";

const GlobePrototype = () => {
  const globeEl = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentGlobeIndex, setCurrentGlobeIndex] = useState(0);

  // 여행 패턴별 데이터
  const travelPatterns = [
    {
      title: "일본 마니아 + 아시아 탐험가",
      subtitle: "일본을 자주 방문하며 아시아를 중심으로 여행",
      countries: [
        {
          id: "JPN",
          name: "도쿄, 일본",
          flag: "🇯🇵",
          lat: 35.6762,
          lng: 139.6503,
          color: "#e91e63",
        },
        {
          id: "JPN2",
          name: "오사카, 일본",
          flag: "🇯🇵",
          lat: 34.6937,
          lng: 135.5023,
          color: "#e91e63",
        },
        {
          id: "JPN3",
          name: "교토, 일본",
          flag: "🇯🇵",
          lat: 35.0116,
          lng: 135.7681,
          color: "#e91e63",
        },
        {
          id: "KOR",
          name: "서울, 한국",
          flag: "🇰🇷",
          lat: 37.5665,
          lng: 126.978,
          color: "#9c27b0",
        },
        {
          id: "TWN",
          name: "타이베이, 대만",
          flag: "🇹🇼",
          lat: 25.033,
          lng: 121.5654,
          color: "#ff9800",
        },
        {
          id: "THA",
          name: "방콕, 태국",
          flag: "🇹🇭",
          lat: 13.7563,
          lng: 100.5018,
          color: "#4caf50",
        },
        {
          id: "SGP",
          name: "싱가포르",
          flag: "🇸🇬",
          lat: 1.3521,
          lng: 103.8198,
          color: "#2196f3",
        },
      ],
    },
    {
      title: "대륙별 균형 여행자",
      subtitle: "각 대륙을 고르게 탐험하는 글로벌 여행자",
      countries: [
        {
          id: "JPN",
          name: "도쿄, 일본",
          flag: "🇯🇵",
          lat: 35.6762,
          lng: 139.6503,
          color: "#e91e63",
        },
        {
          id: "USA",
          name: "뉴욕, 미국",
          flag: "🇺🇸",
          lat: 40.7128,
          lng: -74.006,
          color: "#2196f3",
        },
        {
          id: "FRA",
          name: "파리, 프랑스",
          flag: "🇫🇷",
          lat: 48.8566,
          lng: 2.3522,
          color: "#9c27b0",
        },
        {
          id: "EGY",
          name: "카이로, 이집트",
          flag: "🇪🇬",
          lat: 30.0444,
          lng: 31.2357,
          color: "#ff9800",
        },
        {
          id: "BRA",
          name: "리우데자네이루, 브라질",
          flag: "🇧🇷",
          lat: -22.9068,
          lng: -43.1729,
          color: "#4caf50",
        },
        {
          id: "AUS",
          name: "시드니, 호주",
          flag: "🇦🇺",
          lat: -33.8688,
          lng: 151.2093,
          color: "#ff5722",
        },
      ],
    },
    {
      title: "일본 + 유럽 러버",
      subtitle: "일본과 유럽을 중심으로 문화 탐방",
      countries: [
        {
          id: "JPN",
          name: "도쿄, 일본",
          flag: "🇯🇵",
          lat: 35.6762,
          lng: 139.6503,
          color: "#e91e63",
        },
        {
          id: "JPN2",
          name: "오사카, 일본",
          flag: "🇯🇵",
          lat: 34.6937,
          lng: 135.5023,
          color: "#e91e63",
        },
        {
          id: "FRA",
          name: "파리, 프랑스",
          flag: "🇫🇷",
          lat: 48.8566,
          lng: 2.3522,
          color: "#9c27b0",
        },
        {
          id: "ITA",
          name: "로마, 이탈리아",
          flag: "🇮🇹",
          lat: 41.9028,
          lng: 12.4964,
          color: "#ff9800",
        },
        {
          id: "ESP",
          name: "바르셀로나, 스페인",
          flag: "🇪🇸",
          lat: 41.3851,
          lng: 2.1734,
          color: "#4caf50",
        },
        {
          id: "GBR",
          name: "런던, 영국",
          flag: "🇬🇧",
          lat: 51.5074,
          lng: -0.1278,
          color: "#2196f3",
        },
        {
          id: "DEU",
          name: "베를린, 독일",
          flag: "🇩🇪",
          lat: 52.52,
          lng: 13.405,
          color: "#ff5722",
        },
        {
          id: "CHE",
          name: "취리히, 스위스",
          flag: "🇨🇭",
          lat: 47.3769,
          lng: 8.5417,
          color: "#795548",
        },
      ],
    },
  ];

  const currentPattern = travelPatterns[currentGlobeIndex];

  // 라벨이 있는 국가들 (travelPatterns에 정의된 모든 국가) - 국가명 기반
  const labeledCountries = new Set([
    'Japan', 'South Korea', 'Taiwan', 'Thailand', 'Singapore',
    'United States of America', 'France', 'Egypt', 'Brazil', 'Australia',
    'Italy', 'Spain', 'United Kingdom', 'Germany', 'Switzerland'
  ]);

  useEffect(() => {
    // Globe.gl 동적 로딩
    const loadGlobe = async () => {
      try {
        const Globe = (await import("globe.gl")).default;

        // 지구본 초기화
        if (!globeEl.current) return;

        // 기존 내용 제거
        globeEl.current.innerHTML = "";

        const globe = new Globe(globeEl.current)
          .globeImageUrl(
            "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          )
          .bumpImageUrl(
            "//unpkg.com/three-globe/example/img/earth-topology.png"
          )
          .backgroundImageUrl(
            "//unpkg.com/three-globe/example/img/night-sky.png"
          )
          .width(400)
          .height(400)
          .showGlobe(true)
          .showAtmosphere(true)
          .atmosphereColor("#4a90e2")
          .atmosphereAltitude(0.15);

        // 국가 데이터 로드
        fetch("//unpkg.com/world-atlas/countries-110m.json")
          .then((res) => res.json())
          .then(async (countries) => {
            const { feature } = await import('topojson-client');
            const geoData = feature(countries, countries.objects.countries);
            
            // 현재 패턴의 국가 ISO 코드 추출
            const countryISOCodes = currentPattern.countries.map((c) => {
              // 국가별 ISO 코드 매핑
              const isoMap: { [key: string]: string } = {
                JPN: "JPN",
                JPN2: "JPN",
                JPN3: "JPN",
                KOR: "KOR",
                TWN: "TWN",
                THA: "THA",
                SGP: "SGP",
                USA: "USA",
                FRA: "FRA",
                EGY: "EGY",
                BRA: "BRA",
                AUS: "AUS",
                ITA: "ITA",
                ESP: "ESP",
                GBR: "GBR",
                DEU: "DEU",
                CHE: "CHE",
              };
              return isoMap[c.id] || c.id;
            });

            const uniqueISOCodes = [...new Set(countryISOCodes)];

            globe
              .polygonsData((geoData as any).features) // 모든 국가를 포함
              .polygonCapColor((feat: any) => {
                const countryName = feat.properties?.name || feat.properties?.NAME || feat.properties?.ADMIN || feat.properties?.NAME_LONG;
                
                // 라벨이 없는 국가는 마스킹 처리 (매우 연한 회색)
                if (!labeledCountries.has(countryName)) {
                  return 'rgba(100, 100, 100, 0.1)';
                }
                
                const isoCode = feat.properties.ISO_A3;
                const countryData = currentPattern.countries.find((c: any) => {
                  const isoMap: { [key: string]: string } = {
                    JPN: "JPN",
                    JPN2: "JPN",
                    JPN3: "JPN",
                    KOR: "KOR",
                    TWN: "TWN",
                    THA: "THA",
                    SGP: "SGP",
                    USA: "USA",
                    FRA: "FRA",
                    EGY: "EGY",
                    BRA: "BRA",
                    AUS: "AUS",
                    ITA: "ITA",
                    ESP: "ESP",
                    GBR: "GBR",
                    DEU: "DEU",
                    CHE: "CHE",
                  };
                  return isoMap[c.id] === feat.properties.ISO_A3;
                });
                return selectedCountry === feat.properties.ISO_A3
                  ? countryData?.color || "#666666"
                  : "#666666";
              })
              .polygonSideColor((feat: any) => {
                const countryName = feat.properties?.name || feat.properties?.NAME || feat.properties?.ADMIN || feat.properties?.NAME_LONG;
                // 라벨이 없는 국가는 마스킹 처리
                if (!labeledCountries.has(countryName)) {
                  return 'rgba(80, 80, 80, 0.1)';
                }
                return "#333333";
              })
              .polygonStrokeColor((feat: any) => {
                const countryName = feat.properties?.name || feat.properties?.NAME || feat.properties?.ADMIN || feat.properties?.NAME_LONG;
                // 라벨이 없는 국가는 마스킹 처리
                if (!labeledCountries.has(countryName)) {
                  return 'rgba(120, 120, 120, 0.1)';
                }
                return "#111111";
              })
              .polygonAltitude(0.01)
              .polygonLabel((feat: any) => {
                const countryName = feat.properties?.name || feat.properties?.NAME || feat.properties?.ADMIN || feat.properties?.NAME_LONG;
                // 라벨이 없는 국가는 라벨을 표시하지 않음
                if (!labeledCountries.has(countryName)) {
                  return '';
                }
                return `🌍 ${countryName}`;
              })
              .onPolygonClick((polygon: any) => {
                const countryId = polygon.properties.ISO_A3;
                setSelectedCountry(countryId);

                // 해당 국가로 카메라 이동
                const countryData = currentPattern.countries.find((c: any) => {
                  const isoMap: { [key: string]: string } = {
                    JPN: "JPN",
                    JPN2: "JPN",
                    JPN3: "JPN",
                    KOR: "KOR",
                    TWN: "TWN",
                    THA: "THA",
                    SGP: "SGP",
                    USA: "USA",
                    FRA: "FRA",
                    EGY: "EGY",
                    BRA: "BRA",
                    AUS: "AUS",
                    ITA: "ITA",
                    ESP: "ESP",
                    GBR: "GBR",
                    DEU: "DEU",
                    CHE: "CHE",
                  };
                  return isoMap[c.id] === countryId;
                });
                if (countryData) {
                  globe.pointOfView(
                    { lat: countryData.lat, lng: countryData.lng, altitude: 2 },
                    1000
                  );
                }
              });
          });

        // HTML 라벨로 커스텀 디자인 적용
        globe
          .htmlElementsData(currentPattern.countries)
          .htmlLat((d: any) => d.lat)
          .htmlLng((d: any) => d.lng)
          .htmlAltitude(0.01)
          .htmlElement((d: any) => {
            const el = document.createElement("div");
            el.innerHTML = `
              <div style="
                background: rgba(255, 255, 255, 0.95);
                color: #333;
                padding: 8px 12px;
                border-radius: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(0, 0, 0, 0.1);
                cursor: pointer;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 6px;
                backdrop-filter: blur(10px);
                transition: all 0.2s ease;
              ">
                <span style="font-size: 16px;">${d.flag}</span>
                <span>${d.name}</span>
              </div>
            `;

            el.style.pointerEvents = "auto";
            el.style.cursor = "pointer";

            // 호버 효과
            const labelDiv = el.querySelector("div") as HTMLElement;
            el.addEventListener("mouseenter", () => {
              if (labelDiv) {
                labelDiv.style.transform = "scale(1.05)";
                labelDiv.style.background = "rgba(255, 255, 255, 1)";
                labelDiv.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
              }
            });

            el.addEventListener("mouseleave", () => {
              if (labelDiv) {
                labelDiv.style.transform = "scale(1)";
                labelDiv.style.background = "rgba(255, 255, 255, 0.95)";
                labelDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
              }
            });

            el.addEventListener("click", () => {
              setSelectedCountry(d.id);
              globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: 2 }, 1000);
            });

            return el;
          });

        // 자동 회전
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableZoom = true;

        // 초기 카메라 위치
        globe.pointOfView({ altitude: 2.5 });
      } catch (error) {
        console.error("Globe.gl 로딩 실패:", error);
        // 폴백 UI 표시
        if (globeEl.current) {
          globeEl.current.innerHTML = `
            <div style="
              width: 400px; 
              height: 400px; 
              background: radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              text-align: center;
            ">
              Globe.gl 로딩 중...<br/>
              인터넷 연결을 확인해주세요.
            </div>
          `;
        }
      }
    };

    loadGlobe();
  }, [selectedCountry, currentGlobeIndex]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 100%)",
        color: "white",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "white",
          }}
        >
          {currentPattern.title}
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#4a90e2",
            margin: 0,
            marginBottom: "20px",
          }}
        >
          {currentPattern.subtitle}
        </p>

        {/* 글로브 선택 버튼들 */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {travelPatterns.map((pattern, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentGlobeIndex(index);
                setSelectedCountry(null);
              }}
              style={{
                backgroundColor:
                  currentGlobeIndex === index
                    ? "#4a90e2"
                    : "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              패턴 {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Globe.gl 컨테이너 */}
      <div
        ref={globeEl}
        style={{
          marginBottom: "40px",
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      />

      {/* 선택된 국가 정보 */}
      {selectedCountry && (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "15px",
            padding: "20px",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {(() => {
            const country = currentPattern.countries.find(
              (c: any) => c.id === selectedCountry
            );
            return country ? (
              <>
                <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                  {country.flag}
                </div>
                <h3 style={{ margin: "0 0 5px 0", color: "white" }}>
                  {country.name}
                </h3>
                <button
                  onClick={() => setSelectedCountry(null)}
                  style={{
                    backgroundColor: country.color,
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 20px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  닫기
                </button>
              </>
            ) : null;
          })()}
        </div>
      )}

      {/* 안내 메시지 */}
      <p
        style={{
          color: "#8892b0",
          fontSize: "12px",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        위 버튼으로 다른 여행 패턴을 확인하고, 지구본을 드래그하여 회전시키며
        국가를 클릭해보세요
      </p>
    </div>
  );
};

export default GlobePrototype;
